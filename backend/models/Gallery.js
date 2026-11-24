const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, default: 'general' },
  description: String,
  photographer: { type: String, default: 'School Media Team' },
  date: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'published' },
  publishAt: { type: Date, default: null }
});

module.exports = mongoose.model('Gallery', gallerySchema);