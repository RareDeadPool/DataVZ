import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../../store/slices/projectsSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';

export default function ProjectCreationTest() {
  const dispatch = useDispatch();
  const { createLoading, createError } = useSelector(state => state.projects);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: '' });
  const [localError, setLocalError] = useState(null);

  const handleCreateProject = async () => {
    setLocalError(null);
    console.log('Creating project with data:', projectForm);
    console.log('User authenticated:', isAuthenticated);
    console.log('User:', user);
    
    if (!projectForm.name.trim()) {
      setLocalError('Project name is required.');
      return;
    }
    
    const result = await dispatch(createProject(projectForm));
    console.log('Create project result:', result);
    
    if (result.meta.requestStatus === 'fulfilled') {
      setProjectForm({ name: '', description: '', category: '' });
      alert('Project created successfully!');
    } else {
      setLocalError(result.payload || 'Failed to create project.');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Project Creation Test</h2>
      
      <div className="space-y-2">
        <p><strong>Authentication Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        <p><strong>User:</strong> {user ? `${user.name} (${user.email})` : 'No user'}</p>
        <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
      </div>

      <div className="space-y-4 max-w-md">
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
      </div>
    </div>
  );
} 