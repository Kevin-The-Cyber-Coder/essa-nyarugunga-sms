const express = require('express');
const mongoose = require('mongoose');

const ClassResource = require('../models/ClassResource');
const Class = require('../models/Class');
const authMiddleware = require('../middleware/auth');
const { teacherOwnsClass, allowedClassIds, isAdminRole } = require('../utils/access');
const { notifyClass } = require('../utils/classNotify');

const router = express.Router();

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const validId = (id) => mongoose.isValidObjectId(id);

// Read access mirrors the class roster: staff, the teachers of the class, and
// the pupils/guardians enrolled in it. Everyone else gets a 403 rather than an
// empty list, so the caller knows the difference between "no resources" and
// "not yours".
const canViewClass = async (req, classId) => {
  if (isAdminRole(req.userRole)) return true;
  if (req.userRole === 'teacher') return teacherOwnsClass(req.userId, classId);
  const ids = await allowedClassIds(req.userId, req.userRole);
  return Array.isArray(ids) && ids.some((id) => String(id) === String(classId));
};

router.get('/classes/:classId/resources', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    if (!validId(classId)) return fail(res, 400, 'Invalid class id.');
    if (!(await canViewClass(req, classId))) return fail(res, 403, 'You do not have access to this class.');

    const resources = await ClassResource.find({ classId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'fullName role')
      .lean();

    res.json({ success: true, resources });
  } catch (error) {
    fail(res, 500, error.message);
  }
});

router.post('/classes/:classId/resources', authMiddleware, async (req, res) => {
  try {
    const { classId } = req.params;
    if (!validId(classId)) return fail(res, 400, 'Invalid class id.');

    const isAdmin = req.userRole === 'academic_admin' || req.userRole === 'headmaster';
    if (!isAdmin && !(req.userRole === 'teacher' && await teacherOwnsClass(req.userId, classId))) {
      return fail(res, 403, 'You can only add resources to classes you teach.');
    }
    if (!(await Class.exists({ _id: classId }))) return fail(res, 404, 'Class not found.');

    const { title, description, url, name, mime, size, kind, link } = req.body || {};
    if (!url && !link) return fail(res, 400, 'Attach a file or provide a link.');

    const resource = await ClassResource.create({
      classId,
      title: String(title || name || link || 'Resource').trim().slice(0, 160),
      description: String(description || '').trim().slice(0, 500),
      url: url || undefined,
      name: name || undefined,
      mime: mime || undefined,
      size: Number(size) || undefined,
      kind: kind || (link ? 'link' : 'file'),
      link: link || undefined,
      uploadedBy: req.userId
    });

    // Tell the class something new is available, but never let a slow mailbox
    // fail the upload that already succeeded.
    notifyClass({
      classIds: [classId],
      type: 'assignment',
      title: `New class resource: ${resource.title}`,
      body: resource.description || 'A new file or link was shared with your class.',
      link: '/resources',
      actorId: req.userId,
      actorName: req.userName || 'Your teacher'
    }).catch(() => {});

    res.json({ success: true, resource });
  } catch (error) {
    fail(res, 500, error.message);
  }
});

router.delete('/classes/:classId/resources/:id', authMiddleware, async (req, res) => {
  try {
    const { classId, id } = req.params;
    if (!validId(classId) || !validId(id)) return fail(res, 400, 'Invalid id.');

    const resource = await ClassResource.findOne({ _id: id, classId });
    if (!resource) return fail(res, 404, 'Resource not found.');

    const isAdmin = req.userRole === 'academic_admin' || req.userRole === 'headmaster';
    const isUploader = String(resource.uploadedBy) === String(req.userId);
    const ownsClass = req.userRole === 'teacher' && await teacherOwnsClass(req.userId, classId);
    if (!isAdmin && !isUploader && !ownsClass) {
      return fail(res, 403, 'You cannot remove this resource.');
    }

    await resource.deleteOne();
    res.json({ success: true });
  } catch (error) {
    fail(res, 500, error.message);
  }
});

module.exports = router;