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

// GET /api/excel/analytics/summary
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    // 1. File type breakdown
    const fileTypeAgg = await ExcelData.aggregate([
      { $match: { userId } },
      { $group: { _id: { $substr: ["$filename", { $subtract: [ { $strLenCP: "$filename" }, 3 ] }, 3 ] }, count: { $sum: 1 } } },
    ]);
    // 2. Uploads per week (trend)
    const weekAgg = await ExcelData.aggregate([
      { $match: { userId } },
      { $group: {
        _id: { $isoWeek: "$uploadDate" },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);
    // 3. Uploads by project
    const projectAgg = await ExcelData.aggregate([
      { $match: { userId } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } },
    ]);
    // 4. Uploads by user (admin only)
    let userAgg = [];
    if (req.user.isAdmin) {
      userAgg = await ExcelData.aggregate([
        { $group: { _id: "$userId", count: { $sum: 1 } } },
      ]);
    }
    res.json({ fileTypeAgg, weekAgg, projectAgg, userAgg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
};

// GET /api/excel/analytics/team
exports.getTeamAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const Team = require('../models/Team');
    const userTeams = await Team.find({ 'members.userId': userId });
    const teamIds = userTeams.map(t => t._id);
    // Aggregate uploads by team
    const teamAgg = await ExcelData.aggregate([
      { $match: { projectId: { $ne: null } } },
      { $lookup: {
        from: 'projects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'project',
      }},
      { $unwind: '$project' },
      { $match: { 'project.teams': { $in: teamIds } } },
      { $unwind: '$project.teams' },
      { $group: { _id: '$project.teams', count: { $sum: 1 } } },
    ]);
    res.json({ teamAgg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch team analytics' });
  }
}; 