// netlify/functions/contact.js
const nodemailer = require('nodemailer');
const { emailWrap, dataTable } = require('./_emailTemplate');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.handler = async (event) => {

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const params = new URLSearchParams(event.body);
  const data = Object.fromEntries(params.entries());
  const { name, email, subject, message, website } = data;

  if (website) {
    return redirect('/dekujeme/?form=contact');
  }

  if (!name || !email || !message) {
    return redirect('/kontakt?error=validation');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return redirect('/kontakt?error=validation');
  }

  try {
    // Email adminovi
    await transporter.sendMail({
      from: `"Pekseso web" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `Kontaktní formulář: ${subject || name}`,
      html: emailWrap('Nová zpráva z kontaktního formuláře',
        dataTable([
          ['Jméno', name],
          ['E-mail', email],
          ['Předmět', subject || '–'],
          ['Zpráva', message.replace(/\n/g, '<br>')],
        ])
      ),
    });

    // Potvrzení zákazníkovi
    await transporter.sendMail({
      from: `"Pekseso" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Potvrzení přijetí zprávy – Pekseso',
      html: emailWrap('Děkujeme za vaši zprávu!', `
        <p style="font-family:Arial,sans-serif;">Dobrý den <strong>${name}</strong>,</p>
        <p style="font-family:Arial,sans-serif;">vaši zprávu jsme obdrželi a odpovíme vám co nejdříve.</p>
        <p style="font-family:Arial,sans-serif;color:#777;font-size:14px;"><em>Vaše zpráva:</em><br>${message.replace(/\n/g, '<br>')}</p>
      `),
    });

    return redirect('/dekujeme/?form=contact');

  } catch (err) {
    console.error('Mail error:', err);
    return redirect('/kontakt?error=server');
  }
};

function redirect(url) {
  return { statusCode: 303, headers: { Location: url }, body: '' };
}
