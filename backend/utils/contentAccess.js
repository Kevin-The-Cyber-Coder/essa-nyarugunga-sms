const { can, canManageCategory, normalizeRole } = require('../config/roles');

const CONTENT_TYPES = Object.freeze({ news: 'news', gallery: 'gallery' });

const isContentManager = (role) => {
  const r = normalizeRole(role);
  return can(r, 'content:create') || can(r, 'content:edit') || can(r, 'content:delete') || can(r, 'content:publish');
};

// Legacy categories (events, notices, ...) are treated as general content.
const contentCategory = (value) => {
  const allowed = ['academic', 'discipline', 'financial', 'general'];
  return allowed.includes(value) ? value : 'general';
};

const canManage = (role, category) => {
  const r = normalizeRole(role);
  return isContentManager(r) && canManageCategory(r, contentCategory(category));
};

// Derive `status` and `isPublished` from one authoritative input so the public
// site and the management views can never disagree.
const lifecycle = ({ status, publishAt, isPublished } = {}) => {
  const now = new Date();
  let next = status;
  if (!next) {
    if (isPublished === true) next = 'published';
    else if (publishAt && new Date(publishAt) > now) next = 'scheduled';
    else next = 'draft';
  }
  if (!['draft', 'scheduled', 'published'].includes(next)) next = 'draft';
  const at = publishAt ? new Date(publishAt) : null;
  if (next === 'scheduled' && (!at || at <= now)) next = 'published';
  return {
    status: next,
    publishAt: next === 'scheduled' ? at : null,
    isPublished: next === 'published'
  };
};

const publicVisibility = () => ({
  status: 'published',
  isPublished: true,
  $or: [{ publishAt: null }, { publishAt: { $lte: new Date() } }]
});

module.exports = {
  CONTENT_TYPES,
  contentCategory,
  isContentManager,
  canManage,
  lifecycle,
  publicVisibility
};
