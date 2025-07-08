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
    const projects = await Project.find({ $or: [ { owner: userId }, { collaborators: userId } ] });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get a single project by ID (if user is owner or collaborator)
exports.getProjectById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const project = await Project.findOne({ _id: req.params.id, $or: [ { owner: userId }, { collaborators: userId } ] });
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