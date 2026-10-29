const Student = require('../models/Student');
const ParentProfile = require('../models/ParentProfile');
const { notifyMany } = require('./notifier');

// Resolves the people a class-wide notice is meant for: the pupils enrolled in
// those classes and the guardian accounts attached to them. Kept separate from
// the announcement audience logic because a teacher-triggered reminder is not
// an Announcement document and should not create one; it is a notification
// fan-out with no stored body to read later.
const classAudience = async (classIds) => {
  const ids = (Array.isArray(classIds) ? classIds : [classIds]).filter(Boolean);
  if (!ids.length) return { userIds: [], studentCount: 0, parentCount: 0 };

  const students = await Student.find({ classId: { $in: ids } }).select('userId').lean();
  const studentUserIds = students.map((s) => s.userId).filter(Boolean).map(String);
  const studentIds = students.map((s) => s._id);

  const parentUserIds = studentIds.length
    ? await ParentProfile.find({ children: { $in: studentIds } }).distinct('userId')
    : [];

  const userIds = [...new Set([...studentUserIds, ...parentUserIds.map(String)])];
  return {
    userIds,
    studentCount: studentUserIds.length,
    parentCount: new Set(parentUserIds.map(String)).size
  };
};

// Fans a notification out to a class audience. Returns the resolved audience so
// the caller can tell the teacher how many people were reached.
const notifyClass = async ({ classIds, ...payload }) => {
  const audience = await classAudience(classIds);
  if (!audience.userIds.length) return { ...audience, attempted: 0, delivered: 0 };
  const result = await notifyMany(audience.userIds, payload);
  return { ...audience, attempted: result.attempted, delivered: result.delivered };
};

module.exports = { classAudience, notifyClass };