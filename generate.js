const fs = require('fs');

// Chiave API DeepSeek (usa V4.1-Flash-1017)
const API_KEY = (process.env.DEEPSEEK_API_KEY || "sk-41d3ea3130224c15acd3de9d2fd6acaa").trim();

const MODELS_TO_TRY = [
  "V4.1-Flash-1017",
  "deepseek-flash",
  "deepseek-chat"
];

const SYSTEM_PROMPT = `You are an elite 3D Three.js developer and animator specializing in the exact viral YouTube Shorts style of "Zack D. Films" as shown in the creator workflow.

RETURN ONLY RAW, VALID, SELF-CONTAINED HTML CODE starting with <!DOCTYPE html> and ending with </html>. Do NOT wrap in markdown backticks.

MANDATORY ZACK D. FILMS STYLE & TECHNICAL RULES FOR scene.html:
1. Viewport & Setup:
   - Vertical 9:16 aspect ratio (width: 1080px, height: 1920px).
   - Load Three.js r128 from https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js.
   - Background color: #070d19 with exponential fog (THREE.FogExp2('#070d19', 0.02)).
2. Zack D. Films Studio Environment:
   - Glowing blue/cyan studio floor grid (THREE.GridHelper(50, 50, 0x1e6091, 0x0f2c59)) positioned right beneath the central 3D model.
3. Character Design ("Zack D. Style" Mannequin / Stickman Clean Model):
   - Instead of a random block, build a clean, stylized minimalist 3D mannequin character (smooth rounded head, torso, limbs made of cylinders/spheres with white/light-grey material) that matches the iconic proportions seen in Zack D. Films.
4. 3D Cross-Section & Cutaway Diarama:
   - Build a detailed 3D cross-section model in the center (e.g., underground earth layers, a mechanical trap, or an anatomical structure).
   - Apply black ink outlines on all major 3D edges using THREE.EdgesGeometry + THREE.LineSegments with a pure black material so it pops out like a comic/animated short.
5. Lighting & Shadows:
   - renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
   - Warm directional key light casting strong shadows, plus a cool blue rim light.
6. Camera Choreography (20 seconds animation loop):
   - Phase 1 (0-4s): Dramatic close-up on the character facing the hook.
   - Phase 2 (4-10s): Smooth dolly back / zoom out to reveal the full 3D cutaway on the grid floor.
   - Phase 3 (10-15s): Internal mechanism activation (particles, color shift to deep blue).
   - Phase 4 (15-20s): Final payoff slow orbit.
   - Use requestAnimationFrame and performance.now() to drive smooth animations.
   - Expose window.setSimulationTime = function(seconds) { ... } for frame-by-frame rendering.`;

async function run() {
  let lastError = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Generazione scena Zack D. Films con modello ${modelName}...`);
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
              content: "Create the complete Three.js 9:16 scene.html featuring a clean Zack D. Films style 3D character and cross-section cutaway animation." 
            }
          ],
          temperature: 0.4,
          max_tokens: 8000
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      let html = data.choices[0].message.content.trim();
      
      // Pulizia eventuale da blocchi markdown
      html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
      const doctypeIndex = html.indexOf("<!DOCTYPE html>");
      if (doctypeIndex > 0) {
        html = html.substring(doctypeIndex);
      }

      if (!html.includes("THREE") || !html.includes("<!DOCTYPE html>")) {
        throw new Error("Il codice generato non è un documento HTML Three.js valido.");
      }

      fs.writeFileSync("scene.html", html, "utf8");
      console.log("scene.html in stile Zack D. Films generato e salvato con successo!");
      return;
    } catch (err) {
      console.warn(`Tentativo fallito con ${modelName}:`, err.message);
      lastError = err;
    }
  }

  console.error("Errore critico nella generazione:", lastError);
  process.exit(1);
}

run();
