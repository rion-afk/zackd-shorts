const https = require('https');
const fs = require('fs');

function makeVideo() {
  const k = "sk-43722247d5bf4039933e6eb07bb9c8ac";
  const cdn = "./node_modules/three/build/three.min.js";
  const prompt = "Use WEB SEARCH to study the 3D animation style of ZackDFilms and find a real, bizarre medical or psychological story. " +
    "Return ONLY a valid JSON object (no markdown) with 2 keys: " +
    "1) 'voce': Engaging English narration script (70-85 words, 25 seconds, storytelling tone). " +
    "2) 'html': A complete HTML5 file (1080x1920) loading Three.js via <script src='" + cdn + "'></script>. " +
    "STRICT 3D VISUAL RULES: " +
    "- NEVER use a plain black/blue empty background! Build FULL 3D ENVIRONMENTS matching the theme (e.g. outdoor garden with 3D grass, sidewalk, 3D trees, house walls, sky lighting; or 3D hospital room with walls, floor tiles, bed, monitors; or bedroom/school). " +
    "- Switch between at least 3 distinct 3D environments as the story progresses over 25 seconds. " +
    "- Build articulated 3D humanoid characters (head, expressive eyes/mouth, 3D hair, torso with stylish clothes, arms, legs, shoes) using glossy MeshPhysicalMaterial({ clearcoat: 0.8, roughness: 0.2 }). " +
    "- Smooth 3D camera pans, macro zoom-ins, shadows (PCFSoftShadowMap) and ACESFilmicToneMapping. " +
    "- Use THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }). " +
    "- Expose window.renderFrame(t) (t from 0 to 25s) that updates animations, environment, camera, synced English subtitles, and calls renderer.render(scene, camera).";

  const data = JSON.stringify({
    model: "deepseek-chat",
    max_tokens: 8000,i
    temperature: 0.6,
    messages: Array.of({ role: "user", content: prompt }),
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
      console.log("MODELLO:", json.model, "TOKENS:", json.usage);
      let raw = json.choices.at(0).message.content;
      raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(raw);
      fs.writeFileSync('voice.txt', parsed.voce);
      fs.writeFileSync('scene.html', parsed.html);
      console.log('SCENA 3D CON AMBIENTI COMPLETI SALVATA');
    });
  });

  req.write(data);
  req.end();
}

makeVideo();
