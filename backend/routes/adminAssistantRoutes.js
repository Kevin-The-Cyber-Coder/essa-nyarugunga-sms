const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/User');
const Student = require('../models/Student');
const ParentProfile = require('../models/ParentProfile');
const AdmissionApplication = require('../models/AdmissionApplication');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const { ROLES } = require('../config/roles');

const router = express.Router();
const ACCESS = [authMiddleware, requireRole(ROLES.ADMIN_ASSISTANT, ROLES.HEADMASTER)];

const normalizePhone = (value) => String(value || '').replace(/[\s-]/g, '').trim();

const populate = (query) => query.populate({
  path: 'children',
  populate: { path: 'classId', select: 'grade className' }
});

router.get('/admin-assistant/overview', ...ACCESS, async (req, res) => {
  try {
    const [students, parents, counts] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      ParentProfile.countDocuments({ isLinked: true }),
      AdmissionApplication.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);
    const applications = {};
    for (const row of counts) applications[row._id] = row.count;
    res.json({ success: true, students, parents, applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin-assistant/parents', ...ACCESS, async (req, res) => {
  try {
    const parents = await populate(ParentProfile.find().sort({ createdAt: -1 }));
    res.json({ success: true, data: parents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Staff created and verified parent-child relationships. Parents cannot
// change these links themselves; a child is only visible after this step.
router.post('/admin-assistant/link-parent', ...ACCESS, async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const studentIds = Array.isArray(req.body.studentIds) ? req.body.studentIds : [];
    if (!/^\+?\d{7,15}$/.test(phone)) return res.status(400).json({ message: 'A valid phone number is required' });
    if (!studentIds.length) return res.status(400).json({ message: 'Select at least one child' });

    const children = await Student.find({ _id: { $in: studentIds } }).select('_id fullName');
    if (children.length !== studentIds.length) return res.status(400).json({ message: 'One or more students were not found' });

    let profile = await ParentProfile.findOne({ parentPhone: phone });
    if (!profile) profile = new ParentProfile({ parentPhone: phone });

    profile.parentName = req.body.parentName || profile.parentName || 'Parent';
    profile.parentEmail = req.body.email || profile.parentEmail || '';
    profile.children = children.map((c) => c._id);
    profile.isLinked = true;
    profile.linkedAt = new Date();

    if (!profile.userId) {
      let user = await User.findOne({ phone });
      if (!user) {
        const email = profile.parentEmail || `parent-${phone.replace(/\D/g, '').slice(-8)}@essa.rw`;
        user = await User.create({
          fullName: profile.parentName,
          email,
          phone,
          password: await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10),
          role: ROLES.PARENT
        });
      }
      profile.userId = user._id;
    }
    await profile.save();
    await populate(ParentProfile.findById(profile._id));
    const saved = await ParentProfile.findById(profile._id).populate('children', 'fullName studentId');
    res.json({ success: true, parent: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/admin-assistant/unlink-parent/:id', ...ACCESS, async (req, res) => {
  try {
    const profile = await ParentProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Parent profile not found' });
    profile.children = profile.children.filter((id) => String(id) !== String(req.body.studentId));
    profile.isLinked = profile.children.length > 0;
    await profile.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
