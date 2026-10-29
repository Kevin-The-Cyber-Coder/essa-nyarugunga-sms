const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { resolveAnnouncementRecipients } = require('./announcementRecipients');
const { notifyMany } = require('./notifier');

// Fan-out. Fire-and-forget from the caller's point of view: the announcement
// is already stored, and a slow mailbox must not hold up the post. Recipient
// resolution is the same predicate that decides portal visibility, minus staff
// oversight, so nobody is notified about something they cannot see and nobody
// who was addressed misses it.
const broadcastAnnouncement = (announcement) => {
  return resolveAnnouncementRecipients(announcement)
    .then(async (recipients) => {
      if (!recipients.length) return 0;
      const author = await User.findById(announcement.createdBy).select('fullName').lean();
      await notifyMany(recipients, {
        type: 'announcement',
        title: announcement.title,
        body: String(announcement.content || '').replace(/\s+/g, ' ').substring(0, 200),
        link: '/announcements',
        announcementId: announcement._id,
        actorId: announcement.createdBy,
        actorName: (author && author.fullName) || 'Administration'
      });
      return recipients.length;
    })
    .catch(err => {
      console.error('Announcement notification failed:', err.message);
      return 0;
    });
};

// Promotes every held notice whose scheduled time has arrived: stamp it as
// published, then fan it out. Run periodically rather than trusting a single
// long timer per notice, so a restart or a paused process still catches up.
const publishDueAnnouncements = async () => {
  const now = new Date();
  const due = await Announcement.find({
    isActive: true,
    publishedAt: null,
    scheduledAt: { $ne: null, $lte: now }
  });

  for (const announcement of due) {
    announcement.publishedAt = now;
    await announcement.save();
    await broadcastAnnouncement(announcement);
  }
  return due.length;
};

const startAnnouncementScheduler = (intervalMs = 60000) => {
  const timer = setInterval(() => {
    publishDueAnnouncements().catch(() => {});
  }, intervalMs);
  // Never hold a short-lived process open on shutdown.
  if (typeof timer.unref === 'function') timer.unref();
  return timer;
};

module.exports = { broadcastAnnouncement, publishDueAnnouncements, startAnnouncementScheduler };