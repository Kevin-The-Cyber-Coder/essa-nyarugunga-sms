const mongoose = require('mongoose');

// Per-person delivery settings. One document per user, created lazily on first
// read so the defaults apply to everybody who has never opened settings.
const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },

    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    },

    // Per-type switches so an assignment reminder can be muted without losing
    // other alerts. These match Notification.NOTIFICATION_TYPES.
    types: {
      announcement: { type: Boolean, default: true },
      assignment: { type: Boolean, default: true },
      exam: { type: Boolean, default: true },
      academic_feedback: { type: Boolean, default: true },
      fee: { type: Boolean, default: true },
      admission: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
      finance: { type: Boolean, default: true },
      discipline: { type: Boolean, default: true },
      resource: { type: Boolean, default: true },
      content: { type: Boolean, default: true }
    },

    quietHours: {
      enabled: { type: Boolean, default: false },
      // Minutes past midnight so comparisons do not depend on parsing "22:00".
      start: { type: Number, default: 1320, min: 0, max: 1439 },
      end: { type: Number, default: 360, min: 0, max: 1439 }
    },

    updatedAt: { type: Date, default: Date.now }
  },
  { minimize: false }
);

notificationPreferenceSchema.statics.isQuietNow = function (prefs, at = new Date()) {
  if (!prefs || !prefs.quietHours || !prefs.quietHours.enabled) return false;
  const now = at.getHours() * 60 + at.getMinutes();
  const { start, end } = prefs.quietHours;
  return start <= end ? now >= start && now < end : now >= start || now < end;
};

notificationPreferenceSchema.statics.getFor = async function (userId) {
  let prefs = await this.findOne({ userId });
  if (!prefs) prefs = await this.create({ userId });
  return prefs;
};

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
