const fs = require('fs');

const API_KEY = (process.env.DEEPSEEK_API_KEY || "sk-41d3ea3130224c15acd3de9d2fd6acaa").trim();

const MODELS_TO_TRY = [
  "V4.1-Flash-1017",
  "deepseek-flash",
  "deepseek-chat"
];

async function askDeepSeek(systemPrompt, userPrompt, temperature = 0.3) {
  let lastErr = null;
  for (const model of MODELS_TO_TRY) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature,
          max_tokens: 8000
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }

      const data = await res.json();
      return data.choices[0].message.content.trim();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function runPipeline() {
  console.log("Generazione script e scena 3D sicura...");
  
  const prompt = `You are an expert Three.js developer. Create a fully self-contained, valid HTML file (starting with <!DOCTYPE html> and ending with </html>) that renders a vertical 9:16 YouTube Short in the style of Zack D. Films.

CRITICAL REQUIREMENTS TO AVOID WHITE SCREEN:
1. Load Three.js r128 from https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js via CDN.
2. Setup a standard WebGLRenderer with antialias, shadowMap enabled, size width: 1080, height: 1920.
3. Background color: #070d19. Add a glowing blue grid floor (THREE.GridHelper).
4. Build a 3D cross-section cutaway diorama block in the center with layered materials and black ink outlines (THREE.EdgesGeometry).
5. Build a stylized 3D human character wearing a colored hoodie and pants (using MeshStandardMaterial, NEVER pure white/silver block).
6. Implement smooth animations driven by window.setSimulationTime = function(t) { ... } where 't' goes from 0 to 20 seconds. Inside this function, update character positions/rotations using Math.sin(t), move camera glides smoothly, and explicitly call renderer.render(scene, camera).
7. Return ONLY raw HTML code without any markdown backticks.`;

  let htmlCode = await askDeepSeek(
    "You output only raw executable HTML code for Three.js.",
    prompt,
    0.3
  );

  htmlCode = htmlCode.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
  const idx = htmlCode.indexOf("<!DOCTYPE html>");
  if (idx > 0) htmlCode = htmlCode.substring(idx);

  if (!htmlCode.includes("THREE") || !htmlCode.includes("setSimulationTime")) {
    throw new Error("Il codice generato non è valido.");
  }

  // Genera anche uno script vocale sicuro in voice.txt
  const voiceText = "When an ancient prisoner entered the escape-proof oubliette, he thought he was safe. You see, the chamber was engineered with a hidden weight-activated floor that immediately plunged him into total darkness.";
  fs.writeFileSync("voice.txt", voiceText, "utf8");
  fs.writeFileSync("scene.html", htmlCode, "utf8");
  console.log("scene.html e voice.txt generati con successo!");
}

runPipeline().catch(err => {
  console.error("Errore:", err);
  process.exit(1);
});
