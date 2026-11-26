// Resend HTTP API client. The rest of the backend keeps calling sendMail(...),
// so swapping providers does not require changing each email template.
const RESEND_API_URL = 'https://api.resend.com/emails';
// A provider that never answers must not hold a request open. Ten seconds is
// far longer than a normal send and short enough to keep forms responsive.
const RESEND_TIMEOUT_MS = 10_000;

const getApiKey = () => (process.env.RESEND_API_KEY || '').trim();
const getFromAddress = () => (process.env.EMAIL_FROM || '').trim();

const isEmailConfigured = () => Boolean(getApiKey() && getFromAddress());

const sendMail = async ({ from, to, subject, html, text, replyTo }) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    body: JSON.stringify({
      from: from || getFromAddress(),
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Keep the provider's own message: it usually names the exact problem
    // (unverified sender domain, invalid recipient, invalid API key, quota).
    const error = new Error(payload.message || `Resend API error: ${response.status}`);
    error.status = response.status;
    error.code = payload.name;
    throw error;
  }
  return payload;
};

if (isEmailConfigured()) {
  console.log(`✅ Email configured with Resend for: ${getFromAddress()}`);
} else {
  console.log('ℹ️ Email delivery disabled: set RESEND_API_KEY and EMAIL_FROM to enable it.');
}

module.exports = { sendMail, isEmailConfigured, getFromAddress };
