const mongoose = require('mongoose');

const ExcelDataSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  columns: { type: String, required: true }, // Encrypted JSON string
  preview: { type: String, required: true }, // Encrypted JSON string
  // data: { type: String }, // Optionally, encrypted full data
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ExcelData', ExcelDataSchema); 