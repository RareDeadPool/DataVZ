const Project = require('../models/Project');
const SharedProject = require('../models/SharedProject');
const crypto = require('crypto');

const ExcelData = require('../models/ExcelData');
const Chart = require('../models/Chart');
const User = require('../models/User');

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

// Share a project (generate a share token and link, send to recipient email)
const sendEmail = require('../utils/sendEmail');
exports.shareProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const projectId = req.params.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Recipient email is required.' });
    }

    // Only owner can share
    const project = await Project.findById(projectId);
    if (!project || project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only the project owner can share this project.' });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    await SharedProject.create({
      token,
      projectId,
      used: false,
    });

    // Construct share link
    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-project?token=${token}`;

    // Send email to recipient
    try {
      await sendEmail({
        to: email,
        subject: 'You have been invited to a DataViz project',
        text: `You have been invited to access a DataViz project. Click the link to accept: ${shareLink}`,
        html: `<p>You have been invited to access a DataViz project.</p><p><a href="${shareLink}">Click here to accept the project</a></p>`
      });
    } catch (emailErr) {
      console.error('Failed to send share email:', emailErr);
      // Optionally, you can still return the link even if email fails
      return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
    }

    res.json({ shareLink });
  } catch (err) {
    console.error('Error in shareProject:', err);
    res.status(500).json({ error: 'Failed to generate share link' });
  }
};

// Accept a shared project (copy to user account)
exports.acceptSharedProject = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { token } = req.body;
    const shared = await SharedProject.findOne({ token });
    if (!shared || shared.used) {
      return res.status(400).json({ error: 'Invalid or already used token.' });
    }

    // Copy the project
    const origProject = await Project.findById(shared.projectId);
    if (!origProject) {
      return res.status(404).json({ error: 'Original project not found.' });
    }

    // Create a new project for the user (copy fields except owner)
    const newProject = await Project.create({
      name: origProject.name + ' (Copy)',
      description: origProject.description,
      category: origProject.category,
      owner: userId,
    });

    // Optionally: Copy charts/files if needed (not implemented here)

    shared.used = true;
    shared.usedBy = userId;
    await shared.save();

    res.json({ success: true, newProject });
  } catch (err) {
    console.error('Error in acceptSharedProject:', err);
    res.status(500).json({ error: 'Failed to accept shared project' });
  }
}; 

// ANALYTICS: Platform summary for admin panel
exports.getPlatformAnalyticsSummary = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only.' });
    }
    // Totals
    const [userCount, projectCount, excelCount, chartCount] = await Promise.all([
      User.countDocuments({}),
      require('../models/Project').countDocuments({}),
      ExcelData.countDocuments({}),
      Chart.countDocuments({}),
    ]);
    // Usage over time (last 30 days, daily)
    const chartUsage = await Chart.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    // Most popular chart types (all time)
    const popularTypes = await Chart.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    res.json({
      userCount,
      projectCount,
      excelCount,
      chartCount,
      chartUsage,
      popularTypes
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 