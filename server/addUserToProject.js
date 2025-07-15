const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Project = require('./src/models/Project');
const User = require('./src/models/User');

async function addUserToProject(userEmail, projectId, role = 'editor') {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.error('User not found with email:', userEmail);
      return;
    }
    console.log('Found user:', user.email, 'ID:', user._id);

    // Find project by ID
    const project = await Project.findById(projectId);
    if (!project) {
      console.error('Project not found with ID:', projectId);
      return;
    }
    console.log('Found project:', project.name, 'ID:', project._id);

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(
      c => c.userId.toString() === user._id.toString()
    );

    if (existingCollaborator) {
      console.log('User is already a collaborator with role:', existingCollaborator.role);
      return;
    }

    // Add user as collaborator
    project.collaborators.push({
      userId: user._id,
      role: role
    });

    await project.save();
    console.log(`✅ Successfully added ${userEmail} as ${role} to project "${project.name}"`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Usage example:
// node addUserToProject.js "user@example.com" "projectId" "editor"

const args = process.argv.slice(2);
if (args.length >= 2) {
  const [userEmail, projectId, role = 'editor'] = args;
  addUserToProject(userEmail, projectId, role);
} else {
  console.log('Usage: node addUserToProject.js <userEmail> <projectId> [role]');
  console.log('Example: node addUserToProject.js "admin@example.com" "68725cfa2b716655e6e48b69" "editor"');
} 