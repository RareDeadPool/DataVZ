const Activity = require('../models/Activity');

// Create a new activity
exports.createActivity = async (req, res) => {
  try {
    const { action, targetType, targetId } = req.body;
    const activity = await Activity.create({
      userId: req.user.userId,
      action,
      targetType,
      targetId,
    });
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
};

// Get all activities for the logged-in user
exports.getActivities = async (req, res) => {
  try {
    const userId = req.user.userId;
    const activities = await Activity.find({ userId }).sort({ timestamp: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

// Get a single activity by ID (if user is owner)
exports.getActivityById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const activity = await Activity.findOne({ _id: req.params.id, userId });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

// Delete an activity (only owner)
exports.deleteActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, userId });
    if (!activity) return res.status(404).json({ error: 'Activity not found or not authorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
}; 