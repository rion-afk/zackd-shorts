const https = require('https');
const fs = require('fs');

function makeVideo() {
  const k = "sk-43722247d5bf4039933e6eb07bb9c8ac";
  const prompt = "Usa la RICERCA WEB per trovare un caso medico o scientifico assurdo e reale. " +
    "Genera un singolo file HTML completo con Three.js (via CDN) che renderizza su canvas 1080x1920 " +
    "un'animazione 3D macro lucida stile ZackDFilms di 25 secondi sul caso trovato, con sottotitoli " +
    "sincronizzati a schermo, personaggi 3D con facce e vestiti unici, ed espone window.renderFrame(t) " +
    "dove t sono i secondi. Restituisci SOLO codice HTML puro senza ```html.";

  const data = JSON.stringify({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
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
      let out = json.choices[0].message.content;
      out = out.replace(/```html/g, '').replace(/```/g, '').trim();
      fs.writeFileSync('scene.html', out);
      console.log('SCENA 3D SALVATA IN SCENE.HTML');
    });
  });

  req.write(data);
  req.end();
}

makeVideo();
