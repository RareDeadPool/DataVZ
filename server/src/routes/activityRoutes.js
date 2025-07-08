const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const activityController = require('../controllers/activityController');

router.post('/', auth, activityController.createActivity);
router.get('/', auth, activityController.getActivities);
router.get('/:id', auth, activityController.getActivityById);
router.delete('/:id', auth, activityController.deleteActivity);

module.exports = router; 