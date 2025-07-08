const Project = require('../models/Project');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, category, collaborators, teams } = req.body;
    const userId = req.user.userId;
    // Only allow creation if user is not already a member/collaborator/owner of a project with the same name or for the same team
    const existingProject = await Project.findOne({
      name,
      $or: [
        { owner: userId },
        { collaborators: userId },
        { teams: { $in: teams || [] } }
      ]
    });
    if (existingProject) {
      return res.status(403).json({ error: 'You already have access to a project with this name or team.' });
    }
    // Only allow creation if user is owner/admin of the team (if teams provided)
    if (teams && teams.length > 0) {
      const Team = require('../models/Team');
      const userTeams = await Team.find({ _id: { $in: teams }, 'members.userId': userId });
      const isOwnerOrAdmin = userTeams.some(team => {
        const member = team.members.find(m => m.userId.toString() === userId.toString());
        return member && (member.role === 'owner' || member.role === 'admin');
      });
      if (!isOwnerOrAdmin) {
        return res.status(403).json({ error: 'Only team owners or admins can create projects for this team.' });
      }
    }
    const project = await Project.create({
      name,
      description,
      category,
      owner: userId,
      collaborators: collaborators || [],
      teams: teams || [],
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Get all projects for the logged-in user (owner or collaborator)
exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const Team = require('../models/Team');
    const userTeams = await Team.find({ 'members.userId': userId }).select('_id role');
    const teamIds = userTeams.map(t => t._id);
    // Find projects where user is owner, collaborator, or has a team role
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'collaborators.userId': userId },
        { 'teamRoles.teamId': { $in: teamIds } }
      ]
    });
    // Attach userRole for each project
    const projectsWithRole = projects.map(project => {
      const role = getUserProjectRole(project, userId, userTeams);
      return { ...project.toObject(), userRole: role };
    });
    res.json(projectsWithRole);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Helper to get user role for a project
function getUserProjectRole(project, userId, userTeams) {
  if (project.owner.toString() === userId.toString()) return 'owner';
  // Check collaborators
  const collab = (project.collaborators || []).find(c => c.userId.toString() === userId.toString());
  if (collab) return collab.role;
  // Check team roles
  if (userTeams && userTeams.length > 0 && project.teamRoles && project.teamRoles.length > 0) {
    for (const team of userTeams) {
      const teamRole = project.teamRoles.find(tr => tr.teamId.toString() === team._id.toString());
      if (teamRole) return teamRole.role;
    }
  }
  return null;
}

// Get a single project by ID (if user is owner or collaborator)
exports.getProjectById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const Team = require('../models/Team');
    const userTeams = await Team.find({ 'members.userId': userId }).select('_id role');
    // Populate teams field
    const project = await Project.findById(req.params.id).populate('teams');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const role = getUserProjectRole(project, userId, userTeams);
    if (!role) return res.status(403).json({ error: 'You do not have access to this project.' });
    res.json({ ...project.toObject(), userRole: role });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Update a project (only owner)
exports.updateProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const Team = require('../models/Team');
    const userTeams = await Team.find({ 'members.userId': userId }).select('_id role');
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const role = getUserProjectRole(project, userId, userTeams);
    if (role !== 'owner' && role !== 'editor' && role !== 'admin') {
      return res.status(403).json({ error: 'Only owner, admin, or editor can update this project.' });
    }
    // Only owner can manage team
    if (req.body.teams || req.body.teamRoles) {
      if (role !== 'owner') {
        return res.status(403).json({ error: 'Only owner can manage teams.' });
      }
    }
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete a project (only owner)
exports.deleteProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const project = await Project.findOneAndDelete({ _id: req.params.id, owner: userId });
    if (!project) return res.status(404).json({ error: 'Project not found or not authorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// Add a team to a project
exports.addTeamToProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const project = await Project.findOne({ _id: req.params.id, owner: userId });
    if (!project) return res.status(404).json({ error: 'Project not found or not authorized' });

    const { teamId } = req.body;
    if (!teamId) return res.status(400).json({ error: 'teamId is required' });

    // Avoid duplicates
    if (!project.teams) project.teams = [];
    if (!project.teams.includes(teamId)) {
      project.teams.push(teamId);
      await project.save();
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add team to project' });
  }
};

// Add a controller to set (replace) all teams for a project
exports.setTeamsForProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const project = await Project.findOne({ _id: req.params.id, owner: userId });
    if (!project) return res.status(404).json({ error: 'Project not found or not authorized' });

    const { teamIds } = req.body;
    if (!Array.isArray(teamIds)) return res.status(400).json({ error: 'teamIds (array) is required' });

    project.teams = teamIds;
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to set teams for project' });
  }
}; 