const fs = require('fs');

// Chiave API corretta con "sk-" minuscolo (o letta dai Secrets se presente)
const API_KEY = (process.env.DEEPSEEK_API_KEY || "sk-41d3ea3130224c15acd3de9d2fd6acaa").trim();

// Lista modelli: prova prima V4.1-Flash-1017, poi gli alias ufficiali API DeepSeek
const MODELS_TO_TRY = [
  "V4.1-Flash-1017",
  "deepseek-flash",
  "deepseek-chat"
];

// Legge lo script da voice.txt (se presente nel repository)
let scriptText = "When an injured amphibian crawled into a tiny predator's burrow, it looked like a terrible mistake. You see, the predator was in a deep resting state, and a sudden flood froze the two unlikely roommates together for 250 million years.";

if (fs.existsSync("voice.txt")) {
  const fileContent = fs.readFileSync("voice.txt", "utf8").trim();
  if (fileContent.length > 5) {
    scriptText = fileContent;
  }
} else {
  fs.writeFileSync("voice.txt", scriptText, "utf8");
}

const SYSTEM_PROMPT = `You are an elite Three.js 3D technical artist specialized in making vertical 9:16 YouTube Shorts in the exact visual style of "Zack D. Films" and "TaleTok 3D Studio Cutaways".

RETURN ONLY RAW, VALID, SELF-CONTAINED HTML CODE starting with <!DOCTYPE html> and ending with </html>. Do NOT wrap in markdown backticks.

MANDATORY VISUAL & TECHNICAL RULES FOR scene.html:
1. Viewport: Fullscreen vertical 9:16 aspect ratio (margin: 0, overflow: hidden, background: #070d19). Load Three.js r128 from https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js.
2. Zack D. Films Signature Studio Environment:
   - Deep dark navy-blue studio atmosphere with fog (THREE.FogExp2('#070d19', 0.025)).
   - Glowing cyan/blue studio grid floor (THREE.GridHelper(60, 60, 0x2b7de9, 0x123261)) positioned below a 3D cutaway diorama block.
3. 3D Cross-Section Cutaway Diorama (TaleTok Style):
   - Build a rich, multi-layered 3D cross-section cutaway cube/slice in the center of the studio showing underground strata, architectural walls, or anatomical/mechanical cross-sections matching the story.
   - Use MeshStandardMaterial and MeshPhysicalMaterial with realistic roughness, metalness, clearcoat, and vertex/procedural colors. Never use flat MeshBasicMaterial for 3D objects.
   - Add dark comic/ink edge outlines using THREE.EdgesGeometry + THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 })) on all main geometry blocks so the 3D world looks crisp and high-contrast.
4. Lighting & Shadows:
   - Enable renderer.shadowMap.enabled = true and renderer.shadowMap.type = THREE.PCFSoftShadowMap.
   - Add warm DirectionalLight key light casting shadows, cool blue Rim DirectionalLight, HemisphereLight, and subtle PointLights inside the cutaway.
5. Articulated Subjects & Micro-Animations:
   - Construct detailed composite 3D characters/creatures/objects using multiple grouped primitives (spheres, cylinders, cones, torus) with joints that breathe, move, react, and cast real shadows.
   - Add particle systems (dust, water flood, sparks, or debris) that react dynamically during the twist of the story.
6. Multi-Shot Camera Choreography (20 seconds total loop):
   - Divide the 20-second timeline into 4 cinematic phases matching the script:
     * 0s - 4s (Hook): Dramatic close-up inside the cross-section with slow camera push-in.
     * 4s - 10s (Escalation): Smooth camera pull-back and orbit revealing the full cutaway cross-section on the blue grid floor.
     * 10s - 15s ("You see" Pivot): Lighting shifts to dramatic deep blue/purple contrast while dynamic action/particles trigger.
     * 15s - 20s (Payoff): Slow cinematic glide to the final frozen state.
   - Use smooth cubic easing (smoothstep/lerp) for all camera movements.
7. Compatibility with Puppeteer / Video Renderers:
   - Animate automatically via requestAnimationFrame using performance.now().
   - ALSO expose window.setSimulationTime = function(seconds) { ... } so external frame-by-frame recorders can step through the animation deterministically if needed.`;

async function callDeepSeekWithFallback() {
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    console.log(`Tentativo di generazione con modello: ${modelName}...`);
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Build a complete, high-detail Three.js 3D cross-section cutaway scene.html for this script:\n"${scriptText}"\nMake sure the 3D cutaway diorama, characters, lighting changes, and camera movements visually tell this exact story frame by frame.`
            }
          ],
          temperature: 0.5,
          max_tokens: 8000
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Il modello ${modelName} ha risposto con stato ${response.status}: ${errText}`);
        lastError = new Error(`HTTP ${response.status}: ${errText}`);
        continue;
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Risposta API vuota o malformata.");
      }

      console.log(`Successo con modello: ${modelName}`);
      if (data.usage) {
        console.log(`Token usati -> Prompt: ${data.usage.prompt_tokens}, Completamento: ${data.usage.completion_tokens}`);
      }

      let html = data.choices[0].message.content.trim();
      // Rimuove eventuali blocchi markdown ```html ... ```
      html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

      const doctypeIndex = html.indexOf("<!DOCTYPE html>");
      if (doctypeIndex > 0) {
        html = html.substring(doctypeIndex);
      }

      if (!html.includes("<html") || !html.includes("THREE")) {
        throw new Error("Il codice generato non contiene una scena Three.js valida.");
      }

      fs.writeFileSync("scene.html", html, "utf8");
      console.log("File scene.html salvato correttamente!");
      return;
    } catch (err) {
      console.warn(`Errore durante il tentativo con ${modelName}:`, err.message);
      lastError = err;
    }
  }

  console.error("ERRORE FATALE: Nessun modello DeepSeek ha risposto correttamente.");
  if (lastError) console.error(lastError);
  process.exit(1);
}

callDeepSeekWithFallback();

