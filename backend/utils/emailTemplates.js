// Shared HTML and plain-text email templates.
//
// Every outbound message uses one layout so the school looks consistent in
// Gmail, Outlook and mobile clients. The layout is table-based with inline
// styles because external stylesheets, flexbox and grid are unreliable in
// email. User-supplied values are escaped before they reach the markup.
//
// Each builder returns { subject, html, text }. Resend receives both bodies:
// the text part is not decoration, it improves deliverability and is what
// screen readers and text-only clients actually read.

const DEFAULT_FRONTEND_URL = 'https://essa-nyarugunga-school-complex-syst-eta.vercel.app';

const SCHOOL = Object.freeze({
  name: 'ESSA Nyarugunga',
  tagline: 'School Management System',
  address: 'Indatwa Village, Kamashashi Cell, Nyarugunga Sector, Kicukiro District, Kigali, Rwanda'
});

const COLORS = Object.freeze({
  navy: '#123a5c',
  navyDark: '#0d2c47',
  gold: '#c9a227',
  ink: '#243b53',
  muted: '#627d98',
  border: '#e3eaf2',
  surface: '#f4f7fb',
  white: '#ffffff',
  success: '#1e7d4f',
  successBg: '#e8f6ee',
  warning: '#8a5a00',
  warningBg: '#fff6e0',
  danger: '#a3261b',
  dangerBg: '#fdecea',
  infoBg: '#eaf2fb'
});

const frontendBaseUrl = () => {
  const configured = String(process.env.FRONTEND_URL || '')
    .split(',')[0]
    .trim()
    .replace(/\/+$/, '');
  return configured || DEFAULT_FRONTEND_URL;
};

// Links come from the database (notification rows) as well as from our own
// code, so only http(s) and site-relative paths are allowed. Anything else is
// dropped rather than rendered into an href.
const resolveUrl = (value) => {
  const raw = String(value == null ? '' : value).trim();
  if (!raw) return '';
  if (/^(https?:\/\/|mailto:)/i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${frontendBaseUrl()}${raw}`;
  return '';
};

const escapeHtml = (value) =>
  String(value == null ? '' : value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])
  );

const escapeAttr = (value) => escapeHtml(value).replace(/`/g, '&#96;');

const formatDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Africa/Kigali'
  }).format(date);
};

// Text is escaped first, then newlines become <br> so a multi-line
// notification body keeps its shape instead of collapsing to one paragraph.
const textToHtml = (value) => escapeHtml(value).replace(/\r?\n/g, '<br>');

const paragraph = (value, style = '') =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${COLORS.ink};${style}">${textToHtml(value)}</p>`;

// Signatures are the one place the markup is ours, not user input. Using
// paragraph() here would print the <br> and <strong> tags literally.
const signature = (office = 'ESSA Nyarugunga Administration') =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${COLORS.ink};">Kind regards,<br><strong>${escapeHtml(office)}</strong></p>`;

const button = (url, label) => {
  const href = resolveUrl(url);
  if (!href) return '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto;">
    <tr>
      <td align="center" bgcolor="${COLORS.navy}" style="border-radius:8px;">
        <a href="${escapeAttr(href)}" target="_blank" rel="noopener"
           style="display:inline-block;padding:13px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;line-height:20px;color:${COLORS.white};text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
};

const detailsTable = (rows) => {
  const visible = (rows || []).filter((row) => row && row.value != null && row.value !== '');
  if (!visible.length) return '';
  const body = visible
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:${COLORS.muted};width:42%;vertical-align:top;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:${COLORS.ink};font-weight:600;vertical-align:top;">${textToHtml(row.value)}</td>
      </tr>`
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin:4px 0 18px;border-collapse:collapse;">${body}</table>`;
};

const callout = (value, tone = 'info') => {
  if (!value) return '';
  const palette = {
    info: { bg: COLORS.infoBg, border: COLORS.navy, color: COLORS.ink },
    success: { bg: COLORS.successBg, border: COLORS.success, color: COLORS.success },
    warning: { bg: COLORS.warningBg, border: COLORS.gold, color: COLORS.warning },
    danger: { bg: COLORS.dangerBg, border: COLORS.danger, color: COLORS.danger }
  }[tone] || { bg: COLORS.infoBg, border: COLORS.navy, color: COLORS.ink };
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin:18px 0;background:${palette.bg};border-left:4px solid ${palette.border};border-radius:4px;">
    <tr><td style="padding:12px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${palette.color};">${textToHtml(value)}</td></tr>
  </table>`;
};

const quoteBlock = (value) => {
  if (!value) return '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin:8px 0 18px;background:${COLORS.surface};border-radius:6px;">
    <tr><td style="padding:14px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${COLORS.ink};white-space:pre-wrap;">${escapeHtml(value)}</td></tr>
  </table>`;
};

