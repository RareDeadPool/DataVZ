"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, MoreHorizontal, FileSpreadsheet, BarChart3, Users, Star, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const projects = [
  {
    id: 1,
    name: "Q4 Sales Analysis",
    description: "Comprehensive analysis of Q4 sales performance across all regions",
    type: "Dashboard",
    status: "Active",
    lastModified: "2 hours ago",
    owner: "Aditya Sawant",
    collaborators: 3,
    charts: 8,
    favorite: true,
  },
  {
    id: 2,
    name: "Customer Insights Report",
    description: "Deep dive into customer behavior and segmentation analysis",
    type: "Report",
    status: "Active",
    lastModified: "1 day ago",
    owner: "Sarah Johnson",
    collaborators: 2,
    charts: 5,
    favorite: false,
  },
  {
    id: 3,
    name: "Marketing ROI Dashboard",
    description: "Track marketing campaign performance and return on investment",
    type: "Dashboard",
    status: "Draft",
    lastModified: "3 days ago",
    owner: "Mike Chen",
    collaborators: 4,
    charts: 12,
    favorite: true,
  },
  {
    id: 4,
    name: "Product Performance Analysis",
    description: "Monthly product performance metrics and trends",
    type: "Analysis",
    status: "Active",
    lastModified: "1 week ago",
    owner: "Emily Davis",
    collaborators: 1,
    charts: 6,
    favorite: false,
  },
  {
    id: 5,
    name: "Financial Overview",
    description: "Complete financial overview with key metrics and forecasts",
    type: "Dashboard",
    status: "Review",
    lastModified: "2 weeks ago",
    owner: "Aditya Sawant",
    collaborators: 5,
    charts: 15,
    favorite: false,
  },
]

const templates = [
  {
    name: "Sales Dashboard",
    description: "Track sales performance and revenue metrics",
    category: "Sales",
    charts: ["Bar Chart", "Line Chart", "KPI Cards"],
  },
  {
    name: "Marketing Analytics",
    description: "Monitor marketing campaigns and ROI",
    category: "Marketing",
    charts: ["Funnel Chart", "Pie Chart", "Trend Analysis"],
  },
  {
    name: "Financial Report",
    description: "Comprehensive financial analysis and reporting",
    category: "Finance",
    charts: ["Waterfall Chart", "Budget vs Actual", "Cash Flow"],
  },
  {
    name: "Customer Analysis",
    description: "Customer behavior and segmentation insights",
    category: "Customer",
    charts: ["Cohort Analysis", "Retention Chart", "Segmentation"],
  },
]

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState("grid")
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to fetch projects');
        setProjects(await res.json());
      } catch (err) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleProjectFormChange = e => setProjectForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleCreateProject = async e => {
    e.preventDefault();
    setCreating(true);
    setErrorMsg('');
    setSuccessMsg('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(projectForm),
      });
      if (!res.ok) throw new Error('Failed to create project');
      const project = await res.json();
      setProjects(p => [...p, project]);
      setShowModal(false);
      setSuccessMsg('Project created!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || project.status.toLowerCase() === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your data visualization projects and dashboards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>
      {showModal && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateProject}>
              <Input name="name" placeholder="Project Name" value={projectForm.name} onChange={handleProjectFormChange} required />
              <Input name="description" placeholder="Description" value={projectForm.description} onChange={handleProjectFormChange} />
              <Input name="category" placeholder="Category" value={projectForm.category} onChange={handleProjectFormChange} />
              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Project'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
              {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
              {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
            </form>
          </DialogContent>
        </Dialog>
      )}
      {loading ? (
        <div className="p-6 text-center">Loading projects...</div>
      ) : error ? (
        <div className="p-6 text-red-500 text-center">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project._id || project.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
                <div className="mt-2 text-xs text-muted-foreground">Category: {project.category || 'N/A'}</div>
                <div className="mt-1 text-xs text-muted-foreground">Collaborators: {project.collaborators?.length || 0}</div>
              </CardHeader>
              <CardContent>
                {/* Optionally, show chart count or preview here */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <Card key={project._id} className="relative group">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    <Link to={`/projects/${project._id}`} className="font-semibold text-lg text-blue-600 hover:underline">{project.name}</Link>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-muted-foreground" />
                      <span>{project.charts} charts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{project.collaborators} users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{project.lastModified}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Owner: {project.owner}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shared Projects</CardTitle>
              <CardDescription>Projects that have been shared with you by team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No shared projects yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Projects shared with you by team members will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.category}</Badge>
                    <Button size="sm">Use Template</Button>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Includes:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.charts.map((chart) => (
                        <Badge key={chart} variant="secondary" className="text-xs">
                          {chart}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Accessed</CardTitle>
              <CardDescription>Projects you've worked on recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <div key={project._id || project.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50">
                    <div className="p-2 bg-muted rounded">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.type} • Last modified {project.lastModified}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
