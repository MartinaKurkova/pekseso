// netlify/functions/_emailTemplate.js
// Sdílená šablona pro všechny emaily
// Použití: const { emailWrap } = require('./_emailTemplate');

const LOGO_URL = 'https://pekseso-web.netlify.app/images/logo/pekseso_logo.png';
const COLOR_PRIMARY = '#540D6E';
const COLOR_SECONDARY = '#FFD23F';

function emailWrap(title, content) {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Georgia,serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- ZÁHLAVÍ -->
          <tr>
            <td align="center" style="background-color:${COLOR_PRIMARY};padding:30px 40px;">
              <img src="${LOGO_URL}" alt="PE[KS]ESO" width="190" height="40" style="display:block;border:0;">
            </td>
          </tr>

          <!-- OBSAH -->
          <tr>
            <td style="padding:40px;color:#333333;font-size:16px;line-height:1.6;">
              <h1 style="margin:0 0 20px 0;font-size:22px;color:${COLOR_PRIMARY};font-family:Georgia,serif;">${title}</h1>
              ${content}
            </td>
          </tr>

          <!-- ZÁPATÍ -->
          <tr>
            <td style="background-color:${COLOR_PRIMARY};padding:24px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#ffffff;font-size:13px;line-height:1.8;font-family:Arial,sans-serif;">
                    <strong style="font-size:14px;">Martina Kurková Nožičková</strong><br>
                    <a href="mailto:ahoj@pekseso.cz" style="color:${COLOR_SECONDARY};text-decoration:none;">ahoj@pekseso.cz</a><br>
                    <a href="https://www.instagram.com/pekseso.cz/" style="color:${COLOR_SECONDARY};text-decoration:none;">@pekseso.cz</a> na Instagramu
                  </td>
                  <td align="right" valign="middle">
                    <a href="https://www.instagram.com/pekseso.cz/" style="display:inline-block;">
                      <img src="https://pekseso-web.netlify.app/images/logo/instragram.svg" alt="Instagram" width="28" height="28" style="display:block;border:0;filter:brightness(0) invert(1);">
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MINI PATIČKA -->
          <tr>
            <td align="center" style="padding:16px;background-color:#f4f4f4;font-size:11px;color:#999999;font-family:Arial,sans-serif;">
              © Pekseso – <a href="https://pekseso-web.netlify.app" style="color:#999999;">pekseso.cz</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// Pomocná funkce pro tabulku s daty
function dataTable(rows) {
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <th align="left" style="border:1px solid #e0e0e0;background:#f9f9f9;padding:10px 14px;font-size:14px;font-weight:600;color:#555;width:40%;font-family:Arial,sans-serif;">${label}</th>
      <td style="border:1px solid #e0e0e0;padding:10px 14px;font-size:14px;color:#333;font-family:Arial,sans-serif;">${value}</td>
    </tr>`).join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">${rowsHtml}</table>`;
}

// Pomocná funkce pro tabulku položek
function itemsTable(cart, totalPrice) {
  const rows = cart.map(i => `
    <tr>
      <td style="border:1px solid #e0e0e0;padding:10px 14px;font-size:14px;font-family:Arial,sans-serif;">${i.name}</td>
      <td style="border:1px solid #e0e0e0;padding:10px 14px;font-size:14px;text-align:center;font-family:Arial,sans-serif;">${i.quantity}×</td>
      <td style="border:1px solid #e0e0e0;padding:10px 14px;font-size:14px;text-align:right;font-family:Arial,sans-serif;">${i.price * i.quantity} Kč</td>
    </tr>`).join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
      <tr style="background-color:#540D6E;">
        <th align="left" style="border:1px solid #540D6E;padding:10px 14px;font-size:14px;color:#ffffff;font-family:Arial,sans-serif;">Produkt</th>
        <th style="border:1px solid #540D6E;padding:10px 14px;font-size:14px;color:#ffffff;font-family:Arial,sans-serif;">Množství</th>
        <th style="border:1px solid #540D6E;padding:10px 14px;font-size:14px;color:#ffffff;text-align:right;font-family:Arial,sans-serif;">Cena</th>
      </tr>
      ${rows}
      <tr style="background-color:#fff9e6;">
        <td colspan="2" style="border:1px solid #e0e0e0;padding:10px 14px;font-size:14px;text-align:right;font-weight:bold;font-family:Arial,sans-serif;">Celkem</td>
        <td style="border:1px solid #e0e0e0;padding:10px 14px;font-size:14px;text-align:right;font-weight:bold;font-family:Arial,sans-serif;">${totalPrice} Kč</td>
      </tr>
    </table>`;
}

module.exports = { emailWrap, dataTable, itemsTable };
