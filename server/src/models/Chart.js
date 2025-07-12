const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'bar', 'line', 'pie', etc.
  data: { type: mongoose.Schema.Types.Mixed }, // Chart config/data
  xKey: { type: String },
  yKey: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Chart', chartSchema); 