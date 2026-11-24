const express = require('express');

const News = require('../models/News');
const { publicVisibility } = require('../utils/contentAccess');

const router = express.Router();

// Public reads only. All management (create, edit, publish, schedule, delete)
// goes through /api/content/news in contentRoutes.js so drafts, scheduled posts
// and published posts are handled by one lifecycle on every dashboard.
router.get('/news/public', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    const query = publicVisibility();
    if (category && category !== 'all') query.category = category;
    const news = await News.find(query).sort({ date: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, data: [] });
  }
});

router.get('/news/:id', async (req, res) => {
  try {
    const news = await News.findOneAndUpdate(
      { _id: req.params.id, ...publicVisibility() },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/news/:id/view', async (req, res) => {
  try {
    const news = await News.findOneAndUpdate(
      { _id: req.params.id, ...publicVisibility() },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!news) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
