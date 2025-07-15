const mongoose = require('mongoose');
const { Schema } = mongoose;

const sharedProjectSchema = new Schema({
  token: { type: String, required: true, unique: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  recipientEmail: { type: String },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  usedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('SharedProject', sharedProjectSchema); 