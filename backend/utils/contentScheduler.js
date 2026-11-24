const News = require('../models/News');
const Gallery = require('../models/Gallery');

const publishDue = async () => {
  const now = new Date();
  const filter = { status: 'scheduled', publishAt: { $lte: now } };
  const update = { $set: { status: 'published', isPublished: true } };
  await Promise.all([
    News.updateMany(filter, update),
    Gallery.updateMany(filter, update)
  ]);
};

const startContentScheduler = () => {
  const timer = setInterval(() => {
    publishDue().catch((error) => console.error('Content scheduler:', error.message));
  }, 60 * 1000);
  timer.unref();
  return timer;
};

module.exports = { publishDue, startContentScheduler };
