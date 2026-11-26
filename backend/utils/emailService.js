const jwt = require('jsonwebtoken');

const { sendMail, isEmailConfigured, getFromAddress } = require('../config/email');
const { getJWTSecret } = require('./jwt');
const { ROLE_LABELS } = require('../config/roles');
const templates = require('./emailTemplates');

const { frontendBaseUrl } = templates;

// Invitation links expire quickly because they are a password-reset primitive:
// anyone who reads the mailbox can use them once.
const SETUP_TOKEN_HOURS = 24;

const replyToAddress = () =>
  (process.env.EMAIL_REPLY_TO || process.env.ADMIN_EMAIL || '').trim() || undefined;

const roleLabel = (role) => ROLE_LABELS[role] || 'School';

const buildSetupLink = (userId) => {
  const token = jwt.sign({ id: userId, purpose: 'setup' }, getJWTSecret(), {
    expiresIn: `${SETUP_TOKEN_HOURS}h`
  });
  return `${frontendBaseUrl()}/set-password?token=${token}`;
};

// One guarded entry point. Every send returns true only when Resend accepted
// the message, so callers can tell the UI the truth instead of assuming.
const sendTemplated = async ({ to, template, replyTo }) => {
  if (!isEmailConfigured() || !to || !template) return false;
  await sendMail({
    from: getFromAddress(),
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
    replyTo
  });
  return true;
};

// Sent when the Headmaster creates a sub-admin, the Academic Administrator
// creates a teacher, a student account is created, or an invitation is resent.
// The generated password is deliberately never included: the only credential in
// the message is a single-use link that expires.
const sendAccountInvitationEmail = async ({
  user,
  inviterName = '',
  reminder = false,
  extraRows = []
}) => {
  // Check delivery first: without Resend credentials there is no reason to mint
  // a setup token, and doing so would throw in environments without JWT_SECRET.
  if (!isEmailConfigured() || !user || !user.email) return false;
  const setupUrl = user._id ? buildSetupLink(user._id) : '';
  if (!setupUrl) return false;

  return sendTemplated({
    to: user.email,
    template: templates.accountInvitation({
      fullName: user.fullName,
      email: user.email,
      roleLabel: roleLabel(user.role),
      setupUrl,
      expiresInHours: SETUP_TOKEN_HOURS,
      inviterName,
      reminder,
      extraRows
    }),
    replyTo: replyToAddress()
  });
};

// Backwards-compatible name used by the existing route modules.
const sendWelcomeEmail = (user, options = {}) => sendAccountInvitationEmail({ user, ...options });

const sendPasswordChangedEmail = async (user, at = new Date()) => {
  if (!user || !user.email) return false;
  return sendTemplated({
    to: user.email,
    template: templates.passwordChanged({ fullName: user.fullName, email: user.email, at }),
    replyTo: replyToAddress()
  });
};

const sendAdmissionConfirmationEmail = async (application) => {
  if (!application || !application.email) return false;
  return sendTemplated({
    to: application.email,
    template: templates.admissionReceived({
      fullName: application.fullName,
      applicationNumber: application.applicationNumber,
      level: application.level,
      submittedAt: application.createdAt || new Date()
    }),
    replyTo: replyToAddress()
  });
};

// Sent when an admin records a final decision. The internal review note is
// deliberately not included: putting panel deliberations in applicant mail
// leaks staff-only context. Returns false for internal statuses.
const sendAdmissionDecisionEmail = async (application) => {
  if (!application || !application.email) return false;
  const template = templates.admissionDecision({
    fullName: application.fullName,
    applicationNumber: application.applicationNumber,
    level: application.level,
    status: application.status,
    decidedAt: application.reviewedAt || application.updatedAt || new Date()
  });
  if (!template) return false;

  return sendTemplated({
    to: application.email,
    template,
    replyTo: replyToAddress()
  });
};

// Plain transactional mail for the notification centre. Guarded the same way as
// the rest of this module: with no Resend credentials configured the app must
// keep working and simply not send.
const sendNotificationEmail = async (user, { title, body, link }) => {
  if (!user || !user.email) return false;
  return sendTemplated({
    to: user.email,
    template: templates.notification({ fullName: user.fullName, title, body, link }),
    replyTo: replyToAddress()
  });
};

const sendContactAcknowledgementEmail = async (contact) => {
  if (!contact || !contact.email) return false;
  return sendTemplated({
    to: contact.email,
    template: templates.contactAcknowledgement({
      fullName: contact.fullName,
      subject: contact.subject,
      message: contact.message,
      sentAt: contact.createdAt || new Date()
    }),
    replyTo: replyToAddress()
  });
};

const sendContactAlertEmail = async (contact) => {
  const recipient = (process.env.ADMIN_EMAIL || '').trim() || 'admin@essa.rw';
  if (!contact || !recipient) return false;
  return sendTemplated({
    to: recipient,
    template: templates.contactAlert({
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      sentAt: contact.createdAt || new Date()
    }),
    // Replying to the alert answers the visitor, not the school's own inbox.
    replyTo: contact.email || replyToAddress()
  });
};

const sendTestEmail = async (to) => {
  const recipient = to || process.env.TEST_EMAIL || process.env.ADMIN_EMAIL || getFromAddress();
  return sendTemplated({
    to: recipient,
    template: templates.emailTest({ from: getFromAddress(), to: recipient })
  });
};

module.exports = {
  buildSetupLink,
  sendTemplated,
  sendAccountInvitationEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendAdmissionConfirmationEmail,
  sendAdmissionDecisionEmail,
  sendNotificationEmail,
  sendContactAcknowledgementEmail,
  sendContactAlertEmail,
  sendTestEmail,
  SETUP_TOKEN_HOURS
};
