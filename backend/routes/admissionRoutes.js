const express = require('express');
const { body, validationResult } = require('express-validator');

const AdmissionApplication = require('../models/AdmissionApplication');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendAdmissionConfirmationEmail } = require('../utils/emailService');
const { publicFormLimiter } = require('../config/rateLimit');
const { notify } = require('../utils/notifier');
const { ROLES } = require('../config/roles');

const router = express.Router();

// An email or phone belonging to an existing application/student, or a
// verified national ID, is enough to reject a second application.
const findDuplicate = async ({ email, phone, nationalId }) => {
  const or = [];
  if (email) or.push({ email: email.toLowerCase() });
  if (phone) or.push({ phone });
  if (nationalId) or.push({ nationalId });
  if (!or.length) return null;

  const filter = { $or: or };
  const existing = await AdmissionApplication.findOne(filter).select('applicationNumber email phone nationalId').lean();
  if (existing) return { source: 'application', value: existing.applicationNumber };

  if (email || phone) {
    const studentOr = [];
    if (email) studentOr.push({ email: email.toLowerCase() });
    if (phone) studentOr.push({ phone });
    const student = await Student.findOne({ $or: studentOr }).select('_id').lean();
    if (student) return { source: 'student', value: 'enrolled student record' };
  }
  return null;
};

const alertHeadmasters = async (application) => {
  const headmasters = await User.find({ role: ROLES.HEADMASTER, isActive: true }).select('_id fullName email').lean();
  await Promise.all(headmasters.map(async (head) => {
    // notify() already delivers the in-app record and, when the recipient's
    // settings allow it, the email. Calling the email service again here sent
    // every Headmaster two copies of the same alert.
    await notify({
      userId: head._id,
      type: 'admission',
      title: 'New admission application',
      body: `${application.fullName} (${application.applicationNumber})`,
      link: '/portal/headmaster'
    });
  }));
};

router.post('/admissions/submit', publicFormLimiter,
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('level').notEmpty().withMessage('Level is required'),
  body('previousSchool').notEmpty().withMessage('Previous school is required'),
  body('lastAverage').isNumeric().withMessage('Last average must be a number'),
  body('parentName').notEmpty().withMessage('Parent name is required'),
  body('parentPhone').notEmpty().withMessage('Parent phone is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
    try {
      const data = req.body;
      const duplicate = await findDuplicate({
        email: data.email, phone: data.phone, nationalId: data.nationalId
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `An application or student record already exists for this ${duplicate.source === 'application' ? 'application' : 'student'} (${duplicate.value}).`
        });
      }

      const application = await AdmissionApplication.create({
        fullName: data.fullName, dateOfBirth: new Date(data.dateOfBirth),
        nationality: data.nationality || 'Rwandan', nationalId: data.nationalId || '',
        email: data.email.toLowerCase(), phone: data.phone, address: data.address,
        level: data.level, previousSchool: data.previousSchool,
        lastAverage: parseFloat(data.lastAverage), achievements: data.achievements || '',
        parentName: data.parentName, parentPhone: data.parentPhone,
        parentEmail: data.parentEmail || '', parentOccupation: data.parentOccupation || '',
        applyScholarship: data.applyScholarship || false,
        activity: [{ action: 'submitted', detail: 'Application received', at: new Date() }]
      });

      sendAdmissionConfirmationEmail(application).catch(console.error);
      alertHeadmasters(application).catch((error) => console.error('Headmaster alert failed:', error.message));
      res.json({ success: true, message: 'Application submitted!', applicationNumber: application.applicationNumber });
    } catch (error) {
      // 11000 is the duplicate key on applicationNumber. Two people applying at
      // once can read the same "next" number, so try once more rather than showing
      // the applicant a server error for something that is not their fault.
      if (error.code === 11000) {
        try {
          const application = await AdmissionApplication.create({
            ...req.body,
            email: req.body.email.toLowerCase(),
            dateOfBirth: new Date(req.body.dateOfBirth),
            lastAverage: parseFloat(req.body.lastAverage),
            activity: [{ action: 'submitted', detail: 'Application received', at: new Date() }]
          });
          sendAdmissionConfirmationEmail(application).catch(console.error);
          alertHeadmasters(application).catch((e) => console.error('Headmaster alert failed:', e.message));
          return res.json({ success: true, message: 'Application submitted!', applicationNumber: application.applicationNumber });
        } catch (retryError) {
          return res.status(500).json({ success: false, message: retryError.message });
        }
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Admin-side listing, decisions, scoring and printing live in
// admissionsAdminRoutes.js, which is mounted ahead of this file.
module.exports = router;
