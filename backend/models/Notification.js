const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'announcement',
  'assignment',
  'exam',
  'homework',
  'academic_feedback',
  'fee',
  'attendance',
  'admission',
  'system'
];

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String },
    // Route the notification centre should jump to when clicked.
    link: String,
    announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: String,
    read: { type: Boolean, default: false },
    readAt: Date,
    // Quiet hours defer rather than drop: the row is created immediately and
    // the flush job sends email when the window closes.
    deferred: { type: Boolean, default: false },
    deferredUntil: Date,
    delivery: {
      inApp: { at: Date },
      email: { at: Date, error: String }
    },
    createdAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ deferredUntil: 1, deferred: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
