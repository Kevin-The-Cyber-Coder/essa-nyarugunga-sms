const Assignment = require('../models/Assignment');
const Exam = require('../models/Exam');
const User = require('../models/User');
const { notifyClass } = require('./classNotify');

// How close a deadline has to be before a reminder goes out. One day is long
// enough to be useful and short enough not to nag; the scheduler runs often so
// a notice is not missed when the process was down at the exact boundary.
const LEAD_MS = 24 * 60 * 60 * 1000;

const dayLabel = (date) => date.toLocaleString('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
});

const remindDueAssignments = async () => {
  const now = new Date();
  const until = new Date(now.getTime() + LEAD_MS);
  const due = await Assignment.find({
    dueDate: { $gt: now, $lte: until },
    reminderSentAt: null
  }).select('title dueDate classId teacherId').lean();

  let sent = 0;
  for (const assignment of due) {
    if (!assignment.classId) continue;
    const teacher = assignment.teacherId
      ? await User.findById(assignment.teacherId).select('fullName').lean()
      : null;
    await notifyClass({
      classIds: [assignment.classId],
      type: 'assignment',
      title: `Assignment due: ${assignment.title}`,
      body: `Due ${dayLabel(new Date(assignment.dueDate))}.`,
      link: '/assignments',
      actorId: assignment.teacherId,
      actorName: teacher?.fullName || 'Your teacher'
    });
    await Assignment.updateOne({ _id: assignment._id }, { $set: { reminderSentAt: now } });
    sent += 1;
  }
  return sent;
};

const remindUpcomingExams = async () => {
  const now = new Date();
  const until = new Date(now.getTime() + LEAD_MS);
  const soon = await Exam.find({
    examDate: { $gt: now, $lte: until },
    reminderSentAt: null
  }).select('name examDate classIds type').lean();

  let sent = 0;
  for (const exam of soon) {
    const classIds = exam.classIds || [];
    if (!classIds.length) continue;
    await notifyClass({
      classIds,
      type: 'exam',
      title: `Exam reminder: ${exam.name}`,
      body: `${exam.type || 'Exam'} on ${dayLabel(new Date(exam.examDate))}.`,
      link: '/exams',
      actorName: 'Examinations'
    });
    await Exam.updateOne({ _id: exam._id }, { $set: { reminderSentAt: now } });
    sent += 1;
  }
  return sent;
};

const runReminderSweep = async () => {
  const [assignments, exams] = await Promise.all([
    remindDueAssignments().catch(() => 0),
    remindUpcomingExams().catch(() => 0)
  ]);
  return { assignments, exams };
};

let timer = null;
const startReminderScheduler = (intervalMs = 15 * 60 * 1000) => {
  if (timer) return timer;
  timer = setInterval(() => { remindDueAssignments().catch(() => {}); remindUpcomingExams().catch(() => {}); }, intervalMs);
  if (typeof timer.unref === 'function') timer.unref();
  return timer;
};

module.exports = { remindDueAssignments, remindUpcomingExams, startReminderScheduler };