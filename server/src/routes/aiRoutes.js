const express = require('express');
const router = express.Router();
const { askGemini, askGeminiSummary } = require('../utils/geminiService');
const ChartHistory = require('../models/ChartHistory');
const crypto = require('crypto');

router.post('/ask', async (req, res) => {
  const { prompt, data } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    const result = await askGemini(prompt, data);
    if (result.error) {
      console.error('Gemini AI error:', result.error);
      if (result.raw) {
        console.error('Gemini raw response:', result.raw);
      }
      return res.status(500).json({ error: result.error, raw: result.raw });
    }
    res.json({ chartConfig: result.chartConfig });
  } catch (err) {
    console.error('Server error in /api/ai/ask:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save chart to history
router.post('/history', async (req, res) => {
  const { prompt, chartConfig, favorite } = req.body;
  try {
    const entry = new ChartHistory({ prompt, chartConfig, favorite: !!favorite });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chart history (latest 20)
router.get('/history', async (req, res) => {
  try {
    const history = await ChartHistory.find().sort({ createdAt: -1 }).limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle favorite status
router.post('/history/:id/favorite', async (req, res) => {
  try {
    const entry = await ChartHistory.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Chart history entry not found' });
    entry.favorite = !entry.favorite;
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate a shareable link for a chart
router.post('/history/:id/share', async (req, res) => {
  try {
    const entry = await ChartHistory.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Chart history entry not found' });
    if (!entry.shareId) {
      entry.shareId = crypto.randomBytes(6).toString('hex');
      await entry.save();
    }
    res.json({ shareId: entry.shareId, url: `/api/ai/share/${entry.shareId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch a chart by shareId
router.get('/share/:shareId', async (req, res) => {
  try {
    const entry = await ChartHistory.findOne({ shareId: req.params.shareId });
    if (!entry) return res.status(404).json({ error: 'Shared chart not found' });
    res.json({ prompt: entry.prompt, chartConfig: entry.chartConfig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New: AI summary endpoint
router.post('/summary', async (req, res) => {
  const { prompt, data } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    const result = await askGeminiSummary(prompt, data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 