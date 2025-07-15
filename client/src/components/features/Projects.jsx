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
  Settings,
  Copy
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

import { shareProject } from '../../services/api';

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

  // Restore canEditProject and canDeleteProject
  const canEditProject = true; // User can always edit their own projects
  const canDeleteProject = true; // User can always delete their own projects

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '', category: '' });

  const [contextMenuProject, setContextMenuProject] = useState(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Send Project (Share) state
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');
  const [copied, setCopied] = useState(false);

  // Filtered projects
  const filteredProjects = projects.filter((project) => {
    const projectName = typeof project.name === 'string' ? project.name : (project.name?.name || '');
    const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
      // Force refresh projects and selected project after update
      dispatch(fetchProjects());
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    await dispatch(deleteProject(selectedProject._id));
    if (!deleteError) {
      setShowDeleteModal(false);
    }
  };

  const handleSendProject = async () => {
    if (!selectedProject) return;
    setShareLoading(true);
    setShareError('');
    setShareLink('');
    try {
      const data = await shareProject(selectedProject._id);
      setShareLink(data.shareLink);
    } catch (err) {
      setShareError(err?.response?.data?.error || 'Failed to generate share link');
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
          <DialogContent description="Create a new project">
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
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your data visualization projects and dashboards</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-1 gap-8">
        {/* Project List */}
        <div className="w-80 flex-shrink-0 space-y-2 overflow-y-auto">
          {filteredProjects.length === 0 && (
            <div className="text-muted-foreground text-center py-8">No projects found.</div>
          )}
          {filteredProjects.map(project => (
            <Card
              key={project._id}
              className={`cursor-pointer border-2 ${selectedProject && selectedProject._id === project._id ? 'border-primary' : 'border-transparent'} transition-colors`}
              onClick={() => handleSelectProject(project)}
            >
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="font-semibold text-lg truncate">{project.name}</div>
                <div className="text-xs text-muted-foreground truncate">{project.description || 'No description'}</div>
                <div className="text-xs text-muted-foreground">{project.category || 'Uncategorized'}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Project Details Panel */}
        <div className="flex-1">
          {selectedProject ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                  <p className="text-muted-foreground">{selectedProject.description || 'No description'}</p>
                  <p className="text-xs text-muted-foreground">Category: {selectedProject.category || 'Uncategorized'}</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => navigate(`/workspace/${selectedProject._id}`)}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Open Workspace
                </Button>
                <Button
                  variant="outline"
                  className="ml-2 flex items-center gap-2"
                  onClick={() => {
                    setShowSendDialog(true);
                    setShareLink('');
                    setShareError('');
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Send Project
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Charts</p>
                      <p className="text-2xl font-bold">{selectedProject.charts?.length || 0}</p>
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
                        {selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                      <Input value={selectedProject.name} disabled className="flex-1" />
                      {canEditProject && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditProjectForm({
                              name: selectedProject.name,
                              description: selectedProject.description || '',
                              category: selectedProject.category || ''
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
                    <p className="text-sm text-muted-foreground">{selectedProject.description || 'No description'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <p className="text-sm text-muted-foreground">{selectedProject.category || 'Uncategorized'}</p>
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
          ) : (
            <div className="text-muted-foreground text-center py-8">Select a project to view details.</div>
          )}
        </div>
      </div>
      {/* Modals */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent description="Create a new project">
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
        <DialogContent description="Edit the selected project">
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
        <DialogContent description="Delete the selected project">
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

      {/* Send Project Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent description="Share this project with another user.">
          <DialogHeader>
            <DialogTitle>Send Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={handleSendProject}
              disabled={shareLoading || !selectedProject}
              className="w-full"
            >
              {shareLoading ? 'Generating...' : 'Generate Share Link'}
            </Button>
            {shareError && (
              <Alert variant="destructive">
                <AlertDescription>{shareError}</AlertDescription>
              </Alert>
            )}
            {shareLink && (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium">Share this link:</div>
                <div className="flex items-center gap-2">
                  <Input value={shareLink} readOnly className="flex-1" />
                  <Button variant="outline" size="icon" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  {copied && <span className="text-xs text-green-600">Copied!</span>}
                </div>
                <div className="text-xs text-muted-foreground">The recipient must log in and accept the project. It will be added as their own copy.</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>




    </div>
  );
} 