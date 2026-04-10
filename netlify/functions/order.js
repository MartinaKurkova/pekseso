const nodemailer = require('nodemailer');
const { emailWrap, dataTable, itemsTable } = require('./_emailTemplate');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// doprava
const dopravaPreklad = {
  "shr_1T6BpcJdC0N7uBdkHIPwzJUj": "Zásilkovna – Výdejní místo",
  "shr_1TGh3LJdC0N7uBdkLyfGt4eu": "Balíkovna – Výdejní místo / BOX",
  "shr_1T6BqAJdC0N7uBdkVBnfRr7E": "Zásilkovna – K vám domů",
  "shr_1T6CKnJdC0N7uBdkFiXUdiFe": "Osobní odběr v Sadské",
};

const platbaPreklad = {
  "transfer": "Bankovní převod",
  "cash": "Hotově při převzetí",
};

exports.handler = async (event) => {

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Honeypot
  if (body.website) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  const {
    email, phone,
    billing_first_name, billing_last_name, billing_street, billing_city, billing_zip,
    first_name, last_name, street, city, zip,
    shipping_different,
    shipping_rate, payment_method,
    zasilkovna_name,
    pobocka_metadata,
    note,
    cart, vs, totalPrice,
  } = body;

  if (!email || !billing_first_name || !billing_last_name || !billing_street || !billing_city || !billing_zip) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Chybí povinné údaje.' }) };
  }

  const billingAddress = `${billing_first_name} ${billing_last_name}, ${billing_street}, ${billing_zip} ${billing_city}`;
  const shippingAddress = shipping_different
    ? `${first_name} ${last_name}, ${street}, ${zip} ${city}`
    : billingAddress;

  // Prioritu má název dopravy poslaný z frontendu, pokud není, použije se překlad podle ID
  const shippingLabel = body.shipping_rate_name || dopravaPreklad[shipping_rate] || shipping_rate;
  const paymentLabel  = platbaPreklad[payment_method] || payment_method;
  const isTransfer    = payment_method === 'transfer';

  // VÝPIS POBOČKY:
  const infoOPobocce = pobocka_metadata || zasilkovna_name || null;

  const adminRows = [
    ['Variabilní symbol', `<strong>${vs}</strong>`],
    ['E-mail', email],
    ['Telefon', phone || '–'],
    ['Fakturační adresa', billingAddress],
    ['Dodací adresa', shippingAddress],
    ['Doprava', shippingLabel],
    // Zobrazí řádek s pobočkou pouze pokud nějaká existuje (Zásilkovna nebo Balíkovna)
    ...(infoOPobocce ? [['Místo vyzvednutí', infoOPobocce]] : []),
    ['Platba', paymentLabel],
    ['Poznámka', note || '–'],
  ];

  try {
    // Email adminovi (vám)
    await transporter.sendMail({
      from: '"Pekseso" <ahoj@pekseso.cz>',
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `Nová objednávka – VS ${vs}`,
      html: emailWrap(`Nová objednávka – VS ${vs}`,
        dataTable(adminRows) + itemsTable(cart, totalPrice)
      ),
    });

    // Potvrzení zákazníkovi
    await transporter.sendMail({
      from: '"Pekseso" <ahoj@pekseso.cz>',
      to: email,
      subject: `Máme pár! Objednávka dorazila – č. o.: ${vs}`,
      html: emailWrap('Tvoje objednávka dorazila', `
        <p style="font-family:Arial,sans-serif;">Ahoj,</p>
        <p style="font-family:Arial,sans-serif; margin-bottom: 16px;">děkuji za tvoji objednávku – právě ke mně dorazila. Teď ji kontroluji a brzy ti pošlu potvrzení.</p>
        
        ${isTransfer ? `
        <div style="background:#fff9e6;border-left:4px solid #FFD23F;padding:16px 20px;margin:20px 0;font-family:Arial,sans-serif;">
          <strong>Podklady pro platbu</strong><br><br>
          Částka k úhradě: <strong>${totalPrice} Kč</strong><br>
          Číslo účtu: <strong>1300712012/3030</strong><br>
          Variabilní symbol: <strong>${vs}</strong><br><br>
          Objednávku odešlu ihned po připsání platby na účet.
        </div>
        ` : `
        <p style="font-family:Arial,sans-serif;">Zvolil jsi platbu hotově při převzetí v Sadské. Počkej prosím na SMS nebo e-mail, ve kterém se domluvíme na čase předání.</p>
        `}

        ${itemsTable(cart, totalPrice)}

        <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
            <p style="font-family:Arial,sans-serif;font-size:14px;color:#555;margin:0;"><strong>Doprava:</strong> ${shippingLabel}</p>
            ${infoOPobocce ? `<p style="font-family:Arial,sans-serif;font-size:14px;color:#555;margin:0;"><strong>Místo:</strong> ${infoOPobocce}</p>` : ''}
        </div>
        
        <p style="font-family:Arial,sans-serif; margin-top: 20px;">S pozdravem,<br>Martina – Pekseso</p>
      `),
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error('Mail error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Chybí povinné údaje.' }) };
  }
};