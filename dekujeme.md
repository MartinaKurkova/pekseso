---
layout: layout.njk
title: "Děkujeme za objednávku"
---

<div class="container container--narrow" style="padding: 40px 20px; text-align: center;">
  <h1>Děkujeme za vaši objednávku!</h1>
  <p>Potvrzení s detaily vám za chvíli dorazí na e-mail.</p>

  <div id="transfer-instructions" style="display: none; background: #f9f9f9; padding: 25px; border-radius: 12px; border: 1px solid #eee; margin: 30px auto; max-width: 500px; text-align: left;">
    <h2 style="margin-top: 0; color: #333;">Podklady pro platbu</h2>
    <p>Částka k úhradě: <strong id="pay-amount" style="font-size: 1.1em;"></strong> Kč</p>
    <p>Číslo účtu: <strong>123456789/0100</strong></p>
    <p>Variabilní symbol: <strong id="pay-vs" style="color: #e63946; font-size: 1.3em;"></strong></p>
    <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">
    <p style="font-size: 0.9em; color: #666;">Objednávku odešleme ihned po připsání platby na účet.</p>
  </div>

  <div id="cash-instructions" style="display: none; background: #fff5f5; padding: 25px; border-radius: 12px; border: 1px solid #fed7d7; margin: 30px auto; max-width: 500px; text-align: left;">
    <h2 style="margin-top: 0; color: #c53030;">Osobní odběr</h2>
    <p>Zvolili jste platbu hotově při převzetí v <strong>Sadské</strong>.</p>
    <p>Počkejte prosím na <strong>SMS nebo e-mail</strong>, ve kterém se domluvíme na čase předání.</p>
  </div>

  <div style="margin-top: 40px;">
    <a href="/" class="btn">Zpět na úvodní stránku</a>
  </div>
</div>

<script>
  const urlParams = new URLSearchParams(window.location.search);
  const vs = urlParams.get('vs');
  const amount = urlParams.get('amount');
  const method = urlParams.get('method');

  if (method === 'transfer' && vs && amount) {
    document.getElementById('transfer-instructions').style.display = 'block';
    document.getElementById('pay-vs').innerText = vs;
    document.getElementById('pay-amount').innerText = amount;
  } 
  else if (method === 'cash') {
    document.getElementById('cash-instructions').style.display = 'block';
  }
</script>