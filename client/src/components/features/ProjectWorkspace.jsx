import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileSpreadsheet, 
  BarChart3, 
  Users, 
  Download, 
  Plus, 
  Settings, 
  Eye,
  Trash2,
  Edit,
  GripVertical,
  FileText,
  PieChart,
  TrendingUp,
  Zap,
  InfoIcon
} from 'lucide-react';
import { FileUploadZone } from './FileUploadZone';
import { ChartGrid } from './ChartGrid';
import { DataTable } from './DataTable';

import { ChartCreationModal } from './ChartCreationModal';
import { ExportActions } from './ExportActions';
import { WorkflowStepper } from './WorkflowStepper';
import { getUploadsByProject, getProjectById, getCharts, createChart, updateChart, deleteChart, uploadExcelFile, deleteUpload } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import api from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Index = () => {
  const { projectId } = useParams();
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [charts, setCharts] = useState([]);

  const [excelData, setExcelData] = useState([]);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [showChartModal, setShowChartModal] = useState(false);
  const [editingChart, setEditingChart] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [chartError, setChartError] = useState("");

  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileError, setFileError] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);



  // Calculate overall progress
  const calculateProgress = () => {
    let progress = 0;
    if (uploadedFiles.length > 0) progress += 50;
    if (charts.length > 0) progress += 50;
    return progress;
  };

  const progress = calculateProgress();

  // Fetch uploaded files for the project
  useEffect(() => {
    const fetchFiles = async () => {
      setLoadingFiles(true);
      setFileError("");
      try {
        if (!projectId) return;
        const files = await getUploadsByProject(projectId);
        setUploadedFiles(files);
        // Auto-select the first file if none is selected and files exist
        if (files.length > 0 && !selectedFileId) {
          const firstFileId = files[0]._id || files[0].id;
          setSelectedFileId(firstFileId);
          handleFileSelect(firstFileId);
        }
      } catch (err) {
        setFileError(err.message);
      } finally {
        setLoadingFiles(false);
      }
    };
    fetchFiles();
    // Only run when projectId changes, not selectedFileId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Fetch project details on mount
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      setProjectLoading(true);
      setProjectError(null);
      
      console.log('Fetching project:', projectId);
      
      try {
        const projectData = await getProjectById(projectId);
        console.log('Project data:', projectData);
        setProject(projectData);
      } catch (err) {
        setProjectError(err.message);
        console.error('Error fetching project:', err);
      } finally {
        setProjectLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // File upload handler
  const handleFileUpload = async (file) => {
    setFileError("");
    try {
      console.log('Uploading file with projectId:', projectId); // Debug
      const result = await uploadExcelFile(file, projectId);
      // Re-fetch files after upload
      const files = await getUploadsByProject(projectId);
      setUploadedFiles(files);
      // Auto-select and preview the newly uploaded file
      if (files.length > 0) {
        // Try to find the file by filename (since backend returns preview and id)
        const uploaded = files.find(f => f.filename === file.name) || files[0];
        setSelectedFileId(uploaded._id || uploaded.id);
        handleFileSelect(uploaded._id || uploaded.id);
      }
    } catch (err) {
      setFileError(err.message);
    }
  };

  // File delete handler
  const handleFileDelete = async (fileId) => {
    setFileError("");
    setLoadingFiles(true);
    try {
      await deleteUpload(fileId);
      setUploadedFiles(prev => prev.filter(f => (f._id || f.id) !== fileId));
    } catch (err) {
      setFileError(err.message);
    } finally {
      setLoadingFiles(false);
    }
  };

  // Fetch charts for the project
  useEffect(() => {
    const fetchCharts = async () => {
      setLoadingCharts(true);
      setChartError("");
      try {
        const charts = await getCharts(projectId);
        setCharts(charts);
      } catch (err) {
        setChartError(err.message);
      } finally {
        setLoadingCharts(false);
      }
    };
    fetchCharts();
  }, [projectId]);

  // Chart creation handler
  const handleCreateChart = async (chartData) => {
    setChartError("");
    try {
      const newChart = await createChart({ ...chartData, projectId });
      setCharts(prev => [...prev, newChart]);
      setShowChartModal(false);
    } catch (err) {
      setChartError(err.message);
    }
  };

  // Chart delete handler
  const handleDeleteChart = async (chartId) => {
    setChartError("");
    try {
      await deleteChart(chartId);
      setCharts(prev => prev.filter(c => c._id !== chartId));
    } catch (err) {
      setChartError(err.message);
    }
  };

  // Chart edit handler
  const handleEditChart = async (chartData) => {
    setChartError("");
    try {
      const updatedChart = await updateChart(chartData._id || chartData.id, chartData);
      setCharts(prev => prev.map(c => (c._id === updatedChart._id ? updatedChart : c)));
      setShowChartModal(false);
      setEditingChart(null);
    } catch (err) {
      setChartError(err.message);
    }
  };



  // Update allUsers to only include owner and collaborators
  useEffect(() => {
    if (!project) return;
    // Collect all unique users from owner and collaborators
    const usersMap = {};
    // Owner
    usersMap[project.owner] = { _id: project.owner, name: 'Owner', role: 'owner' };
    // Collaborators
    (project.collaborators || []).forEach(c => {
      usersMap[c.userId] = { _id: c.userId, name: c.name, role: c.role };
    });
    setAllUsers(Object.values(usersMap));
  }, [project]);

  // DataTable: fetch data for selected file
  const handleFileSelect = async (fileId) => {
    setSelectedFileId(fileId);
    try {
      const file = await getUploadById(fileId);
      console.log('Fetched file for preview:', file); // Debug log
      // Use preview if available, otherwise fall back to data
      const previewData = (file.preview && Array.isArray(file.preview) && file.preview.length > 0)
        ? file.preview
        : (file.data && Array.isArray(file.data) && file.data.length > 0)
          ? file.data
          : [];
      setExcelData(previewData);
    } catch (err) {
      setExcelData([]);
    }
  };

  // Show loading state
  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project workspace...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (projectError) {
    return (
      <div className="min-h-screen bg-background dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <InfoIcon className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to Load Project</h2>
          <p className="text-muted-foreground mb-4">{projectError}</p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/projects')} className="w-full">
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!project) {
    return (
      <div className="min-h-screen bg-background dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/projects')} className="w-full">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#0a0f1a] border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground dark:text-white">
                  {typeof project.name === 'string' ? project.name : (project.name?.name || 'Project Workspace')}
                </h1>
                <p className="text-sm text-muted-foreground">Data visualization workspace</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Active Users Avatars */}
              <div className="flex -space-x-2">
                {allUsers.map(u => (
                  <Avatar key={u._id} className="h-8 w-8 border-2 border-white dark:border-zinc-900">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback>{u.name ? u.name[0].toUpperCase() : '?'}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Badge variant="outline" className="hidden sm:flex">
                <Zap className="w-3 h-3 mr-1 text-primary" />
                {progress}% Complete
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Progress Overview */}
        <Card className="mb-8 bg-white dark:bg-[#0a0f1a] border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-foreground dark:text-white">Workspace Progress</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Track your data visualization workflow
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground dark:text-white">{progress}%</div>
                <div className="text-sm text-primary">Complete</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 mb-4 bg-primary/20 dark:bg-primary/30" />
            <WorkflowStepper 
              currentStep={workflowStep} 
              onStepChange={setWorkflowStep}
              uploadedFiles={uploadedFiles}
              charts={charts}
              monochrome
            />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-[#0a0f1a] border border-border">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">Files Uploaded</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">{uploadedFiles.length}</p>
                    </div>
                    <FileSpreadsheet className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">Charts Created</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">{charts.length}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>

                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">Data Rows</p>
                      <p className="text-2xl font-bold text-foreground dark:text-white">{excelData.length}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with these common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="h-24 flex flex-col items-center justify-center space-y-2 bg-white dark:bg-[#0a0f1a] text-primary border border-border"
                    variant="outline"
                    onClick={() => setActiveTab('data')}
                  >
                    <Upload className="w-6 h-6" />
                    <span>Upload Data</span>
                  </Button>
                  
                  <Button 
                    className="h-24 flex flex-col items-center justify-center space-y-2 bg-white dark:bg-[#0a0f1a] text-primary border border-border"
                    variant="outline"
                    onClick={() => setShowChartModal(true)}
                  >
                    <Plus className="w-6 h-6" />
                    <span>Create Chart</span>
                  </Button>
                  

                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-[#0a0f1a] border border-border">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Sales_Data_2024.xlsx uploaded</span>
                    <span className="text-slate-400 ml-auto">2 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">Monthly Sales Trend chart created</span>
                    <span className="text-slate-400 ml-auto">5 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <span className="text-muted-foreground">Project updated successfully</span>
                    <span className="text-slate-400 ml-auto">10 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="mb-2 text-primary text-sm font-medium flex items-center gap-2">
              <InfoIcon className="w-4 h-4" />
                                    All project members can see and use uploaded files.
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Files
                    </CardTitle>
                    <CardDescription>
                      Drag and drop Excel or CSV files
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Uploaded files list with uploader info and delete restriction */}
                    <div className="mb-4 space-y-2">
                      {uploadedFiles.map(file => (
                        <div key={file._id || file.id} className={`flex items-center justify-between p-2 rounded border ${selectedFileId === (file._id || file.id) ? 'border-primary/40 bg-primary/10' : 'border-border'}`}> 
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleFileSelect(file._id || file.id)}>
                            <FileSpreadsheet className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground dark:text-white">{file.filename}</span>
                            {file.userId && file.userId.name && (
                              <span className="ml-2 flex items-center gap-1 text-xs text-muted-foreground">
                                {file.userId.avatar && <img src={file.userId.avatar} alt="avatar" className="w-5 h-5 rounded-full" />}
                                Uploaded by {file.userId.name}
                              </span>
                            )}
                          </div>
                          {(user && (file.userId && file.userId._id === user._id || (project && project.owner === user._id))) ? (
                            <Button size="icon" variant="ghost" onClick={() => handleFileDelete(file._id || file.id)} title="Delete file">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <FileUploadZone 
                      onFilesUploaded={setUploadedFiles}
                      uploadedFiles={uploadedFiles}
                      onFileUpload={handleFileUpload}
                      loading={loadingFiles}
                      error={fileError}
                      onFileDelete={handleFileDelete}
                      onFileSelect={handleFileSelect}
                      selectedFileId={selectedFileId}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Preview</CardTitle>
                    <CardDescription>
                      View and manage your uploaded data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable data={excelData} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground dark:text-white">Charts</h2>
                <p className="text-muted-foreground">Create and manage your visualizations</p>
              </div>
              <Button onClick={() => setShowChartModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Chart
              </Button>
            </div>
            
            <ChartGrid 
              charts={charts}
              onEditChart={(chart) => {
                setEditingChart(chart);
                setShowChartModal(true);
              }}
              onDeleteChart={(chartId) => {
                handleDeleteChart(chartId);
              }}
              loading={loadingCharts}
              error={chartError}
            />
          </TabsContent>



          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <ExportActions 
              charts={charts}
              data={excelData}
              project={project}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Chart Creation Modal */}
      <ChartCreationModal
        open={showChartModal}
        onOpenChange={setShowChartModal}
        editingChart={editingChart}
        onChartSave={editingChart ? handleEditChart : handleCreateChart}
        availableData={excelData}
        uploadedFiles={uploadedFiles}
        projectId={projectId}
      />
    </div>
  );
};

export default Index;
