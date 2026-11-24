const express = require('express');

const Gallery = require('../models/Gallery');
const { publicVisibility } = require('../utils/contentAccess');

const router = express.Router();

// Public reads only. Gallery management lives in the shared CMS at
// /api/content/gallery, which enforces categories and publication lifecycle.
router.get('/gallery/public', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const query = publicVisibility();
    if (category && category !== 'all') query.category = category;
    const gallery = await Gallery.find(query).sort({ date: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: gallery });
  } catch (error) {
    res.status(500).json({ success: false, data: [] });
  }
});

router.post('/gallery/:id/download', async (req, res) => {
  try {
    const item = await Gallery.findOneAndUpdate(
      { _id: req.params.id, ...publicVisibility() },
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
