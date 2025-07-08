const ExcelData = require('../models/ExcelData');
const XLSX = require('xlsx');
const fs = require('fs');

// POST /api/excel/upload
exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    // Remove file after parsing
    fs.unlinkSync(req.file.path);
    // Save to DB
    const excelData = new ExcelData({
      userId: req.user.userId,
      projectId: req.body.projectId || req.query.projectId,
      filename: req.file.originalname,
      data,
    });
    await excelData.save();
    // Return preview (first 10 rows)
    res.json({ preview: data.slice(0, 10), id: excelData._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload and parse file' });
  }
};

// GET /api/excel/recent
exports.getRecentUploads = async (req, res) => {
  try {
    const uploads = await ExcelData.find({ userId: req.user.userId })
      .sort({ uploadDate: -1 })
      .limit(5);
    res.json(uploads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recent uploads' });
  }
};

// GET /api/excel/:id
exports.getUploadById = async (req, res) => {
  try {
    const { id } = req.params;
    const upload = await ExcelData.findOne({ _id: id, userId: req.user.userId });
    if (!upload) return res.status(404).json({ error: 'Upload not found' });
    res.json(upload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch upload' });
  }
};

// DELETE /api/excel/:id
exports.deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const upload = await ExcelData.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!upload) return res.status(404).json({ error: 'Upload not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete upload' });
  }
}; 