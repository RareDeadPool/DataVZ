import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useProjectCollab } from '@/hooks/useProjectCollab';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ChartRenderer } from './dashboard/ChartRenderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { Stepper } from '../ui/stepper';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ProjectWorkspace() {
  const { projectId } = useParams();
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [charts, setCharts] = useState([]);
  const [presenceList, setPresenceList] = useState([]);
  const [showChartModal, setShowChartModal] = useState(false);
  const [newChart, setNewChart] = useState({ type: 'bar', xKey: '', yKey: '', title: '' });
  // Add state for editing chart
  const [editingChartId, setEditingChartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [allTeams, setAllTeams] = useState([]);
  // Change selectedTeamId to be a string for Radix UI <Select> (single select)
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(false);
  // Add userRole state
  const [userRole, setUserRole] = useState('');

  // Add back missing uploadedFiles and selectedSheet state
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{ name, sheets: [{ name, data }] }]
  const [selectedSheet, setSelectedSheet] = useState({}); // { fileIdx: sheetIdx }

  // Stepper state
  const [step, setStep] = useState(0); // 0: Upload, 1: Team, 2: Charts/Page
  const steps = [
    { label: 'Upload Data', description: 'Upload Excel or CSV files to get started.' },
    { label: 'Select Team', description: 'Choose or create a team for this project.' },
    { label: 'Charts & Layout', description: 'Create charts and arrange your workspace.' },
  ];

  // Chart modal file/sheet selection state and helpers (must be at top level)
  const [chartFileIdx, setChartFileIdx] = useState(0);
  const [chartSheetIdx, setChartSheetIdx] = useState(0);
  const chartSheetData = uploadedFiles[chartFileIdx]?.sheets?.[chartSheetIdx]?.data || [];
  const chartSheetColumns = chartSheetData[0] ? Object.keys(chartSheetData[0]) : [];

  // Helper to auto-save project progress
  const saveProjectProgress = useCallback(async (fields) => {
    if (!projectId) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(fields),
    });
  }, [projectId]);

  // Upload Excel file (single upload area)
  const onDrop = async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        const sheets = workbook.SheetNames.map(name => ({
          name,
          data: XLSX.utils.sheet_to_json(workbook.Sheets[name])
        }));
        setUploadedFiles(prev => {
          const updated = [...prev, { name: file.name, sheets }];
          saveProjectProgress({ uploadedFiles: updated });
          return updated;
        });
      } catch (err) {
        toast.error('Failed to parse Excel file.');
      }
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], 'application/vnd.ms-excel': [], 'text/csv': [] }, multiple: true });

  // Remove sectioned workspace state and related logic

  // Helper to get unique key for section/file
  const getSectionFileKey = (sectionId, fileIdx) => `${sectionId}_${fileIdx}`;

  const fileInputRef = useRef();

  // Real-time collaboration
  const handleDataEditCollab = useCallback((change) => setExcelData(change), []);
  const handleChartEditCollab = useCallback((chart) => {
    if (chart.type === 'reorder' && Array.isArray(chart.order)) {
      setCharts(prev => {
        // Reorder charts according to the received order
        const chartMap = Object.fromEntries(prev.map(c => [c._id, c]));
        return chart.order.map(id => chartMap[id]).filter(Boolean);
      });
      return;
    }
    setCharts(prev => {
      // Replace or add chart by id
      const idx = prev.findIndex(c => c._id === chart._id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = chart;
        return updated;
      }
      return [...prev, chart];
    });
  }, []);
  const handlePresenceCollab = useCallback((presence) => setPresenceList(presence), []);

  const { socket, sendDataEdit, sendChartEdit, sendPresence } = useProjectCollab(projectId, user, {
    onDataEdit: handleDataEditCollab,
    onChartEdit: handleChartEditCollab,
    onPresence: handlePresenceCollab,
  });

  // Load project data on mount
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Project not found or access denied.');
        const data = await res.json();
        setProject(data);
        setExcelData(data.excelData || []);
        setUploadedFiles(data.uploadedFiles || []);
        setCharts(data.charts || []);
        setTeams(data.teams || []); // <-- Set teams from backend
        setUserRole(data.userRole);
        // If excelData is empty but uploadedFiles exist, set excelData to first sheet
        if ((data.excelData && data.excelData.length > 0)) {
          setExcelData(data.excelData);
        } else if (data.uploadedFiles && data.uploadedFiles.length > 0 && data.uploadedFiles[0].sheets && data.uploadedFiles[0].sheets.length > 0) {
          setExcelData(data.uploadedFiles[0].sheets[0].data || []);
        } else {
          setExcelData([]);
        }
        // Auto-advance stepper based on progress
        if ((data.uploadedFiles?.length > 0 || data.excelData?.length > 0) && (data.teams?.length > 0)) {
          setStep(2);
        } else if (data.uploadedFiles?.length > 0 || data.excelData?.length > 0) {
          setStep(1);
        } else {
          setStep(0);
        }
      } catch (err) {
        setError(err.message || 'Failed to load project.');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  // Broadcast presence on mount
  useEffect(() => {
    if (projectId && user) {
      sendPresence({ user });
    }
    // eslint-disable-next-line
  }, [projectId, user]);

  // Example: handle local Excel data edit
  const handleDataEdit = (newData) => {
    setExcelData(newData);
    sendDataEdit(newData);
  };

  // Handle chart edit (open modal with chart data)
  const handleEditChart = (chart) => {
    setNewChart(chart);
    setEditingChartId(chart._id);
    setShowChartModal(true);
  };

  // Handle chart delete
  const handleDeleteChart = (chartId) => {
    setCharts(prev => prev.filter(c => c._id !== chartId));
    // Broadcast delete to others
    sendChartEdit({ _id: chartId, deleted: true });
  };

  // Update handleChartEdit to handle both create and edit
  const handleChartEdit = (chart) => {
    let updatedCharts;
    if (chart.deleted) {
      updatedCharts = charts.filter(c => c._id !== chart._id);
    } else {
      const idx = charts.findIndex(c => c._id === chart._id);
      if (idx !== -1) {
        updatedCharts = [...charts];
        updatedCharts[idx] = chart;
      } else {
        updatedCharts = [...charts, chart];
      }
    }
    setCharts(updatedCharts);
    saveProjectProgress({ charts: updatedCharts });
    sendChartEdit(chart);
    setShowChartModal(false);
    setEditingChartId(null);
    setNewChart({ type: 'bar', xKey: '', yKey: '', title: '' });
  };

  // Update chart modal to handle both create and edit
  const handleChartModalSave = () => {
    const chart = {
      ...newChart,
      _id: editingChartId || Date.now().toString(),
      data: excelData,
    };
    handleChartEdit(chart);
  };

  // Handle chart creation
  const handleCreateChart = () => {
    const chart = {
      ...newChart,
      _id: Date.now().toString(), // Temporary unique ID
      data: excelData,
    };
    handleChartEdit(chart);
    setShowChartModal(false);
    setNewChart({ type: 'bar', xKey: '', yKey: '', title: '' });
  };

  // Excel file upload handler
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setExcelData(json);
      toast.success('Excel data uploaded!');
    } catch (err) {
      toast.error('Failed to parse Excel file.');
    }
  };

  // Fetch all teams for dropdown
  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL.replace('/api','')}/api/teams`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAllTeams(data);
      } catch (err) {
        setAllTeams([]);
      } finally {
        setLoadingTeams(false);
      }
    };
    if (showTeamDialog) fetchTeams();
  }, [showTeamDialog]);

  // Add team handler (dropdown version)
  const handleAddTeam = async () => {
    if (!selectedTeamId) return;
    setLoadingTeams(true);
    try {
      const token = localStorage.getItem('token');
      // Persist to backend
      const res = await fetch(`${API_URL}/projects/${projectId}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teamId: selectedTeamId })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add team');
      }
      // Fetch updated project to get full teams list
      const projectRes = await fetch(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (projectRes.ok) {
        const updatedProject = await projectRes.json();
        setTeams(updatedProject.teams || []);
      }
      setShowTeamDialog(false);
      setSelectedTeamId('');
      toast.success('Team added!');
    } catch (err) {
      toast.error(err.message || 'Failed to add team');
    } finally {
      setLoadingTeams(false);
    }
  };

  // After creating a team, refresh the team list and allow selection
  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    setLoadingTeams(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL.replace('/api','')}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTeamName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create team');
      // Refresh the team list
      await fetchTeams();
      setSelectedTeamId(data._id);
      setShowTeamDialog(false);
      toast.success('Team created!');
    } catch (err) {
      toast.error(err.message || 'Failed to create team');
    } finally {
      setLoadingTeams(false);
    }
  };

  // Listen for real-time team updates
  useEffect(() => {
    if (!socket) return;
    const handleTeamAdded = (team) => {
      setTeams(prev => [...prev, team]);
    };
    socket.on('team-added', handleTeamAdded);
    return () => {
      socket.off('team-added', handleTeamAdded);
    };
  }, [socket]);

  // Remove early return for !project, show workspace with loading state instead
  if (loading) return <div className="p-6">Loading project workspace...</div>;
  if (error) return <div className="p-6 text-red-500">{error} <Button onClick={() => navigate('/projects')}>Back to Projects</Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <Stepper steps={steps} currentStep={step} onStepChange={setStep} />
      {step === 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Upload Excel/CSV Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div {...getRootProps()} className={`w-full p-8 border-2 border-dashed rounded-lg bg-background flex flex-col items-center justify-center cursor-pointer transition ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted'}`}
              style={{ minHeight: 180 }}>
              <input {...getInputProps()} />
              <span className="text-muted-foreground mb-2 text-base">Drag and drop files here, or click to select files</span>
              <Button size="sm" variant="outline">Browse Files</Button>
            </div>
            {uploadedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-6 p-4 rounded bg-muted/50 border border-dashed border-muted-foreground">
                <span className="text-muted-foreground text-lg font-semibold mb-2">No Excel files uploaded yet.</span>
                <span className="text-xs text-muted-foreground">Start by uploading your data file.</span>
              </div>
            ) : (
              <div className="w-full mt-4">
                <div className="font-semibold mb-2">Uploaded Files:</div>
                <ul className="space-y-2">
                  {uploadedFiles.map((file, fileIdx) => (
                    <li key={file.name + fileIdx} className="border rounded p-2 bg-background">
                      <div className="font-semibold text-sm">{file.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs">Sheets:</span>
                        {file.sheets.map((sheet, sheetIdx) => (
                          <Button
                            key={sheet.name}
                            size="xs"
                            variant={selectedSheet[fileIdx] === sheetIdx ? 'default' : 'outline'}
                            onClick={() => {
                              setSelectedSheet(sel => ({ ...sel, [fileIdx]: sheetIdx }));
                              setExcelData(uploadedFiles[fileIdx].sheets[sheetIdx].data); // <-- Update excelData on sheet select
                            }}
                          >
                            {sheet.name}
                          </Button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button className="mt-6 w-full max-w-xs" size="lg" onClick={() => setStep(1)} disabled={uploadedFiles.length === 0}>Next: Select Team</Button>
          </CardContent>
        </Card>
      )}
      {step === 1 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Select Team(s)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTeams ? (
              <div className="flex flex-col items-center justify-center p-4 rounded bg-muted/50 border border-dashed border-muted-foreground">
                <span className="text-muted-foreground text-lg font-semibold mb-2">Loading teams...</span>
              </div>
            ) : allTeams.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-4 rounded bg-muted/50 border border-dashed border-muted-foreground">
                <span className="text-muted-foreground mb-2 text-lg font-semibold">No teams available to add.</span>
                <Button size="lg" className="w-full max-w-xs" onClick={() => setShowTeamDialog(true)}>
                  + Create Team
                </Button>
                <span className="text-xs text-muted-foreground">You need to create a team before proceeding.</span>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Select one or more teams (optional)</label>
                <select
                  multiple
                  value={selectedTeamId}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedTeamId(options);
                  }}
                  className="border rounded p-2 w-full h-32"
                >
                  {allTeams.map(team => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button
                onClick={async () => {
                  setLoadingTeams(true);
                  try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/projects/${projectId}/teams`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ teamIds: selectedTeamId })
                    });
                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.error || 'Failed to set teams');
                    }
                    // Get the updated project from backend
                    const updatedProject = await res.json();
                    // Find the full team objects for the selected IDs
                    setTeams(allTeams.filter(t => selectedTeamId.includes(t._id)));
                    setSelectedTeamId([]);
                    setStep(2);
                  } catch (err) {
                    toast.error(err.message || 'Failed to set teams');
                  } finally {
                    setLoadingTeams(false);
                  }
                }}
                disabled={loadingTeams}
              >
                Next: Chart Generation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {step === 2 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Chart Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Charts</h3>
                <Button size="sm" onClick={() => setShowChartModal(true)} title="Create a new chart">+ Create Chart</Button>
              </div>
              <div id="chart-dnd-area">
                <DragDropContext
                  onDragEnd={(result) => {
                    if (!result.destination) return;
                    const reordered = Array.from(charts);
                    const [removed] = reordered.splice(result.source.index, 1);
                    reordered.splice(result.destination.index, 0, removed);
                    setCharts(reordered);
                    // Broadcast new order to collaborators
                    sendChartEdit({ type: 'reorder', order: reordered.map(c => c._id) });
                  }}
                >
                  <Droppable droppableId="charts-droppable">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {charts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-4 rounded bg-muted/50 border border-dashed border-muted-foreground">
                            <span className="text-muted-foreground text-lg font-semibold mb-2">No charts yet.</span>
                            <Button size='xs' variant='outline' onClick={() => setShowChartModal(true)}>Create a Chart</Button>
                          </div>
                        ) : (
                          charts.map((chart, idx) => (
                            <Draggable key={chart._id} draggableId={chart._id} index={idx}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`mb-4 ${snapshot.isDragging ? 'bg-blue-50' : ''}`}
                                >
                                  <ChartRenderer {...chart} />
                                  <div className="flex gap-2 mt-1">
                                    <Button size="xs" variant="outline" onClick={() => handleEditChart(chart)} title="Edit this chart">Edit</Button>
                                    <Button size="xs" variant="destructive" onClick={() => handleDeleteChart(chart._id)} title="Delete this chart">Delete</Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="outline" onClick={async () => {
                  const chartArea = document.getElementById('chart-dnd-area');
                  if (!chartArea) return;
                  const canvas = await html2canvas(chartArea);
                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
                  const pageWidth = pdf.internal.pageSize.getWidth();
                  const pageHeight = pdf.internal.pageSize.getHeight();
                  const imgWidth = pageWidth;
                  const imgHeight = canvas.height * (imgWidth / canvas.width);
                  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                  pdf.save('charts.pdf');
                }}>Export as PDF</Button>
                <Button variant="outline" onClick={async () => {
                  const chartArea = document.getElementById('chart-dnd-area');
                  if (!chartArea) return;
                  const canvas = await html2canvas(chartArea);
                  const link = document.createElement('a');
                  link.download = 'charts.png';
                  link.href = canvas.toDataURL('image/png');
                  link.click();
                }}>Export as Image</Button>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Page Layout & Export</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground text-xs">Drag and drop charts here to arrange your page. Export as PDF/PNG.</div>
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Teams in this Project</CardTitle>
              <Button size="sm" className="ml-2" onClick={() => setShowTeamDialog(true)} title="Add a new team to this project">+ Add Team</Button>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                <ul className="list-disc ml-6">
                  {teams.map((team, idx) => (
                    <li key={team._id || team.name || idx}>{team.name}</li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 rounded bg-muted/50 border border-dashed border-muted-foreground">
                  <span className="text-muted-foreground text-lg font-semibold mb-2">No teams yet.</span>
                  <Button size='xs' variant='outline' onClick={() => setShowTeamDialog(true)}>Add a Team</Button>
                </div>
              )}
              {presenceList.length > 0 && (
                <div className="flex gap-2 items-center text-xs text-muted-foreground mt-2">
                  <span>Present:</span>
                  {presenceList.map((p, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 rounded px-2 py-1">{p.user?.name || 'User'}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Excel Data</CardTitle>
            </CardHeader>
            <CardContent>
              {excelData.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4 rounded bg-muted/50 border border-dashed border-muted-foreground">
                  <span className="text-muted-foreground text-lg font-semibold mb-2">No data available.</span>
                  <span className="text-xs text-muted-foreground mb-2">Please upload or link an Excel file to this project.</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleExcelUpload}
                  />
                  <Button size="sm" onClick={() => fileInputRef.current.click()} title="Upload Excel or CSV data">Upload Excel/CSV</Button>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr>
                        {excelData[0] && Object.keys(excelData[0]).map((key) => (
                          <th key={key} className="px-2 py-1 bg-gray-100 border-b font-semibold" title={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.map((row, i) => (
                        <tr key={i} className="border-b">
                          {Object.keys(row).map((key) => (
                            <td key={key} className="px-2 py-1" title={row[key]}>{row[key]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      {/* Welcome/empty state */}
      {excelData.length === 0 && charts.length === 0 && teams.length === 0 && (
        <div className="bg-muted/60 p-8 rounded-lg text-center text-muted-foreground mb-4 border border-dashed border-muted-foreground flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to your Project Workspace!</h2>
          <p className="mb-2 text-base">Get started by uploading Excel data, adding a team, or creating your first chart.</p>
        </div>
      )}
      {/* The rest of the workspace (team list, data table, charts, dialogs) will be refactored in the next step */}
      {/* Chart Creation Modal */}
      {/* Add state for selected file and sheet in chart modal */}
      {/* Helper to get current sheet data for chart modal */}
      {/* Helper to get current sheet columns for chart modal */}

      <Dialog open={showChartModal} onOpenChange={setShowChartModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{editingChartId ? 'Edit Chart' : 'Create Chart'}</DialogTitle>
            <DialogDescription>
              {editingChartId ? 'Update your chart settings below.' : 'Fill in the details to create a new chart.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* File and Sheet selection */}
            {uploadedFiles.length > 0 && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">File</label>
                  <select
                    value={chartFileIdx}
                    onChange={e => {
                      setChartFileIdx(Number(e.target.value));
                      setChartSheetIdx(0); // Reset sheet selection when file changes
                    }}
                    className="border rounded p-2 w-full"
                  >
                    {uploadedFiles.map((file, idx) => (
                      <option key={file.name + idx} value={idx}>{file.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Sheet</label>
                  <select
                    value={chartSheetIdx}
                    onChange={e => setChartSheetIdx(Number(e.target.value))}
                    className="border rounded p-2 w-full"
                  >
                    {uploadedFiles[chartFileIdx]?.sheets.map((sheet, idx) => (
                      <option key={sheet.name + idx} value={idx}>{sheet.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Chart Type</label>
              <select value={newChart.type} onChange={e => setNewChart(c => ({ ...c, type: e.target.value }))} className="border rounded p-2 w-full">
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
                <option value="doughnut">Doughnut</option>
                <option value="scatter">Scatter</option>
                <option value="area">Area</option>
                <option value="radar">Radar</option>
                <option value="polar">Polar</option>
                <option value="bubble">Bubble</option>
                <option value="3d">3D Column</option>
                <option value="3dPie">3D Pie</option>
                <option value="3dScatter">3D Scatter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input value={newChart.title} onChange={e => setNewChart(c => ({ ...c, title: e.target.value }))} placeholder="Chart title" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">X Axis</label>
                <select value={newChart.xKey} onChange={e => setNewChart(c => ({ ...c, xKey: e.target.value }))} className="border rounded p-2 w-full">
                  <option value="">Select</option>
                  {chartSheetColumns.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Y Axis</label>
                <select value={newChart.yKey} onChange={e => setNewChart(c => ({ ...c, yKey: e.target.value }))} className="border rounded p-2 w-full">
                  <option value="">Select</option>
                  {chartSheetColumns.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowChartModal(false)}>Cancel</Button>
              <Button onClick={() => {
                // Save chart with selected sheet data
                handleChartEdit({
                  ...newChart,
                  _id: editingChartId || Date.now().toString(),
                  data: chartSheetData,
                });
              }} disabled={!newChart.xKey || !newChart.yKey}>{editingChartId ? 'Save Changes' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Add Team Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Team to Project</DialogTitle>
            <DialogDescription>
              Select an existing team or create a new one to collaborate on this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {loadingTeams ? (
              <div className="text-muted-foreground">Loading teams...</div>
            ) : allTeams.filter(t => !teams.some(pt => pt._id === t._id)).length === 0 ? (
              <div className="text-muted-foreground">No teams available to add.</div>
            ) : (
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {allTeams.filter(t => !teams.some(pt => pt._id === t._id)).map(team => (
                    <SelectItem key={team._id} value={team._id}>{team.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setShowTeamDialog(false)}>Cancel</Button>
              <Button onClick={handleAddTeam} disabled={!selectedTeamId || loadingTeams}>Add Team</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 