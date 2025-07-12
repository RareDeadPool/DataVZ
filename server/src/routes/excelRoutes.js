const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const excelController = require('../controllers/excelController');

const upload = multer({ dest: path.resolve(__dirname, '../../uploads/') });

router.post('/upload', auth, upload.single('file'), excelController.uploadExcel);
router.get('/recent', auth, excelController.getRecentUploads);
router.get('/analytics/summary', auth, excelController.getAnalyticsSummary);
router.get('/project/:projectId', auth, excelController.getUploadsByProject);
router.get('/:id', auth, excelController.getUploadById);
router.delete('/:id', auth, excelController.deleteUpload);

module.exports = router; 