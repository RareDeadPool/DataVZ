const mongoose = require('mongoose');

const ChartHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  prompt: { type: String, required: true },
  chartConfig: { type: Object, required: true },
  favorite: { type: Boolean, default: false },
  shareId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChartHistory', ChartHistorySchema); 