const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, trim: true },
  excelData: { type: Array, default: [] },
  uploadedFiles: { type: Array, default: [] },
  charts: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema); 