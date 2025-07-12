const ExcelData = require('../models/ExcelData');
const XLSX = require('xlsx');
const fs = require('fs');
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef'; // 32 bytes for AES-256
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(text));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text || typeof text !== 'string') {
    console.warn('Attempted to decrypt non-string or empty value:', text);
    return []; // Return empty array for missing/undefined data
  }
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
  } catch (err) {
    console.warn('Failed to decrypt text:', err.message);
    return []; // Return empty array on decryption failure
  }
}

// POST /api/excel/upload
exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log('Parsed data:', data); // Debug log
    // Remove file after parsing
    fs.unlinkSync(req.file.path);
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'No data found in file. Please upload a valid Excel or CSV file with a header row.' });
    }
    // Extract columns and preview
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const preview = data.slice(0, 10);
    // Encrypt columns and preview
    const encryptedColumns = encrypt(columns);
    const encryptedPreview = encrypt(preview);
    // Save to DB
    const excelData = new ExcelData({
      userId: req.user.userId,
      projectId: req.body.projectId || req.query.projectId,
      filename: req.file.originalname,
      columns: encryptedColumns,
      preview: encryptedPreview,
    });
    await excelData.save();
    // Return preview (first 10 rows, decrypted)
    res.json({ preview, id: excelData._id, columns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload and parse file' });
  }
};

// GET /api/excel/recent
exports.getRecentUploads = async (req, res) => {
  try {
    const uploads = await ExcelData.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5);
    // Decrypt columns and preview for each upload
    const result = uploads.map(upload => ({
      ...upload.toObject(),
      columns: decrypt(upload.columns),
      preview: decrypt(upload.preview),
    }));
    res.json(result);
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
    // Decrypt columns and preview
    const columns = decrypt(upload.columns);
    const preview = decrypt(upload.preview);
    res.json({
      ...upload.toObject(),
      columns,
      preview,
    });
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

// GET /api/excel/project/:projectId
exports.getUploadsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const uploads = await ExcelData.find({ projectId }).populate('userId', 'name avatar');
    // Decrypt columns and preview for each upload, skip if decryption fails
    const result = uploads.map(upload => {
      try {
        const columns = decrypt(upload.columns || '');
        const preview = decrypt(upload.preview || '');
        
        // Only include files that have valid columns
        if (columns && Array.isArray(columns) && columns.length > 0) {
          return {
            ...upload.toObject(),
            columns,
            preview,
          };
        } else {
          console.warn('Upload has no valid columns:', upload._id);
          return null;
        }
      } catch (err) {
        console.error('Failed to decrypt upload', upload._id, err.message);
        return null;
      }
    }).filter(Boolean);
    
    console.log(`Returning ${result.length} valid files for project ${projectId}`);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch uploads for project' });
  }
}; 