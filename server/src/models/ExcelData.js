const mongoose = require('mongoose');

const ExcelDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  filename: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  data: { type: Array, required: true }, // Array of row objects
});

module.exports = mongoose.model('ExcelData', ExcelDataSchema); 