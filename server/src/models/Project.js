const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['editor', 'viewer'], default: 'editor' }
}, { _id: false });

const teamRoleSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  role: { type: String, enum: ['editor', 'viewer'], default: 'editor' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [collaboratorSchema], // userId + role
  category: { type: String, trim: true },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  teamRoles: [teamRoleSchema], // teamId + role
  excelData: { type: Array, default: [] },
  uploadedFiles: { type: Array, default: [] },
  charts: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema); 