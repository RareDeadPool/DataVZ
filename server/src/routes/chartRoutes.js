const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chartController = require('../controllers/chartController');

router.post('/', auth, chartController.createChart);
router.get('/', auth, chartController.getCharts);
router.get('/:id', auth, chartController.getChartById);
router.put('/:id', auth, chartController.updateChart);
router.delete('/:id', auth, chartController.deleteChart);

module.exports = router; 