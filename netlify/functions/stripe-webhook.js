const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const { emailWrap, dataTable, itemsTable } = require('./_emailTemplate');

// Nastavení e-mailového dopravy (stejné jako v order.js)
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
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    
    // 1. Vytáhneme metadata, která jsme si poslali z pokladny
    const { vs, pobocka, doprava, email, billing_name, phone } = session.metadata;
    
    // 2. Získáme položky z nákupu (Stripe nám je musí poslat v session)
    // Abychom věděli, co přesně zákazník koupil, musíme se dotázat na line_items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const cart = lineItems.data.map(item => ({
        name: item.description,
        quantity: item.quantity,
        price: (item.amount_total / 100) / item.quantity // Převod z haléřů na Kč
    }));

    const totalPrice = session.amount_total / 100;

    const adminRows = [
      ['Variabilní symbol', `<strong>${vs}</strong>`],
      ['E-mail', email],
      ['Telefon', phone || '–'],
      ['Způsob platby', 'Karta (Stripe)'],
      ['Doprava', doprava],
      ['Místo vyzvednutí', pobocka],
      ['Fakturační jméno', billing_name]
    ];

    try {
      // EMAIL ADMINOVI
      await transporter.sendMail({
        from: `"Pekseso web" <${process.env.MAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `Nová objednávka (PLACENO KARTOU) – VS ${vs}`,
        html: emailWrap(`Nová objednávka – VS ${vs}`,
          dataTable(adminRows) + itemsTable(cart, totalPrice)
        ),
      });

      // EMAIL ZÁKAZNÍKOVI
      await transporter.sendMail({
        from: `"Pekseso" <${process.env.MAIL_USER}>`,
        to: email,
        subject: `Potvrzení objednávky a platby – VS ${vs}`,
        html: emailWrap('Vaše pexeso je na cestě!', `
          <p style="font-family:Arial,sans-serif;">Ahoj <strong>${billing_name}</strong>,</p>
          <p style="font-family:Arial,sans-serif;">díky za objednávku! Platba kartou proběhla v pořádku a já se můžu pustit do balení.</p>
          
          <div style="background:#e6f9ed;border-left:4px solid #28a745;padding:16px 20px;margin:20px 0;font-family:Arial,sans-serif;">
            <strong>Platba byla úspěšně přijata.</strong><br>
            Částka: <strong>${totalPrice} Kč</strong><br>
            Variabilní symbol: <strong>${vs}</strong>
          </div>

          ${itemsTable(cart, totalPrice)}

          <p style="font-family:Arial,sans-serif;font-size:14px;color:#555;">Doprava: ${doprava}<br>Místo: ${pobocka}</p>
          <p style="font-family:Arial,sans-serif;">Jakmile balíček předám dopravci, pošlu vám info.</p>
          <p style="font-family:Arial,sans-serif;">Krásný den,<br>Martina – Pekseso</p>
        `),
      });

      console.log(`E-maily pro VS ${vs} byly úspěšně odeslány.`);
    } catch (mailErr) {
      console.error('Chyba při odesílání mailu z webhooku:', mailErr);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};