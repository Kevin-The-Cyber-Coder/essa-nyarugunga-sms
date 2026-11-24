require('dotenv').config();
const { sendMail, isEmailConfigured, getFromAddress } = require('./config/email');

const testEmail = async () => {
  console.log('📧 Testing Resend email configuration...');

  if (!isEmailConfigured()) {
    console.error('❌ Set RESEND_API_KEY and EMAIL_FROM in backend/.env first.');
    process.exit(1);
  }

  const to = process.env.TEST_EMAIL || process.env.ADMIN_EMAIL || getFromAddress();

  try {
    const result = await sendMail({
      to,
      subject: '✅ Email Test - ESSA Nyarugunga System',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#1a3a5c;color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0;">
            <h2>📧 Email Configuration Successful</h2>
          </div>
          <div style="background:#f5f5f5;padding:24px;border-radius:0 0 10px 10px;">
            <p>The ESSA Nyarugunga School Management System can now send email through Resend.</p>
            <p><strong>From:</strong> ${getFromAddress()}</p>
            <p><strong>Test time:</strong> ${new Date().toLocaleString()}</p>
            <p>This covers welcome emails, admission messages, contact notifications and in-app notification emails.</p>
          </div>
        </div>`
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📨 Message ID: ${result.id}`);
    console.log(`📬 Check your inbox at: ${to}`);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
};

testEmail();
