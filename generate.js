const https = require('https');
const fs = require('fs');

function makeVideo() {
  const k = "sk-43722247d5bf4039933e6eb07bb9c8ac";
  const prompt = "Usa la RICERCA WEB su ZackDFilms. " +
    "Genera il CODICE DI RENDERING 3D (Node.js/Three.js) " +
    "per un animazione macro di 20-30s. Cambia vestiti e " +
    "facce dei personaggi, cambia voce e metti comandi per " +
    "musica a tema. Restituisci solo codice puro.";

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
      try {
        const json = JSON.parse(body);
        const output = json.choices[0].message.content;
        fs.writeFileSync('render_output.js', output);
        console.log('\n--- CODICE SALVATO IN RENDER_OUTPUT.JS ---\n');
        console.log(output);
      } catch (e) {
        console.log('Errore risposta:', body);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Errore:', e);
  });

  req.write(data);
  req.end();
}

makeVideo();
