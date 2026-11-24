const express = require('express');

const News = require('../models/News');
const Gallery = require('../models/Gallery');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { uploadNews, uploadGallery } = require('../config/upload');
const {
  CONTENT_TYPES, contentCategory, isContentManager, canManage,
  lifecycle, publicVisibility
} = require('../utils/contentAccess');

const router = express.Router();

const modelFor = (type) => (type === CONTENT_TYPES.gallery ? Gallery : News);

const requireManager = (req, res, next) => {
  if (!isContentManager(req.userRole)) return res.status(403).json({ message: 'Access denied' });
  next();
};

const uploadFor = (type) => (type === CONTENT_TYPES.gallery ? uploadGallery : uploadNews).single('image');

const imageUrl = (req, folder) => req.file
  ? `${req.protocol}://${req.get('host')}/uploads/${folder}/${req.file.filename}`
  : null;

const buildFields = (type, body, role, fileUrl) => {
  const life = lifecycle(body);
  const category = contentCategory(body.category);
  if (type === CONTENT_TYPES.gallery) {
    return {
      title: body.title,
      image: fileUrl || body.image,
      category,
      description: body.description || '',
      date: body.date ? new Date(body.date) : new Date(),
      ...life
    };
  }
  return {
    title: body.title,
    summary: body.summary || '',
    content: body.content || body.summary || '',
    image: fileUrl || body.image || null,
    category,
    tags: Array.isArray(body.tags) ? body.tags : (body.tags ? String(body.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
    ...life
  };
};

// List every status for the embedded management panel.
router.get('/content/:type', authMiddleware, requireManager, async (req, res) => {
  const type = req.params.type;
  if (!Object.values(CONTENT_TYPES).includes(type)) return res.status(400).json({ message: 'Unknown content type' });
  const items = await modelFor(type).find().sort({ date: -1, createdAt: -1 });
  res.json({ success: true, data: items });
});

router.post('/content/:type', authMiddleware, requireManager, (req, res, next) => {
  uploadFor(req.params.type)(req, res, (err) => err ? next(err) : next());
}, async (req, res) => {
  try {
    const type = req.params.type;
    if (!Object.values(CONTENT_TYPES).includes(type)) return res.status(400).json({ message: 'Unknown content type' });
    const category = contentCategory(req.body.category);
    if (!canManage(req.userRole, category)) return res.status(403).json({ message: 'You cannot manage this category' });

    const folder = type === CONTENT_TYPES.gallery ? 'gallery' : 'news';
    const fields = buildFields(type, req.body, req.userRole, imageUrl(req, folder));
    if (type === CONTENT_TYPES.gallery && !fields.image) return res.status(400).json({ message: 'Image is required' });

    const user = await User.findById(req.userId).select('fullName');
    if (type === CONTENT_TYPES.news) fields.author = user?.fullName || 'School';
    const item = await modelFor(type).create(fields);
    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/content/:type/:id', authMiddleware, requireManager, (req, res, next) => {
  uploadFor(req.params.type)(req, res, (err) => err ? next(err) : next());
}, async (req, res) => {
  try {
    const type = req.params.type;
    if (!Object.values(CONTENT_TYPES).includes(type)) return res.status(400).json({ message: 'Unknown content type' });
    const Model = modelFor(type);
    const existing = await Model.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const nextCategory = contentCategory(req.body.category ?? existing.category);
    if (!canManage(req.userRole, nextCategory) || !canManage(req.userRole, contentCategory(existing.category))) {
      return res.status(403).json({ message: 'You cannot manage this category' });
    }

    const folder = type === CONTENT_TYPES.gallery ? 'gallery' : 'news';
    const fields = buildFields(type, { ...existing.toObject(), ...req.body }, req.userRole, imageUrl(req, folder));
    const updated = await Model.findByIdAndUpdate(req.params.id, { ...fields, updatedAt: new Date() }, { new: true });
    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/content/:type/:id', authMiddleware, requireManager, async (req, res) => {
  const type = req.params.type;
  if (!Object.values(CONTENT_TYPES).includes(type)) return res.status(400).json({ message: 'Unknown content type' });
  const item = await modelFor(type).findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!canManage(req.userRole, contentCategory(item.category))) {
    return res.status(403).json({ message: 'You cannot manage this category' });
  }
  await modelFor(type).findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.post('/content/:type/:id/status', authMiddleware, requireManager, async (req, res) => {
  try {
    const type = req.params.type;
    if (!Object.values(CONTENT_TYPES).includes(type)) return res.status(400).json({ message: 'Unknown content type' });
    const item = await modelFor(type).findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (!canManage(req.userRole, contentCategory(item.category))) {
      return res.status(403).json({ message: 'You cannot manage this category' });
    }
    const life = lifecycle({ status: req.body.status, publishAt: req.body.publishAt });
    const updated = await modelFor(type).findByIdAndUpdate(req.params.id, life, { new: true });
    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public read helper used by the website; status is enforced server-side.
router.get('/content/public/:type', async (req, res) => {
  const type = req.params.type;
  if (!Object.values(CONTENT_TYPES).includes(type)) return res.status(400).json({ message: 'Unknown content type' });
  const query = publicVisibility();
  if (req.query.category && req.query.category !== 'all') query.category = req.query.category;
  const items = await modelFor(type).find(query).sort({ date: -1 }).limit(parseInt(req.query.limit || 20));
  res.json({ success: true, data: items });
});

module.exports = router;
