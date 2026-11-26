require('dotenv').config();
const { isEmailConfigured, getFromAddress } = require('./config/email');
const { sendTestEmail } = require('./utils/emailService');

const testEmail = async () => {
  console.log('Testing Resend email configuration...');

  if (!isEmailConfigured()) {
    console.error('Set RESEND_API_KEY and EMAIL_FROM in backend/.env first.');
    process.exit(1);
  }

  const to = process.env.TEST_EMAIL || process.env.ADMIN_EMAIL || getFromAddress();

  try {
    const sent = await sendTestEmail(to);
    if (!sent) {
      console.error('Resend did not accept the message. Check the API key and sender address.');
      process.exit(1);
    }
    console.log('Test email sent successfully.');
    console.log(`From: ${getFromAddress()}`);
    console.log(`To:   ${to}`);
    console.log('The message uses the same template as invitations, admissions and notifications.');
  } catch (error) {
    console.error('Email test failed:', error.message);
    process.exit(1);
  }
};

testEmail();
