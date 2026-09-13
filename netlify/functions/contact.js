const nodemailer = require('nodemailer');
const { emailWrap, dataTable } = require('./_emailTemplate');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Bezpečné vložení uživatelského textu do HTML e-mailu
function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

exports.handler = async (event) => {

  // Povolen pouze POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const params = new URLSearchParams(event.body);
  const data = Object.fromEntries(params.entries());

  const {
    name,
    email,
    subject,
    message,
    website,
    formTime
  } = data;


  // --------------------------------------------------
  // 1. HONEYPOT
  // --------------------------------------------------
  if (website) {
    console.log('Spam detected: honeypot');
    return redirect('/dekujeme/?form=contact');
  }

  // --------------------------------------------------
  // 2. ZÁKLADNÍ VALIDACE
  // --------------------------------------------------

  if (!name || !email || !message) {
    return redirect('/kontakt?error=validation');
  }

  // --------------------------------------------------
  // 3. KONTROLA E-MAILU
  // --------------------------------------------------

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return redirect('/kontakt?error=validation');
  }

  // --------------------------------------------------
  // 4. KONTROLA ČASU
  // --------------------------------------------------
  const loadedAt = Number(formTime);
  const submittedAt = Date.now();

  if (
    !loadedAt ||
    submittedAt - loadedAt < 3000
  ) {
    console.log('Spam detected: form submitted too quickly');
    return redirect('/dekujeme/?form=contact');
  }

  // --------------------------------------------------
  // 5. OMEZENÍ DÉLKY VSTUPŮ
  // --------------------------------------------------

  if (
    name.length > 100 ||
    email.length > 150 ||
    subject.length > 200 ||
    message.length > 5000
  ) {
    console.log('Spam detected: field too long');
    return redirect('/dekujeme/?form=contact');
  }

  // --------------------------------------------------
  // 6. BEZPEČNÉ HODNOTY PRO HTML E-MAIL
  // --------------------------------------------------

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject || '–');
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');


  // --------------------------------------------------
  // 7. ODESLÁNÍ E-MAILŮ
  // --------------------------------------------------

  try {

    // E-mail administrátorovi
    await transporter.sendMail({
      from: '"Pekseso" <ahoj@pekseso.cz>',
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `Kontaktní formulář: ${safeSubject || safeName}`,

      html: emailWrap(
        'Nová zpráva z kontaktního formuláře',

        dataTable([
          ['Jméno', safeName],
          ['E-mail', safeEmail],
          ['Předmět', safeSubject],
          ['Zpráva', safeMessage],
        ])
      ),
    });


    // Potvrzení zákazníkovi
    await transporter.sendMail({
      from: '"Pekseso" <ahoj@pekseso.cz>',
      to: email,
      subject: 'Zpráva dorazila, ozvu se ti',

      html: emailWrap(
        'Ahoj!',
        `
          <p style="font-family:Arial,sans-serif;">
            Děkuji za zprávu — dorazila ke mně v pořádku.
            Brzy se na ni podívám a odpovím ti co nejdříve.
          </p>

          <p style="font-family:Arial,sans-serif;color:#777;font-size:14px;">
            <em>Tvoje zpráva:</em><br>
            ${safeMessage}
          </p>

          <br>

          <p style="font-family:Arial,sans-serif;">
            <strong>Martina, Pekseso</strong>
          </p>
        `
      ),
    });


    // Úspěch
    return redirect('/dekujeme/?form=contact');


  } catch (err) {

    console.error('Mail error:', err);

    return redirect('/kontakt?error=server');
  }
};

// --------------------------------------------------
// REDIRECT
// --------------------------------------------------

function redirect(url) {
  return {
    statusCode: 303,
    headers: {
      Location: url
    },
    body: ''
  };
}