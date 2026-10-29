const mongoose = require('mongoose');

// One row per (blocker -> blocked) direction. A block is enforced regardless of
// who recorded it, so the contact checks look for either direction rather than
// just the caller's own rows.
const blockSchema = new mongoose.Schema({
  blockerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blockedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
blockSchema.index({ blockedId: 1 });

module.exports = mongoose.model('Block', blockSchema);