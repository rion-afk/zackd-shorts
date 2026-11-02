const https = require('https');
const fs = require('fs');

function makeVideo() {
  const k = "sk-43722247d5bf4039933e6eb07bb9c8ac";
  const prompt = "Usa la RICERCA WEB per trovare un caso medico o fisico assurdo e reale. " +
    "Restituisci SOLO un oggetto JSON valido (senza ```json) con 2 chiavi: " +
    "1) 'voce': il testo parlato in italiano (60-75 parole, stile documentario shock di 25 secondi, voce diversa da Zack). " +
    "2) 'html': un file HTML completo (1080x1920) che usa HTML5 Canvas 2D con gradienti radiali 3D lucidi (effetto plastica/pelle 3D macro), " +
    "personaggi completi con facce, occhi, capelli e vestiti colorati che si muovono, zoom medico sugli organi/ossa, " +
    "e grandi sottotitoli gialli/bianchi sincronizzati al centro. Deve avere window.renderFrame(t) dove t va da 0 a 25 secondi.";

  const data = JSON.stringify({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    search_web: true
  });

  const options = {
    hostname: 'api.' + 'deepseek' + '.com',
    port: 443,
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + k,
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
      const json = JSON.parse(body);
      let raw = json.choices[0].message.content;
      raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(raw);
      fs.writeFileSync('voice.txt', parsed.voce);
      fs.writeFileSync('scene.html', parsed.html);
      console.log('VOCE E SCENA SALVATE CON SUCCESSO');
    });
  });

  req.write(data);
  req.end();
}

makeVideo();
