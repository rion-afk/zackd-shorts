const https = require('https');
const fs = require('fs');

function makeVideo() {
  const k = "sk-43722247d5bf4039933e6eb07bb9c8ac";
  const prompt = "Usa la tua RICERCA WEB per trovare un fatto bizzarro o un caso medico dal web. Genera il codice di rendering visivo completo in Node.js/Three.js/WebGL per creare un'animazione 3D macro fluida di 20-30 secondi in stile ZackDFilms, applicando un rebranding totale con personaggi dai vestiti e dalle facce diverse, e integra i comandi audio per inserire una musica di sottofondo adatta al tema.";
  
  const data = JSON.stringify({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    search_web: true
  });

  const options = {
    hostname: '://deepseek.com',
    port: 443,
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + k,
      'Content-Length': data.length
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
        console.log('\n--- CODICE RENDERING SALVATO IN RENDER_OUTPUT.JS --- \n');
      } catch (e) {
        console.log('Errore riscrittura:', body);
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
