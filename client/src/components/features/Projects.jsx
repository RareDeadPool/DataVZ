import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileSpreadsheet, 
  BarChart3, 
  Clock, 
  Trash2,
  Edit,
  Settings
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Link, useNavigate } from 'react-router-dom';

// Redux actions
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,

  setSelectedProject,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,

} from '../../store/slices/projectsSlice';

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
];

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    projects,
    selectedProject,
    loading,
    error,
    createLoading,
    createError,
    updateLoading,
    updateError,
    deleteLoading,
    deleteError,

  } = useSelector(state => state.projects);
  

  const user = useSelector(state => state.auth.user);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '', category: '' });

  const [contextMenuProject, setContextMenuProject] = useState(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Computed values
  const currentUserId = user?._id || user?.id;
  const canEditProject = true; // User can always edit their own projects
  const canDeleteProject = true; // User can always delete their own projects


  // Filtered projects
  const filteredProjects = projects.filter((project) => {
    const projectName = typeof project.name === 'string' ? project.name : (project.name?.name || '');
    const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || project.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Initialize data
  useEffect(() => {
    dispatch(fetchProjects()).then(fetchResult => {
      console.log('Initial fetch projects:', fetchResult);
    });
  }, [dispatch]);

  // Auto-select first project if none selected
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      dispatch(setSelectedProject(projects[0]));
    }
  }, [projects, selectedProject, dispatch]);

  // Add a debug log for the Redux state
  useEffect(() => {
    console.log('Projects state:', projects);
  }, [projects]);

  // Handlers
  const handleSelectProject = (project) => {
    dispatch(setSelectedProject(project));
    setSearchTerm("");
  };

  const handleCreateProject = async () => {
    setLocalError(null);
    if (!projectForm.name.trim()) {
      setLocalError('Project name is required.');
      return;
    }
    
    console.log('Creating project with data:', projectForm);
    console.log('User authenticated:', user);
    console.log('Token present:', !!localStorage.getItem('token'));
    
    const result = await dispatch(createProject(projectForm));
    console.log('Create project result:', result);
    
    if (result.meta.requestStatus === 'fulfilled') {
      setProjectForm({ name: '', description: '', category: '' });
      setShowCreateModal(false);
      // Fetch the updated projects list and set the new project as selected
      const fetchResult = await dispatch(fetchProjects());
      console.log('Fetch projects after create:', fetchResult);
      // Set the selected project to the newly created one
      if (fetchResult.payload && Array.isArray(fetchResult.payload)) {
        const newProject = fetchResult.payload.find(p => p.name === result.payload.name && p.owner === result.payload.owner);
        if (newProject) {
          dispatch(setSelectedProject(newProject));
        } else if (fetchResult.payload.length > 0) {
          dispatch(setSelectedProject(fetchResult.payload[0]));
        }
      }
    } else {
      console.error('Project creation failed:', result.payload);
      setLocalError(result.payload || 'Failed to create project.');
    }
  };

  const handleUpdateProject = async () => {
    if (!editProjectForm.name.trim() || !selectedProject) return;
    await dispatch(updateProject({ 
      projectId: selectedProject._id, 
      updates: editProjectForm 
    }));
    if (!updateError) {
      setShowEditModal(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    await dispatch(deleteProject(selectedProject._id));
    if (!deleteError) {
      setShowDeleteModal(false);
    }
  };



  const handleContextMenu = (e, project) => {
    e.preventDefault();
    setContextMenuProject(project);
    setContextMenuOpen(true);
  };



  // Empty state for no projects
  if (projects.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">No projects yet</h2>
            <p className="text-muted-foreground mt-2">Create your first project to start visualizing data</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
        {/* Show modal if just created */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Project name"
                value={projectForm.name}
                onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                disabled={createLoading}
              />
              <Input
                placeholder="Description (optional)"
                value={projectForm.description}
                onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                disabled={createLoading}
              />
              <Input
                placeholder="Category (optional)"
                value={projectForm.category}
                onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                disabled={createLoading}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateProject} 
                  disabled={createLoading || !projectForm.name.trim()}
                  className="flex-1"
                >
                  {createLoading ? 'Creating...' : 'Create Project'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
              {(localError || createError) && (
                <Alert variant="destructive">
                  <AlertDescription>{localError || createError}</AlertDescription>
                </Alert>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your data visualization projects and dashboards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Project Tabs */}
      {projects.length > 0 && (
        <Tabs 
          value={selectedProject?._id} 
          onValueChange={(value) => {
            const project = projects.find(p => p._id === value);
            if (project) handleSelectProject(project);
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid w-full max-w-md" style={{gridTemplateColumns: `repeat(${Math.min(projects.length, 4)}, 1fr)`}}>
              {projects.slice(0, 4).map(project => (
                <DropdownMenu 
                  key={project._id} 
                  open={contextMenuOpen && contextMenuProject?._id === project._id} 
                  onOpenChange={setContextMenuOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <TabsTrigger
                      value={project._id}
                      className="text-sm"
                      onContextMenu={(e) => handleContextMenu(e, project)}
                    >
                      {typeof project.name === 'string' ? project.name : (project.name?.name || 'Unknown Project')}
                    </TabsTrigger>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditProjectForm({
                          name: project.name,
                          description: project.description || '',
                          category: project.category || ''
                        });
                        setShowEditModal(true);
                        setContextMenuOpen(false);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setContextMenuOpen(false);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </TabsList>
            {projects.length > 4 && (
              <Select 
                value={selectedProject?._id} 
                onValueChange={(value) => {
                  const project = projects.find(p => p._id === value);
                  if (project) handleSelectProject(project);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="More projects..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.slice(4).map(project => (
                    <SelectItem key={project._id} value={project._id}>
                      {typeof project.name === 'string' ? project.name : (project.name?.name || 'Unknown Project')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {projects.map(project => (
            <TabsContent key={project._id} value={project._id} className="space-y-6">
              {/* Open Workspace Button */}
              <div className="flex justify-end mb-2">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/workspace/${project._id}`)}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Open Workspace
                </Button>
              </div>
              {/* Project Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Charts</p>
                      <p className="text-2xl font-bold">{project.charts?.length || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                

                
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm font-semibold">
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Management */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Settings Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Project Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Project Name</label>
                      <div className="flex gap-2">
                        <Input value={typeof project.name === 'string' ? project.name : (project.name?.name || 'Unknown Project')} disabled className="flex-1" />
                        {canEditProject && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => { 
                              setEditProjectForm({
                                name: project.name,
                                description: project.description || '',
                                category: project.category || ''
                              });
                              setShowEditModal(true); 
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <p className="text-sm text-muted-foreground">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <p className="text-sm text-muted-foreground">
                        {project.category || 'Uncategorized'}
                      </p>
                    </div>
                    
                    {canDeleteProject && (
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </Button>
                    )}


                  </CardContent>
                </Card>




              </div>




            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Modals */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Project name"
              value={projectForm.name}
              onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
              disabled={createLoading}
            />
            <Input
              placeholder="Description (optional)"
              value={projectForm.description}
              onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
              disabled={createLoading}
            />
            <Input
              placeholder="Category (optional)"
              value={projectForm.category}
              onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
              disabled={createLoading}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateProject} 
                disabled={createLoading || !projectForm.name.trim()}
                className="flex-1"
              >
                {createLoading ? 'Creating...' : 'Create Project'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
            {(localError || createError) && (
              <Alert variant="destructive">
                <AlertDescription>{localError || createError}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Project name"
              value={editProjectForm.name}
              onChange={e => setEditProjectForm({ ...editProjectForm, name: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={editProjectForm.description}
              onChange={e => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
            />
            <Input
              placeholder="Category (optional)"
              value={editProjectForm.category}
              onChange={e => setEditProjectForm({ ...editProjectForm, category: e.target.value })}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleUpdateProject} 
                disabled={updateLoading || !editProjectForm.name.trim()}
                className="flex-1"
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
            </div>
            {updateError && (
              <Alert variant="destructive">
                <AlertDescription>{updateError}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={handleDeleteProject} 
                disabled={deleteLoading}
                className="flex-1"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Project'}
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </div>
            {deleteError && (
              <Alert variant="destructive">
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>




    </div>
  );
} 