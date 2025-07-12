import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, fetchProjects } from '../../store/slices/projectsSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export default function ProjectCreationDebug() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { createLoading, createError, projects, loading, error } = useSelector(state => state.projects);
  
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [localError, setLocalError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    setDebugInfo(prev => ({
      ...prev,
      token: token ? 'Present' : 'Missing',
      tokenLength: token ? token.length : 0,
      isAuthenticated,
      user: user ? `${user.name} (${user.email})` : 'No user'
    }));
  }, [isAuthenticated, user]);

  const testAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLocalError('No token found in localStorage');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      setDebugInfo(prev => ({
        ...prev,
        authTest: {
          status: response.status,
          ok: response.ok,
          data: data
        }
      }));
      
      if (!response.ok) {
        setLocalError(`Auth test failed: ${data.message || 'Unknown error'}`);
      } else {
        setLocalError(null);
      }
    } catch (err) {
      setLocalError(`Auth test error: ${err.message}`);
    }
  };

  const testFetchProjects = async () => {
    const result = await dispatch(fetchProjects());
    setDebugInfo(prev => ({
      ...prev,
      fetchProjectsResult: {
        status: result.meta.requestStatus,
        payload: result.payload,
        error: result.error
      }
    }));
  };

  const handleCreateProject = async () => {
    setLocalError(null);
    if (!projectForm.name.trim()) {
      setLocalError('Project name is required.');
      return;
    }
    
    console.log('Creating project with data:', projectForm);
    console.log('User authenticated:', isAuthenticated);
    console.log('User:', user);
    console.log('Token present:', !!localStorage.getItem('token'));
    
    const result = await dispatch(createProject(projectForm));
    console.log('Create project result:', result);
    
    setDebugInfo(prev => ({
      ...prev,
      createProjectResult: {
        status: result.meta.requestStatus,
        payload: result.payload,
        error: result.error
      }
    }));
    
    if (result.meta.requestStatus === 'fulfilled') {
      setProjectForm({ name: '', description: '', category: '' });
      alert('Project created successfully!');
      // Refresh projects list
      dispatch(fetchProjects());
    } else {
      console.error('Project creation failed:', result.payload);
      setLocalError(result.payload || 'Failed to create project.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Project Creation Debug</h2>
      
      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Token:</strong> {debugInfo.token}</p>
            <p><strong>Token Length:</strong> {debugInfo.tokenLength}</p>
            <p><strong>Authenticated:</strong> {debugInfo.isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {debugInfo.user}</p>
            <p><strong>Projects Count:</strong> {projects.length}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Test Functions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testAuth} variant="outline">
            Test Authentication
          </Button>
          <Button onClick={testFetchProjects} variant="outline">
            Test Fetch Projects
          </Button>
        </CardContent>
      </Card>

      {/* Auth Test Results */}
      {debugInfo.authTest && (
        <Card>
          <CardHeader>
            <CardTitle>Auth Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.authTest, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Fetch Projects Results */}
      {debugInfo.fetchProjectsResult && (
        <Card>
          <CardHeader>
            <CardTitle>Fetch Projects Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.fetchProjectsResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Create Project Results */}
      {debugInfo.createProjectResult && (
        <Card>
          <CardHeader>
            <CardTitle>Create Project Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(debugInfo.createProjectResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Project Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <Button 
            onClick={handleCreateProject} 
            disabled={createLoading || !projectForm.name.trim()}
            className="w-full"
          >
            {createLoading ? 'Creating...' : 'Create Project'}
          </Button>
          
          {(localError || createError) && (
            <Alert variant="destructive">
              <AlertDescription>{localError || createError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Current Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Current Projects ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground">No projects found</p>
          ) : (
            <div className="space-y-2">
              {projects.map(project => (
                <div key={project._id} className="p-2 border rounded">
                  <p><strong>{project.name}</strong></p>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <p className="text-xs text-muted-foreground">Role: {project.userRole}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 