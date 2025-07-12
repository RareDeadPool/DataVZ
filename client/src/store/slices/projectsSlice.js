import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('Fetching projects from:', `${API_BASE}/projects`);
      
      const response = await fetch(`${API_BASE}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      console.log('Fetch projects response status:', response.status);
      console.log('Fetch projects response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `Failed to fetch projects (${response.status})`);
      }
      return data;
    } catch (error) {
      console.error('Fetch projects error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('Making API request to:', `${API_BASE}/projects`);
      console.log('Request data:', projectData);
      
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });
      
      const data = await response.json();
      console.log('API response status:', response.status);
      console.log('API response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `Failed to create project (${response.status})`);
      }
      return data;
    } catch (error) {
      console.error('Project creation error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, updates }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update project');
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete project');
      return projectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCollaborator = createAsyncThunk(
  'projects/addCollaborator',
  async ({ projectId, email, role = 'editor' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/${projectId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add collaborator');
      return { projectId, collaborator: data.collaborator };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCollaborator = createAsyncThunk(
  'projects/removeCollaborator',
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/${projectId}/collaborators/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove collaborator');
      return { projectId, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changeCollaboratorRole = createAsyncThunk(
  'projects/changeCollaboratorRole',
  async ({ projectId, userId, role }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/${projectId}/collaborators/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to change collaborator role');
      return { projectId, userId, role };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveProject = createAsyncThunk(
  'projects/leaveProject',
  async (projectId, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      const user = getState().auth.user;
      const response = await fetch(`${API_BASE}/projects/${projectId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user._id || user.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to leave project');
      return projectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTeamToProject = createAsyncThunk(
  'projects/addTeamToProject',
  async ({ projectId, teamId, role = 'editor' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/${projectId}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teamId, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add team to project');
      return { projectId, team: data.team };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeTeamFromProject = createAsyncThunk(
  'projects/removeTeamFromProject',
  async ({ projectId, teamId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/${projectId}/teams/${teamId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove team from project');
      return { projectId, teamId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Collaboration invitation thunks
export const inviteCollaborator = createAsyncThunk(
  'projects/inviteCollaborator',
  async ({ projectId, email, role = 'editor' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/${projectId}/invite-collaborator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send collaboration invitation');
      return { projectId, email, message: data.message };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const respondToCollaborationInvitation = createAsyncThunk(
  'projects/respondToCollaborationInvitation',
  async ({ projectId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/collaboration-invitation/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to respond to invitation');
      return { projectId, status, project: data.project };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPendingCollaborationInvitations = createAsyncThunk(
  'projects/fetchPendingCollaborationInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/projects/collaboration-invitations/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch pending invitations');
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
  deleteLoading: false,
  deleteError: null,
  addCollaboratorLoading: false,
  addCollaboratorError: null,
  removeCollaboratorLoading: false,
  removeCollaboratorError: null,
  changeRoleLoading: false,
  changeRoleError: null,
  leaveProjectLoading: false,
  leaveProjectError: null,
  addTeamLoading: false,
  addTeamError: null,
  removeTeamLoading: false,
  removeTeamError: null,
  // Collaboration invitation states
  inviteCollaboratorLoading: false,
  inviteCollaboratorError: null,
  respondToInvitationLoading: false,
  respondToInvitationError: null,
  pendingInvitations: [],
  pendingInvitationsLoading: false,
  pendingInvitationsError: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearAddCollaboratorError: (state) => {
      state.addCollaboratorError = null;
    },
    clearRemoveCollaboratorError: (state) => {
      state.removeCollaboratorError = null;
    },
    clearChangeRoleError: (state) => {
      state.changeRoleError = null;
    },
    clearLeaveProjectError: (state) => {
      state.leaveProjectError = null;
    },
    clearAddTeamError: (state) => {
      state.addTeamError = null;
    },
    clearRemoveTeamError: (state) => {
      state.removeTeamError = null;
    },
    clearInviteCollaboratorError: (state) => {
      state.inviteCollaboratorError = null;
    },
    clearRespondToInvitationError: (state) => {
      state.respondToInvitationError = null;
    },
    clearPendingInvitationsError: (state) => {
      state.pendingInvitationsError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch projects
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        if (action.payload.length > 0 && !state.selectedProject) {
          state.selectedProject = action.payload[0];
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create project
    builder
      .addCase(createProject.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.createLoading = false;
        state.projects.push(action.payload);
        state.selectedProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });

    // Update project
    builder
      .addCase(updateProject.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.projects.findIndex(project => project._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.selectedProject && state.selectedProject._id === action.payload._id) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });

    // Delete project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.projects = state.projects.filter(project => project._id !== action.payload);
        if (state.selectedProject && state.selectedProject._id === action.payload) {
          state.selectedProject = state.projects.length > 0 ? state.projects[0] : null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });

    // Add collaborator
    builder
      .addCase(addCollaborator.pending, (state) => {
        state.addCollaboratorLoading = true;
        state.addCollaboratorError = null;
      })
      .addCase(addCollaborator.fulfilled, (state, action) => {
        state.addCollaboratorLoading = false;
        const project = state.projects.find(p => p._id === action.payload.projectId);
        if (project) {
          project.collaborators.push(action.payload.collaborator);
        }
        if (state.selectedProject && state.selectedProject._id === action.payload.projectId) {
          state.selectedProject.collaborators.push(action.payload.collaborator);
        }
      })
      .addCase(addCollaborator.rejected, (state, action) => {
        state.addCollaboratorLoading = false;
        state.addCollaboratorError = action.payload;
      });

    // Remove collaborator
    builder
      .addCase(removeCollaborator.pending, (state) => {
        state.removeCollaboratorLoading = true;
        state.removeCollaboratorError = null;
      })
      .addCase(removeCollaborator.fulfilled, (state, action) => {
        state.removeCollaboratorLoading = false;
        const project = state.projects.find(p => p._id === action.payload.projectId);
        if (project) {
          project.collaborators = project.collaborators.filter(c => {
            const collaboratorId = typeof c.userId === 'object' ? c.userId._id : c.userId;
            return collaboratorId !== action.payload.userId;
          });
        }
        if (state.selectedProject && state.selectedProject._id === action.payload.projectId) {
          state.selectedProject.collaborators = state.selectedProject.collaborators.filter(c => {
            const collaboratorId = typeof c.userId === 'object' ? c.userId._id : c.userId;
            return collaboratorId !== action.payload.userId;
          });
        }
      })
      .addCase(removeCollaborator.rejected, (state, action) => {
        state.removeCollaboratorLoading = false;
        state.removeCollaboratorError = action.payload;
      });

    // Change collaborator role
    builder
      .addCase(changeCollaboratorRole.pending, (state) => {
        state.changeRoleLoading = true;
        state.changeRoleError = null;
      })
      .addCase(changeCollaboratorRole.fulfilled, (state, action) => {
        state.changeRoleLoading = false;
        const project = state.projects.find(p => p._id === action.payload.projectId);
        if (project) {
          const collaborator = project.collaborators.find(c => {
            const collaboratorId = typeof c.userId === 'object' ? c.userId._id : c.userId;
            return collaboratorId === action.payload.userId;
          });
          if (collaborator) {
            collaborator.role = action.payload.role;
          }
        }
        if (state.selectedProject && state.selectedProject._id === action.payload.projectId) {
          const collaborator = state.selectedProject.collaborators.find(c => {
            const collaboratorId = typeof c.userId === 'object' ? c.userId._id : c.userId;
            return collaboratorId === action.payload.userId;
          });
          if (collaborator) {
            collaborator.role = action.payload.role;
          }
        }
      })
      .addCase(changeCollaboratorRole.rejected, (state, action) => {
        state.changeRoleLoading = false;
        state.changeRoleError = action.payload;
      });

    // Leave project
    builder
      .addCase(leaveProject.pending, (state) => {
        state.leaveProjectLoading = true;
        state.leaveProjectError = null;
      })
      .addCase(leaveProject.fulfilled, (state, action) => {
        state.leaveProjectLoading = false;
        state.projects = state.projects.filter(project => project._id !== action.payload);
        if (state.selectedProject && state.selectedProject._id === action.payload) {
          state.selectedProject = state.projects.length > 0 ? state.projects[0] : null;
        }
      })
      .addCase(leaveProject.rejected, (state, action) => {
        state.leaveProjectLoading = false;
        state.leaveProjectError = action.payload;
      });

    // Add team to project
    builder
      .addCase(addTeamToProject.pending, (state) => {
        state.addTeamLoading = true;
        state.addTeamError = null;
      })
      .addCase(addTeamToProject.fulfilled, (state, action) => {
        state.addTeamLoading = false;
        const project = state.projects.find(p => p._id === action.payload.projectId);
        if (project) {
          project.teams.push(action.payload.team._id);
        }
        if (state.selectedProject && state.selectedProject._id === action.payload.projectId) {
          state.selectedProject.teams.push(action.payload.team._id);
        }
      })
      .addCase(addTeamToProject.rejected, (state, action) => {
        state.addTeamLoading = false;
        state.addTeamError = action.payload;
      });

    // Remove team from project
    builder
      .addCase(removeTeamFromProject.pending, (state) => {
        state.removeTeamLoading = true;
        state.removeTeamError = null;
      })
      .addCase(removeTeamFromProject.fulfilled, (state, action) => {
        state.removeTeamLoading = false;
        const project = state.projects.find(p => p._id === action.payload.projectId);
        if (project) {
          project.teams = project.teams.filter(teamId => teamId !== action.payload.teamId);
        }
        if (state.selectedProject && state.selectedProject._id === action.payload.projectId) {
          state.selectedProject.teams = state.selectedProject.teams.filter(teamId => teamId !== action.payload.teamId);
        }
      })
      .addCase(removeTeamFromProject.rejected, (state, action) => {
        state.removeTeamLoading = false;
        state.removeTeamError = action.payload;
      });

    // Invite collaborator
    builder
      .addCase(inviteCollaborator.pending, (state) => {
        state.inviteCollaboratorLoading = true;
        state.inviteCollaboratorError = null;
      })
      .addCase(inviteCollaborator.fulfilled, (state, action) => {
        state.inviteCollaboratorLoading = false;
        // Add invitation to the project
        const project = state.projects.find(p => p._id === action.payload.projectId);
        if (project && !project.invitations) {
          project.invitations = [];
        }
        if (project) {
          project.invitations.push({
            email: action.payload.email,
            status: 'pending',
            invitedAt: new Date().toISOString()
          });
        }
        if (state.selectedProject && state.selectedProject._id === action.payload.projectId) {
          if (!state.selectedProject.invitations) {
            state.selectedProject.invitations = [];
          }
          state.selectedProject.invitations.push({
            email: action.payload.email,
            status: 'pending',
            invitedAt: new Date().toISOString()
          });
        }
      })
      .addCase(inviteCollaborator.rejected, (state, action) => {
        state.inviteCollaboratorLoading = false;
        state.inviteCollaboratorError = action.payload;
      });

    // Respond to collaboration invitation
    builder
      .addCase(respondToCollaborationInvitation.pending, (state) => {
        state.respondToInvitationLoading = true;
        state.respondToInvitationError = null;
      })
      .addCase(respondToCollaborationInvitation.fulfilled, (state, action) => {
        state.respondToInvitationLoading = false;
        // Update the project with the new data
        const projectIndex = state.projects.findIndex(p => p._id === action.payload.projectId);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = action.payload.project;
        }
        if (state.selectedProject && state.selectedProject._id === action.payload.projectId) {
          state.selectedProject = action.payload.project;
        }
      })
      .addCase(respondToCollaborationInvitation.rejected, (state, action) => {
        state.respondToInvitationLoading = false;
        state.respondToInvitationError = action.payload;
      });

    // Fetch pending collaboration invitations
    builder
      .addCase(fetchPendingCollaborationInvitations.pending, (state) => {
        state.pendingInvitationsLoading = true;
        state.pendingInvitationsError = null;
      })
      .addCase(fetchPendingCollaborationInvitations.fulfilled, (state, action) => {
        state.pendingInvitationsLoading = false;
        state.pendingInvitations = action.payload;
      })
      .addCase(fetchPendingCollaborationInvitations.rejected, (state, action) => {
        state.pendingInvitationsLoading = false;
        state.pendingInvitationsError = action.payload;
      });
  },
});

export const {
  setSelectedProject,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearAddCollaboratorError,
  clearRemoveCollaboratorError,
  clearChangeRoleError,
  clearLeaveProjectError,
  clearAddTeamError,
  clearRemoveTeamError,
  clearInviteCollaboratorError,
  clearRespondToInvitationError,
  clearPendingInvitationsError,
} = projectsSlice.actions;

export default projectsSlice.reducer; 