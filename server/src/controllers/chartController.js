const Chart = require('../models/Chart');

// Create a new chart
exports.createChart = async (req, res) => {
  try {
    const { projectId, type, data, xKey, yKey } = req.body;
    const chart = await Chart.create({
      projectId,
      userId: req.user.userId,
      type,
      data,
      xKey,
      yKey,
    });
    res.status(201).json(chart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chart' });
  }
};

// Get all charts for the logged-in user
exports.getCharts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId } = req.query;
    const filter = { userId };
    if (projectId) filter.projectId = projectId;
    const charts = await Chart.find(filter);
    res.json(charts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch charts' });
  }
};

// Get a single chart by ID (if user is owner)
exports.getChartById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chart = await Chart.findOne({ _id: req.params.id, userId });
    if (!chart) return res.status(404).json({ error: 'Chart not found' });
    res.json(chart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
};

// Update a chart (only owner)
exports.updateChart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chart = await Chart.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true }
    );
    if (!chart) return res.status(404).json({ error: 'Chart not found or not authorized' });
    res.json(chart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update chart' });
  }
};

// Delete a chart (only owner)
exports.deleteChart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chart = await Chart.findOneAndDelete({ _id: req.params.id, userId });
    if (!chart) return res.status(404).json({ error: 'Chart not found or not authorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chart' });
  }
}; 