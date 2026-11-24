const mongoose = require('mongoose');

// A document or link pinned to a class for its members. Resources persist for
// the class and remain findable for the whole term.
const classResourceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  title: { type: String, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 500 },
  // Either a stored upload (url/name/kind from the file service) or an external
  // link. Both may be present; the client prefers the upload when there is one.
  url: String,
  name: String,
  mime: String,
  size: Number,
  kind: { type: String, default: 'file' },
  link: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

classResourceSchema.index({ classId: 1, createdAt: -1 });

module.exports = mongoose.model('ClassResource', classResourceSchema);