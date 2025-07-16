import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  Copy,
  BrainCircuit,
  Grid3X3,
  List,
  Calendar,
  User
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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
} from '@/store/slices/projectsSlice';

import { shareProject } from '../services/api';
import { askGeminiSummary } from '../services/api';

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

  const canEditProject = true;
  const canDeleteProject = true;

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '', category: '' });
  const [localError, setLocalError] = useState(null);

  // AI Summary state
  const [showAISummary, setShowAISummary] = useState(false);
  const [aiSummary, setAISummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Share state
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');
  const [copied, setCopied] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

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
    
    const result = await dispatch(createProject(projectForm));
    
    if (result.meta.requestStatus === 'fulfilled') {
      setProjectForm({ name: '', description: '', category: '' });
      setShowCreateModal(false);
      const fetchResult = await dispatch(fetchProjects());
      if (fetchResult.payload && Array.isArray(fetchResult.payload)) {
        const newProject = fetchResult.payload.find(p => p.name === result.payload.name && p.owner === result.payload.owner);
        if (newProject) {
          dispatch(setSelectedProject(newProject));
        } else if (fetchResult.payload.length > 0) {
          dispatch(setSelectedProject(fetchResult.payload[0]));
        }
      }
    } else {
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

  const handleShowAISummary = async () => {
    setShowAISummary(true);
    setLoadingSummary(true);
    
    // Simulate AI summary generation
    setTimeout(() => {
      setAISummary(`## Project Analysis: ${selectedProject?.name}

**Overview:** This project contains ${selectedProject?.charts?.length || 0} charts focused on ${selectedProject?.category || 'general'} analytics.

**Key Insights:**
- Primary focus: ${selectedProject?.description || 'Data visualization'}
- Category: ${selectedProject?.category || 'Uncategorized'}
- Charts available: ${selectedProject?.charts?.length || 0}

**Recommendations:**
- Consider adding more visualization types
- Implement real-time data updates
- Add interactive filters for better user experience

*Analysis generated by Vizard AI*`);
      setLoadingSummary(false);
    }, 2000);
  };

  const handleSendProject = async () => {
    if (!selectedProject || !recipientEmail) return;
    setShareLoading(true);
    setShareError('');
    setShareLink('');
    
    // Simulate share link generation
    setTimeout(() => {
      setShareLink(`${window.location.origin}/projects/shared/${selectedProject._id}?token=abc123`);
      setShareLoading(false);
    }, 1000);
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Empty state for no projects
  if (projects.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950 dark:via-background dark:to-blue-950">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="h-16 w-16 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Welcome to Your Workspace
              </h2>
              <p className="text-xl text-muted-foreground max-w-md">
                Create your first project to start building amazing data visualizations
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)} 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg px-8 py-6 text-lg rounded-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950 dark:via-background dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Floating AI Summary Button */}
        {selectedProject && selectedProject.charts && selectedProject.charts.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-full h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-4 border-blue-200 dark:border-blue-800"
                  onClick={handleShowAISummary}
                  size="icon"
                >
                  <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
                  <BrainCircuit className="h-8 w-8 relative z-10" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-base font-semibold bg-blue-600 text-white">
                ✨ Get AI Insights!
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage and organize your data visualization projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white dark:bg-card rounded-lg p-1 shadow-sm border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-card shadow-sm border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600"
            />
          </div>
          <Button variant="outline" className="border-blue-200 dark:border-blue-800">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Project List */}
          <div className="xl:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                All Projects ({filteredProjects.length})
              </h2>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-blue-300" />
                  <p>No projects found</p>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <Card
                    key={project._id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProject && selectedProject._id === project._id
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/50'
                        : 'hover:bg-blue-50 dark:hover:bg-blue-950/30'
                    }`}
                    onClick={() => handleSelectProject(project)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate text-blue-800 dark:text-blue-200">
                            {project.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {project.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200">
                              {project.category || 'General'}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <BarChart3 className="h-3 w-3" />
                              {project.charts?.length || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="xl:col-span-3">
            {selectedProject ? (
              <div className="space-y-6">
                {/* Project Header */}
                <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-white/20 rounded-lg">
                            <FileSpreadsheet className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold">{selectedProject.name}</h2>
                            <p className="text-blue-100 text-lg">{selectedProject.description || 'No description'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Created {new Date(selectedProject.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Owner
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`/workspace/${selectedProject._id}`)}
                          className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Open Workspace
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowSendDialog(true);
                            setShareLink('');
                            setShareError('');
                          }}
                          className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10"
                        >
                          <Copy className="h-4 w-4" />
                          Share Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Charts</p>
                          <p className="text-3xl font-bold text-blue-600">{selectedProject.charts?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {new Date(selectedProject.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg">
                          <Settings className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Category</p>
                          <p className="text-lg font-semibold text-blue-600">{selectedProject.category || 'General'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Project Actions */}
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <Settings className="h-5 w-5" />
                      Project Management
                    </CardTitle>
                    <CardDescription>
                      Manage your project settings and perform actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {canEditProject && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditProjectForm({
                              name: selectedProject.name,
                              description: selectedProject.description || '',
                              category: selectedProject.category || ''
                            });
                            setShowEditModal(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Project
                        </Button>
                      )}
                      {canDeleteProject && (
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteModal(true)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Project
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-16 text-center">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto">
                      <FileSpreadsheet className="h-10 w-10 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
                        Select a Project
                      </h3>
                      <p className="text-muted-foreground mt-2">
                        Choose a project from the list to view its details and manage settings
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* AI Summary Dialog */}
        <Dialog open={showAISummary} onOpenChange={setShowAISummary}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg -m-6 p-6 mb-6">
              <div className="flex items-center gap-3">
                <BrainCircuit className="h-8 w-8" />
                <div>
                  <DialogTitle className="text-2xl">AI Project Analysis</DialogTitle>
                  <DialogDescription className="text-blue-100">
                    Intelligent insights powered by Vizard AI
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              {loadingSummary ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-blue-600">Analyzing project...</span>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{aiSummary}</div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Project Dialog */}
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

        {/* Edit Project Dialog */}
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

        {/* Delete Project Dialog */}
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

        {/* Send Project Dialog */}
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Recipient's email address"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                required
                disabled={shareLoading}
              />
              <Button
                onClick={handleSendProject}
                disabled={shareLoading || !selectedProject || !recipientEmail}
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
    </div>
  );
}