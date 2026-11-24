const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: String,
  summary: String,
  content: String,
  image: String,
  category: { type: String, default: 'general' },
  tags: [String],
  author: String,
  date: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  // Draft -> scheduled -> published lifecycle. `isPublished` is kept in sync
  // so older queries continue to work unchanged.
  status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'published' },
  publishAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);