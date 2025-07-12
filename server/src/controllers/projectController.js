const Project = require('../models/Project');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not found in request' });
    }
    const { name, description, category } = req.body;
    const userId = req.user.userId;
    
    // Check if user already has a project with this name
    const existingProject = await Project.findOne({
      name,
      owner: userId
    });
    if (existingProject) {
      return res.status(403).json({ error: 'You already have a project with this name.' });
    }
    
    const project = await Project.create({
      name,
      description,
      category,
      owner: userId,
    });
    res.status(201).json(project);
  } catch (err) {
    console.error('Error in createProject:', err);
    res.status(500).json({ error: 'Failed to create project', details: err.message });
  }
};

// Get all projects for the logged-in user
exports.getProjects = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: user not found in request' });
    }
    const userId = req.user.userId;
    const projects = await Project.find({ owner: userId })
      .populate('owner', 'name email avatar')
      .sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error('Error in getProjects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get a single project by ID (if user is owner)
exports.getProjectById = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('🔍 getProjectById - User ID:', userId);
    console.log('🔍 getProjectById - Project ID:', req.params.id);
    
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar');
    
    if (!project) {
      console.log('❌ Project not found');
      return res.status(404).json({ error: 'Project not found' });
    }
    
    console.log('🔍 getProjectById - Project owner:', project.owner?._id || project.owner);
    
    // Check if user is the owner
    if (project.owner._id.toString() !== userId.toString()) {
      console.log('❌ Access denied - user is not owner');
      return res.status(403).json({ error: 'You do not have access to this project.' });
    }
    
    console.log('✅ Access granted - user is owner');
    res.json({ ...project.toObject(), userRole: 'owner' });
  } catch (err) {
    console.error('❌ Error in getProjectById:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Update a project (only owner)
exports.updateProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only the project owner can update this project.' });
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
    const projectId = req.params.id;
    
    console.log(`Attempting to delete project ${projectId} by user ${userId}`);
    
    const project = await Project.findById(projectId);
    if (!project) {
      console.log(`Project ${projectId} not found in database`);
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.owner.toString() !== userId.toString()) {
      console.log(`User ${userId} is not the owner of project ${projectId}. Owner is ${project.owner}`);
      return res.status(403).json({ error: 'Only the project owner can delete this project' });
    }
    
    // Clean up related data
    const Chart = require('../models/Chart');
    const ExcelData = require('../models/ExcelData');
    
    // Delete all charts for this project
    const deletedCharts = await Chart.deleteMany({ projectId: projectId });
    console.log(`Deleted ${deletedCharts.deletedCount} charts for project ${projectId}`);
    
    // Delete all uploaded files for this project
    const deletedFiles = await ExcelData.deleteMany({ projectId: projectId });
    console.log(`Deleted ${deletedFiles.deletedCount} uploaded files for project ${projectId}`);
    
    // Delete the project
    await Project.findByIdAndDelete(projectId);
    console.log(`Project ${projectId} deleted successfully by user ${userId}`);
    
    res.json({ 
      success: true, 
      message: 'Project deleted successfully',
      deletedCharts: deletedCharts.deletedCount,
      deletedFiles: deletedFiles.deletedCount
    });
  } catch (err) {
    console.error('Error in deleteProject:', err);
    res.status(500).json({ error: 'Failed to delete project', details: err.message });
  }
}; 