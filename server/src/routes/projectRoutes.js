const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const projectController = require('../controllers/projectController');

router.post('/', auth, projectController.createProject);
router.get('/', auth, projectController.getProjects);
router.get('/analytics/summary', auth, projectController.getPlatformAnalyticsSummary); // admin only
router.get('/:id', auth, projectController.getProjectById);
router.put('/:id', auth, projectController.updateProject);
router.delete('/:id', auth, projectController.deleteProject);
router.post('/:id/share', auth, projectController.shareProject);
router.post('/accept-shared', auth, projectController.acceptSharedProject);

module.exports = router; 