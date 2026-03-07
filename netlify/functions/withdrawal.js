// netlify/functions/withdrawal.js
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

const reasonLabels = {
  odstoupeni: 'Vrácení zboží (do 14 dnů)',
  reklamace: 'Reklamace (vada na zboží)',
  jine: 'Jiný dotaz k objednávce',
};

exports.handler = async (event) => {

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const params = new URLSearchParams(event.body);
  const data = Object.fromEntries(params.entries());
  const { number, name, email, phone, account, reason, subject, message, website } = data;

  if (website) {
    return redirect(`/dekujeme/?form=withdrawal&order=${encodeURIComponent(number)}`);
  }

  if (!number || !name || !email || !message) {
    return redirect('/odstoupeni?error=validation');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return redirect('/odstoupeni?error=validation');
  }

  const reasonLabel = reasonLabels[reason] || reason;
  const today = new Date().toLocaleDateString('cs-CZ');

  try {
    // Email adminovi
    await transporter.sendMail({
      from: `"Pekseso web" <${process.env.MAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `${reasonLabel} – objednávka č. ${number}`,
      html: emailWrap(reasonLabel,
        dataTable([
          ['Datum', today],
          ['Číslo objednávky', number],
          ['Jméno', name],
          ['E-mail', email],
          ['Telefon', phone || '–'],
          ['Číslo účtu', account || '–'],
          ['Důvod', reasonLabel],
          ['Předmět', subject || '–'],
          ['Zpráva', message.replace(/\n/g, '<br>')],
        ])
      ),
    });

    // Potvrzení zákazníkovi
    await transporter.sendMail({
      from: `"Pekseso" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `Potvrzení přijetí – objednávka č. ${number}`,
      html: emailWrap('Váš požadavek jsme přijali', `
        <p style="font-family:Arial,sans-serif;">Dobrý den <strong>${name}</strong>,</p>
        <p style="font-family:Arial,sans-serif;">obdrželi jsme vaše vyplněné údaje k objednávce č. <strong>${number}</strong>.</p>
        <p style="font-family:Arial,sans-serif;">Standardně odpovídáme do 1–2 pracovních dnů. Sledujte prosím svou e-mailovou schránku.</p>
        ${reason === 'odstoupeni' ? `<p style="font-family:Arial,sans-serif;">Peníze vrátíme na účet <strong>${account}</strong> do 14 dnů od obdržení vráceného zboží.</p>` : ''}
        <p style="font-family:Arial,sans-serif;">S pozdravem,<br>Martina – Pekseso</p>
      `),
    });

    return redirect(`/dekujeme/?form=withdrawal&order=${encodeURIComponent(number)}`);

  } catch (err) {
    console.error('Mail error:', err);
    return redirect('/odstoupeni?error=server');
  }
};

function redirect(url) {
  return { statusCode: 303, headers: { Location: url }, body: '' };
}
