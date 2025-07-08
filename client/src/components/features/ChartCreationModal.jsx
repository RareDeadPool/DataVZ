import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { BarChart3, LineChart, PieChart, ScatterChart, Upload, FileSpreadsheet } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useSelector } from 'react-redux';

const chartTypes = [
  {
    id: "bar",
    name: "Bar Chart",
    description: "Compare categories with rectangular bars",
    icon: BarChart3,
    recommended: ["categorical", "comparison"],
  },
  {
    id: "line",
    name: "Line Chart",
    description: "Show trends over time",
    icon: LineChart,
    recommended: ["time-series", "trends"],
  },
  {
    id: "pie",
    name: "Pie Chart",
    description: "Show parts of a whole",
    icon: PieChart,
    recommended: ["proportions", "percentages"],
  },
  {
    id: "scatter",
    name: "Scatter Plot",
    description: "Show relationships between variables",
    icon: ScatterChart,
    recommended: ["correlation", "relationships"],
  },
]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function ChartCreationModal({ open, onOpenChange }) {
  const [step, setStep] = useState(1)
  const [selectedFile, setSelectedFile] = useState("")
  const [selectedChart, setSelectedChart] = useState("")
  const [chartConfig, setChartConfig] = useState({
    title: "",
    xAxis: "",
    yAxis: "",
    color: "#3b82f6",
  })
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [creatingProject, setCreatingProject] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const user = useSelector(state => state.auth.user);
  // Real-time collaboration: join project room and sync chartConfig
  const { sendEdit, sendPresence } = useSocket(selectedProject, user, {
    onEdit: (data) => setChartConfig(data),
    onPresence: (presence) => setPresenceList(presence),
  });
  const [presenceList, setPresenceList] = useState([]);

  useEffect(() => {
    if (open) {
      const fetchProjects = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setProjects(await res.json());
      };
      fetchProjects();
    }
  }, [open]);

  // Broadcast chartConfig changes
  useEffect(() => {
    if (selectedProject && user) {
      sendPresence({ user });
    }
    // eslint-disable-next-line
  }, [selectedProject, user]);

  // When chartConfig changes, broadcast to others
  useEffect(() => {
    if (selectedProject && user) {
      sendEdit(chartConfig);
    }
    // eslint-disable-next-line
  }, [chartConfig]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleProjectFormChange = e => setProjectForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreateProject = async e => {
    e.preventDefault();
    setCreatingProject(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(projectForm),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const project = await res.json();
      setProjects(p => [...p, project]);
      setSelectedProject(project._id);
      setProjectForm({ name: '', description: '', category: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreate = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/charts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          projectId: selectedProject,
          type: selectedChart,
          data: chartConfig,
        }),
      });
      if (!res.ok) throw new Error('Failed to create chart');
      setSuccessMsg('Chart created and added to project!');
      onOpenChange(false);
      setStep(1);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create chart');
    }
  };

  const resetModal = () => {
    setStep(1)
    setSelectedFile("")
    setSelectedChart("")
    setChartConfig({
      title: "",
      xAxis: "",
      yAxis: "",
      color: "#3b82f6",
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) resetModal()
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chart</DialogTitle>
          <DialogDescription>
            Follow the steps to create a beautiful visualization from your data
            {presenceList.length > 0 && (
              <div className="flex gap-2 items-center text-xs text-muted-foreground">
                <span>Editing now:</span>
                {presenceList.map((p, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 rounded px-2 py-1">{p.user?.name || 'User'}</span>
                ))}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={`step-${step}`} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="step-1" disabled={step !== 1}>1. Select Data</TabsTrigger>
            <TabsTrigger value="step-2" disabled={step !== 2}>2. Choose Chart</TabsTrigger>
            <TabsTrigger value="step-3" disabled={step !== 3}>3. Configure</TabsTrigger>
            <TabsTrigger value="step-4" disabled={step !== 4}>4. Add to Project</TabsTrigger>
          </TabsList>

          {/* Step 1: Select Data */}
          <TabsContent value="step-1" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Select Data Source
                </CardTitle>
                <CardDescription>Choose the dataset you want to visualize</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Available Files</Label>
                  <Select value={selectedFile} onValueChange={setSelectedFile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a file" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_data.xlsx">sales_data.xlsx</SelectItem>
                      <SelectItem value="customer_survey.csv">customer_survey.csv</SelectItem>
                      <SelectItem value="inventory_report.xlsx">inventory_report.xlsx</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Or upload a new file</p>
                  <p className="text-muted-foreground mb-4">Drag and drop or click to browse</p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Choose Chart Type */}
          <TabsContent value="step-2" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Choose Chart Type</CardTitle>
                <CardDescription>Select the best visualization for your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {chartTypes.map((chart) => {
                    const IconComponent = chart.icon
                    return (
                      <Card
                        key={chart.id}
                        className={`cursor-pointer transition-colors ${
                          selectedChart === chart.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-muted-foreground/50"
                        }`}
                        onClick={() => setSelectedChart(chart.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted rounded">
                              <IconComponent className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium mb-1">{chart.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{chart.description}</p>
                              <div className="flex gap-1">
                                {chart.recommended.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Configure Chart */}
          <TabsContent value="step-3" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configure Chart</CardTitle>
                <CardDescription>Customize your chart settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chart-title">Chart Title</Label>
                    <Input
                      id="chart-title"
                      placeholder="Enter chart title"
                      value={chartConfig.title}
                      onChange={(e) => setChartConfig({ ...chartConfig, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    {['line', 'area', 'radar'].includes(selectedChart) ? (
                      <>
                        <Label htmlFor="chart-color">Primary Color</Label>
                        <Input
                          id="chart-color"
                          type="color"
                          value={chartConfig.color}
                          onChange={(e) => setChartConfig({ ...chartConfig, color: e.target.value })}
                        />
                      </>
                    ) : (
                      <>
                        <Label>Palette</Label>
                        <div className="flex gap-2">
                          {(chartConfig.palette || ['#3b82f6', '#f59e42', '#10b981', '#ef4444', '#6366f1']).map((color, idx) => (
                            <Input
                              key={idx}
                              type="color"
                              value={color}
                              onChange={e => {
                                const newPalette = [...(chartConfig.palette || ['#3b82f6', '#f59e42', '#10b981', '#ef4444', '#6366f1'])];
                                newPalette[idx] = e.target.value;
                                setChartConfig({ ...chartConfig, palette: newPalette });
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X-Axis Column</Label>
                    <Select
                      value={chartConfig.xAxis}
                      onValueChange={(value) => setChartConfig({ ...chartConfig, xAxis: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select X-axis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="region">Region</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Y-Axis Column</Label>
                    <Select
                      value={chartConfig.yAxis}
                      onValueChange={(value) => setChartConfig({ ...chartConfig, yAxis: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Y-axis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="quantity">Quantity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Preview */}
                <div className="border rounded-lg p-8 bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                    <p>Chart preview will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Add to Project */}
          <TabsContent value="step-4" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add to Project</CardTitle>
                <CardDescription>Select a project to add this chart to, or create a new one.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Select Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-center text-muted-foreground">or</div>
                <form className="space-y-2" onSubmit={handleCreateProject}>
                  <Input name="name" placeholder="Project Name" value={projectForm.name} onChange={handleProjectFormChange} required />
                  <Input name="description" placeholder="Description" value={projectForm.description} onChange={handleProjectFormChange} />
                  <Input name="category" placeholder="Category" value={projectForm.category} onChange={handleProjectFormChange} />
                  <Button type="submit" disabled={creatingProject}>{creatingProject ? 'Creating...' : 'Create Project'}</Button>
                </form>
                {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
                {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
              </CardContent>
            </Card>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleCreate} disabled={!selectedProject}>Create Chart</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
