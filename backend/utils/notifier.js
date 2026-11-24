const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const User = require('../models/User');
const { sendNotificationEmail } = require('./emailService');

// One entry point for every in-app alert. In-app is written immediately;
// email follows the recipient's channel and quiet-hour settings. Only these
// two channels are supported.

const quietWindowEnd = (prefs, at = new Date()) => {
  const { start, end } = prefs.quietHours;
  const nowMinutes = at.getHours() * 60 + at.getMinutes();
  const result = new Date(at);

  if (start <= end) {
    result.setHours(Math.floor(end / 60), end % 60, 0, 0);
    if (result <= at) result.setDate(result.getDate() + 1);
    return result;
  }

  if (nowMinutes >= start) result.setDate(result.getDate() + 1);
  result.setHours(Math.floor(end / 60), end % 60, 0, 0);
  return result;
};

const channelIsOn = (prefs, channel) => !!(prefs.channels && prefs.channels[channel]);

const notify = async (input) => {
  const {
    userId, type, title, body = '', link = null,
    announcementId = null, actorId = null, actorName = null
  } = input || {};

  if (!userId || !type || !title) return { skipped: true, reason: 'incomplete' };
  if (!Notification.NOTIFICATION_TYPES.includes(type)) return { skipped: true, reason: 'unknown_type' };
  if (actorId && String(actorId) === String(userId)) return { skipped: true, reason: 'self' };

  try {
    const [prefs, user] = await Promise.all([
      NotificationPreference.getFor(userId),
      User.findById(userId).select('fullName email isActive').lean()
    ]);

    if (!user || !user.isActive) return { skipped: true, reason: 'no_recipient' };
    if (!prefs.types[type]) return { skipped: true, reason: 'type_muted' };

    const now = new Date();
    const quietNow = NotificationPreference.isQuietNow(prefs, now);
    const row = await Notification.create({
      userId, type, title, body, link, announcementId, actorId, actorName,
      delivery: { inApp: { at: now } },
      deferred: quietNow,
      deferredUntil: quietNow ? quietWindowEnd(prefs, now) : null
    });

    if (quietNow) return { notification: row, deferred: true, channels: ['inApp'] };

    const delivered = ['inApp'];
    if (channelIsOn(prefs, 'email')) {
      try {
        const sent = await sendNotificationEmail(user, { title, body, link });
        if (sent) {
          row.delivery.email = { at: new Date() };
          await row.save();
          delivered.push('email');
        }
      } catch {
        row.delivery.email = { error: 'send_failed' };
        await row.save();
      }
    }

    return { notification: row, deferred: false, channels: delivered };
  } catch (error) {
    return { skipped: true, reason: 'error', error: error.message };
  }
};

const notifyMany = async (userIds, input) => {
  const ids = [...new Set((Array.isArray(userIds) ? userIds : [])
    .filter(Boolean)
    .map(String)
    .filter(id => String(id) !== String(input.actorId)))];
  const results = await Promise.all(ids.map(userId => notify({ ...input, userId })));
  return {
    attempted: ids.length,
    delivered: results.filter(r => !r.skipped).length,
    results
  };
};

const flushDeferred = async () => {
  const now = new Date();
  const pending = await Notification.find({ deferred: true, deferredUntil: { $lte: now } }).limit(200);
  let flushed = 0;

  for (const row of pending) {
    try {
      const [prefs, user] = await Promise.all([
        NotificationPreference.getFor(row.userId),
        User.findById(row.userId).select('fullName email isActive').lean()
      ]);

      if (NotificationPreference.isQuietNow(prefs, now)) {
        row.deferredUntil = quietWindowEnd(prefs, now);
        await row.save();
        continue;
      }

      if (!user || !user.isActive) {
        row.deferred = false;
        await row.save();
        continue;
      }

      if (channelIsOn(prefs, 'email') && !row.delivery.email?.at && !row.delivery.email?.error) {
        try {
          const sent = await sendNotificationEmail(user, { title: row.title, body: row.body, link: row.link });
          row.delivery.email = sent ? { at: new Date() } : { error: 'not_configured' };
        } catch {
          row.delivery.email = { error: 'send_failed' };
        }
      }

      row.deferred = false;
      row.deferredUntil = null;
      await row.save();
      flushed += 1;
    } catch { /* skip this row rather than aborting the batch */ }
  }

  return flushed;
};

let flushTimer = null;
const startFlushLoop = (intervalMs = 60 * 1000) => {
  if (flushTimer) return flushTimer;
  flushTimer = setInterval(() => { flushDeferred().catch(() => {}); }, intervalMs);
  if (typeof flushTimer.unref === 'function') flushTimer.unref();
  return flushTimer;
};

const stopFlushLoop = () => {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = null;
};

module.exports = { notify, notifyMany, flushDeferred, startFlushLoop, stopFlushLoop, quietWindowEnd };
