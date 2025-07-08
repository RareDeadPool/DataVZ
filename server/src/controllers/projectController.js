const Project = require('../models/Project');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, category, collaborators } = req.body;
    const project = await Project.create({
      name,
      description,
      category,
      owner: req.user.userId,
      collaborators: collaborators || [],
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
    // Find all teams where the user is a member
    const Team = require('../models/Team');
    const userTeams = await Team.find({ 'members.userId': userId }).select('_id');
    const teamIds = userTeams.map(t => t._id);
    // Find projects where user is owner, collaborator, or in a team assigned to the project
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { collaborators: userId },
        { teams: { $in: teamIds } }
      ]
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get a single project by ID (if user is owner or collaborator)
exports.getProjectById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const Team = require('../models/Team');
    const userTeams = await Team.find({ 'members.userId': userId }).select('_id');
    const teamIds = userTeams.map(t => t._id);
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: userId },
        { collaborators: userId },
        { teams: { $in: teamIds } }
      ]
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Update a project (only owner)
exports.updateProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Project not found or not authorized' });
    res.json(project);
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