const list = (items) => {
  const rows = (items || []).filter(Boolean);
  if (!rows.length) return '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;margin:0 0 18px;">${rows
    .map(
      (item) => `<tr>
        <td style="width:18px;padding:4px 0 4px 2px;font-size:15px;line-height:1.6;color:${COLORS.gold};vertical-align:top;">&#8226;</td>
        <td style="padding:4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:${COLORS.ink};vertical-align:top;">${textToHtml(item)}</td>
      </tr>`
    )
    .join('')}</table>`;
};

const layout = ({ preheader = '', heading, subheading = '', content, footerNote = '' }) => {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.surface};">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;background:${COLORS.surface};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background:${COLORS.white};border-radius:12px;overflow:hidden;border:1px solid ${COLORS.border};">
          <tr>
            <td bgcolor="${COLORS.navy}" style="background:${COLORS.navy};padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;">
                <tr><td height="5" bgcolor="${COLORS.gold}" style="height:5px;line-height:5px;font-size:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:26px 32px 24px;">
                    <div style="font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:1.25;font-weight:700;color:${COLORS.white};letter-spacing:.2px;">${escapeHtml(SCHOOL.name)}</div>
                    <div style="margin-top:5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.4;color:#c8d8e8;text-transform:uppercase;letter-spacing:1.4px;">${escapeHtml(SCHOOL.tagline)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 32px 10px;">
              <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;color:${COLORS.navy};font-weight:700;">${escapeHtml(heading)}</h1>
              ${subheading ? `<p style="margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:${COLORS.muted};">${textToHtml(subheading)}</p>` : '<div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>'}
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-top:1px solid ${COLORS.border};">
                <tr>
                  <td style="padding-top:18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:${COLORS.muted};">
                    <div style="font-weight:600;color:${COLORS.ink};">${escapeHtml(SCHOOL.name)}</div>
                    <div>${escapeHtml(SCHOOL.address)}</div>
                    <div><a href="${escapeAttr(frontendBaseUrl())}" target="_blank" rel="noopener" style="color:${COLORS.navy};text-decoration:underline;">${escapeHtml(frontendBaseUrl().replace(/^https?:\/\//, ''))}</a></div>
                    ${footerNote ? `<div style="margin-top:10px;color:${COLORS.muted};">${textToHtml(footerNote)}</div>` : ''}
                    <div style="margin-top:10px;">&copy; ${year} ${escapeHtml(SCHOOL.name)}. Automated message.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const textFooter = (footerNote) =>
  [
    '',
    '--',
    `${SCHOOL.name} - ${SCHOOL.tagline}`,
    SCHOOL.address,
    frontendBaseUrl(),
    footerNote || ''
  ]
    .filter(Boolean)
    .join('\n');

const line = (value) => String(value == null ? '' : value);

const accountInvitation = ({
  fullName,
  email,
  roleLabel,
  setupUrl,
  expiresInHours = 24,
  inviterName = '',
  reminder = false,
  extraRows = []
}) => {
  const name = line(fullName).trim() || 'there';
  const subject = reminder
    ? 'Reminder: activate your ESSA Nyarugunga account'
    : 'Activate your ESSA Nyarugunga account';
  const heading = reminder ? 'Your invitation is still waiting' : 'Welcome to ESSA Nyarugunga';
  // "an Academic Administrator" reads correctly; "a Academic" does not.
  const roleWithArticle = `${/^[aeiou]/i.test(roleLabel) ? 'an' : 'a'} ${roleLabel}`;
  const intro = reminder
    ? `This is a reminder that your ${roleLabel} account has not been activated yet. Use the button below to choose your password.`
    : inviterName
      ? `${inviterName} has created an account for you as ${roleWithArticle} on the ESSA Nyarugunga School Management System.`
      : `An account has been created for you as ${roleWithArticle} on the ESSA Nyarugunga School Management System.`;

  const content = [
    paragraph(`Hello ${name},`),
    paragraph(intro),
    paragraph('To confirm your account and sign in for the first time, set a password only you know.'),
    detailsTable([
      { label: 'Email address', value: email },
      { label: 'Account role', value: roleLabel },
      ...extraRows,
      { label: 'Invitation expires', value: `${expiresInHours} hours after it was sent` }
    ]),
    button(setupUrl, 'Set your password'),
    callout(
      `For your security, this link can only be used once and expires in ${expiresInHours} hours. School staff will never ask you for your password.`,
      'info'
    ),
    paragraph(
      `If the button does not work, copy this address into your browser:\n${line(setupUrl)}`,
      'font-size:12px;color:#627d98;word-break:break-all;'
    ),
    paragraph('If you were not expecting this invitation, please contact the school administration.'),
    signature()
  ].join('');

  const text = [
    `Hello ${name},`,
    intro,
    'To confirm your account and sign in for the first time, set a password only you know.',
    '',
    `Email address: ${line(email)}`,
    `Account role: ${roleLabel}`,
    ...extraRows.map((row) => `${row.label}: ${row.value}`),
    `Invitation expires: ${expiresInHours} hours after it was sent`,
    '',
    `Set your password: ${line(setupUrl)}`,
    '',
    `For your security, this link can only be used once and expires in ${expiresInHours} hours. School staff will never ask you for your password.`,
    'If you were not expecting this invitation, please contact the school administration.',
    '',
    'Kind regards,',
    'ESSA Nyarugunga Administration',
    textFooter()
  ].join('\n');

  return {
    subject,
    html: layout({
      preheader: `Set your password to activate your ${roleLabel} account.`,
      heading,
      subheading: 'Account confirmation and first sign-in',
      content,
      footerNote: 'You received this email because an account was created for you by the school.'
    }),
    text
  };
};

const passwordChanged = ({ fullName, email, at = new Date() }) => {
  const name = line(fullName).trim() || 'there';
  const content = [
    paragraph(`Hello ${name},`),
    paragraph('The password for your ESSA Nyarugunga account was changed successfully.'),
    detailsTable([
      { label: 'Account', value: email },
      { label: 'Changed on', value: formatDate(at) }
    ]),
    button('/portal/login', 'Sign in to the portal'),
    callout(
      'If you did not make this change, contact the school administration immediately and do not use the account until it has been secured.',
      'danger'
    ),
    signature()
  ].join('');

  return {
    subject: 'Your ESSA Nyarugunga password was changed',
    html: layout({
      preheader: 'Your account password was changed.',
      heading: 'Password changed',
      subheading: 'Account security notification',
      content,
      footerNote: 'You received this email because the password on your account was changed.'
    }),
    text: [
      `Hello ${name},`,
      'The password for your ESSA Nyarugunga account was changed successfully.',
      '',
      `Account: ${line(email)}`,
      `Changed on: ${formatDate(at)}`,
      '',
      `Sign in: ${frontendBaseUrl()}/portal/login`,
      '',
      'If you did not make this change, contact the school administration immediately.',
      textFooter()
    ].join('\n')
  };
};

const admissionReceived = ({ fullName, applicationNumber, level, submittedAt = new Date() }) => {
  const name = line(fullName).trim() || 'there';
  const content = [
    paragraph(`Dear ${name},`),
    paragraph('Thank you for applying to ESSA Nyarugunga. We have received your application and it is now waiting for review.'),
    detailsTable([
      { label: 'Application number', value: applicationNumber },
      { label: 'Level applied for', value: level },
      { label: 'Received on', value: formatDate(submittedAt) },
      { label: 'Current status', value: 'Under review' }
    ]),
    paragraph('What happens next'),
    list([
      'The admissions team reviews your application and supporting details.',
      'We contact you using the email address or phone number you provided.',
      'Most decisions are communicated within three to five working days.'
    ]),
    callout('Please keep your application number safe. You will need it whenever you contact the admissions office.', 'info'),
    button('/admissions', 'Visit the admissions page'),
    signature('ESSA Nyarugunga Admissions Office')
  ].join('');

  return {
    subject: `Application received - ${line(applicationNumber)}`,
    html: layout({
      preheader: `Your application ${line(applicationNumber)} has been received.`,
      heading: 'We received your application',
      subheading: 'ESSA Nyarugunga admissions',
      content,
      footerNote: 'You received this email because you submitted an application on our website.'
    }),
    text: [
      `Dear ${name},`,
      'Thank you for applying to ESSA Nyarugunga. We have received your application and it is now waiting for review.',
      '',
      `Application number: ${line(applicationNumber)}`,
      `Level applied for: ${line(level)}`,
      `Received on: ${formatDate(submittedAt)}`,
      'Current status: Under review',
      '',
      'What happens next:',
      '- The admissions team reviews your application and supporting details.',
      '- We contact you using the email address or phone number you provided.',
      '- Most decisions are communicated within three to five working days.',
      '',
      'Please keep your application number safe.',
      textFooter()
    ].join('\n')
  };
};

// Only the two statuses a decision email should ever announce. "submitted",
// "under_review" and "registered" are internal states; sending applicant mail
// for them was the old behaviour and meant approved/rejected applicants never
// heard anything because the copy map used different status names.
const DECISION_COPY = Object.freeze({
  approved: {
    heading: 'Your application has been approved',
    tone: 'success',
    subject: 'Application approved',
    body: 'We are pleased to inform you that your application has been approved. The admissions office will contact you about registration and enrolment.',
    status: 'Approved'
  },
  rejected: {
    heading: 'Update on your application',
    tone: 'warning',
    subject: 'Update on your application',
    body: 'Thank you for the time you invested in your application. After careful review, we are unable to offer you a place at this time. We wish you every success in your next steps.',
    status: 'Not successful'
  }
});

const admissionDecision = ({ fullName, applicationNumber, level, status, decidedAt = new Date() }) => {
  const copy = DECISION_COPY[status];
  if (!copy) return null;
  const name = line(fullName).trim() || 'there';

  const content = [
    paragraph(`Dear ${name},`),
    paragraph(copy.body),
    detailsTable([
      { label: 'Application number', value: applicationNumber },
      { label: 'Level applied for', value: level },
      { label: 'Decision', value: copy.status },
      { label: 'Decision date', value: formatDate(decidedAt) }
    ]),
    status === 'approved'
      ? callout('Keep this email. The admissions office will use the contact details in your application to arrange registration.', 'success')
      : callout('If you would like feedback on your application, contact the admissions office and quote your application number.', 'info'),
    button('/contact', 'Contact the school'),
    signature('ESSA Nyarugunga Admissions Office')
  ].join('');

  return {
    subject: `${copy.subject} - ${line(applicationNumber)}`,
    html: layout({
      preheader: `${copy.heading}. Application ${line(applicationNumber)}.`,
      heading: copy.heading,
      subheading: `Application ${line(applicationNumber)}`,
      content,
      footerNote: 'You received this email because you submitted an application to ESSA Nyarugunga.'
    }),
    text: [
      `Dear ${name},`,
      copy.body,
      '',
      `Application number: ${line(applicationNumber)}`,
      `Level applied for: ${line(level)}`,
      `Decision: ${copy.status}`,
      `Decision date: ${formatDate(decidedAt)}`,
      '',
      `Contact the school: ${frontendBaseUrl()}/contact`,
      textFooter()
    ].join('\n')
  };
};

const notification = ({ fullName, title, body = '', link = '' }) => {
  const name = line(fullName).trim();
  const safeTitle = line(title).trim() || 'New notification';
  const actionUrl = resolveUrl(link);
  const content = [
    paragraph(name ? `Hello ${name},` : 'Hello,'),
    body ? paragraph(body) : '',
    button(actionUrl, 'Open in the portal'),
    paragraph(
      'You are receiving this email because email notifications are enabled for your account. You can change this in your portal notification settings.',
      'font-size:12px;color:#627d98;'
    )
  ].join('');

  return {
    subject: safeTitle,
    html: layout({
      preheader: body ? String(body).slice(0, 120) : safeTitle,
      heading: safeTitle,
      subheading: 'ESSA Nyarugunga notification',
      content,
      footerNote: 'You received this email because of your notification settings in the portal.'
    }),
    text: [
      name ? `Hello ${name},` : 'Hello,',
      '',
      safeTitle,
      body ? `\n${line(body)}` : '',
      actionUrl ? `\nOpen in the portal: ${actionUrl}` : '',
      textFooter('You are receiving this email because email notifications are enabled for your account.')
    ].join('\n')
  };
};

const contactAcknowledgement = ({ fullName, subject, message, sentAt = new Date() }) => {
  const name = line(fullName).trim() || 'there';
  const content = [
    paragraph(`Dear ${name},`),
    paragraph('Thank you for contacting ESSA Nyarugunga. We have received your message and the school office will respond as soon as possible.'),
    detailsTable([
      { label: 'Subject', value: subject || 'General enquiry' },
      { label: 'Sent on', value: formatDate(sentAt) }
    ]),
    paragraph('Your message'),
    quoteBlock(message),
    callout('If you need to add information, reply to this email and your message will reach the school office.', 'info'),
    signature()
  ].join('');

  return {
    subject: 'We received your message - ESSA Nyarugunga',
    html: layout({
      preheader: 'Your message has reached the school office.',
      heading: 'Thank you for contacting us',
      subheading: 'Message confirmation',
      content,
      footerNote: 'You received this email because you used the contact form on our website.'
    }),
    text: [
      `Dear ${name},`,
      'Thank you for contacting ESSA Nyarugunga. We have received your message and the school office will respond as soon as possible.',
      '',
      `Subject: ${line(subject) || 'General enquiry'}`,
      `Sent on: ${formatDate(sentAt)}`,
      '',
      'Your message:',
      line(message),
      '',
      'If you need to add information, reply to this email.',
      textFooter()
    ].join('\n')
  };
};

const contactAlert = ({ fullName, email, phone, subject, message, sentAt = new Date() }) => {
  const sender = line(fullName).trim() || 'Website visitor';
  const replyAddress = line(email).trim();
  const content = [
    paragraph('A new message was submitted through the school website contact form.'),
    detailsTable([
      { label: 'Name', value: sender },
      { label: 'Email', value: replyAddress },
      { label: 'Phone', value: phone || 'Not provided' },
      { label: 'Subject', value: subject || 'General enquiry' },
      { label: 'Received', value: formatDate(sentAt) }
    ]),
    paragraph('Message'),
    quoteBlock(message),
    replyAddress ? button(`mailto:${replyAddress}?subject=${encodeURIComponent(`Re: ${subject || 'Your message to ESSA Nyarugunga'}`)}`, `Reply to ${sender}`) : ''
  ].join('');

  return {
    subject: `New contact message: ${line(subject).trim() || sender}`,
    html: layout({
      preheader: `${sender} sent a message through the website.`,
      heading: 'New contact message',
      subheading: 'School website contact form',
      content,
      footerNote: 'You received this email because you are listed as the contact-form recipient.'
    }),
    text: [
      'A new message was submitted through the school website contact form.',
      '',
      `Name: ${sender}`,
      `Email: ${replyAddress}`,
      `Phone: ${line(phone) || 'Not provided'}`,
      `Subject: ${line(subject) || 'General enquiry'}`,
      `Received: ${formatDate(sentAt)}`,
      '',
      'Message:',
      line(message),
      textFooter()
    ].join('\n')
  };
};

const emailTest = ({ from, to, at = new Date() }) => {
  const content = [
    paragraph('Email delivery is working. This message was sent through Resend using the shared ESSA Nyarugunga template.'),
    detailsTable([
      { label: 'From address', value: from },
      { label: 'Recipient', value: to },
      { label: 'Provider', value: 'Resend' },
      { label: 'Sent on', value: formatDate(at) }
    ]),
    callout('Account invitations, password changes, admission updates, contact messages and portal notifications all use this same template.', 'success')
  ].join('');

  return {
    subject: 'ESSA Nyarugunga email test',
    html: layout({
      preheader: 'Resend delivery test from ESSA Nyarugunga.',
      heading: 'Email delivery is working',
      subheading: 'Resend configuration test',
      content,
      footerNote: 'This is a test message requested from the server.'
    }),
    text: [
      'Email delivery is working.',
      '',
      `From address: ${line(from)}`,
      `Recipient: ${line(to)}`,
      'Provider: Resend',
      `Sent on: ${formatDate(at)}`,
      textFooter()
    ].join('\n')
  };
};

module.exports = {
  SCHOOL,
  frontendBaseUrl,
  escapeHtml,
  formatDate,
  accountInvitation,
  passwordChanged,
  admissionReceived,
  admissionDecision,
  notification,
  contactAcknowledgement,
  contactAlert,
  emailTest
};
