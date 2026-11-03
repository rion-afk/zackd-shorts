const fs = require('fs');

const API_KEY = (process.env.DEEPSEEK_API_KEY || "sk-41d3ea3130224c15acd3de9d2fd6acaa").trim();

const MODELS_TO_TRY = [
  "V4.1-Flash-1017",
  "deepseek-flash",
  "deepseek-chat"
];

async function askDeepSeek(systemPrompt, userPrompt, temperature = 0.4) {
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
      console.log(`[${model}] Token usati: ${data.usage ? data.usage.total_tokens : 'OK'}`);
      return data.choices[0].message.content.trim();
    } catch (e) {
      console.warn(`Avviso modello ${model}:`, e.message);
      lastErr = e;
    }
  }
  throw lastErr;
}

function cleanHtml(raw) {
  let html = raw.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
  const idx = html.indexOf("<!DOCTYPE html>");
  if (idx > 0) html = html.substring(idx);
  return html;
}

async function runMultiAgentPipeline() {
  console.log("=== AGENTE 1: Ricerca Stile Zack D. Films, Script e Direzione Artistica ===");
  const blueprintRaw = await askDeepSeek(
    `You are Agent 1 (Creative Director & Technical Planner) for viral 3D YouTube Shorts in the style of Zack D. Films and TaleTok.
Return ONLY valid JSON with two keys:
{
  "voice_script": "60-70 word punchy English script. Sentence 1 MUST be a bizarre paradox or instant action hook. Middle sentence MUST start with 'You see,'. Fast-paced, zero fluff, plain text only.",
  "visual_plan": "Detailed 3D cutaway breakdown: 4 distinct underground/internal cutaway layers, exact character clothing colors (hoodie, pants, shoes, hair), moving mechanical/anatomical parts, particle effects, and 4 smooth camera movements across 20 seconds."
}`,
    `Pick a fascinating historical survival trap, engineering mechanism, or human body cutaway concept in the style of Zack D. Films. Slightly adapt the script and give the character modern streetwear clothing. Output JSON only.`,
    0.6
  );

  let voiceScript = "When a medieval prisoner was thrown into an oubliette dungeon, the fall wasn't what trapped him. You see, the stone chamber was shaped like a narrow bottle with a hidden trapdoor on top and greased walls underneath, making it physically impossible to climb back out.";
  let visualPlan = blueprintRaw;

  try {
    const cleanJson = blueprintRaw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleanJson);
    if (parsed.voice_script) voiceScript = parsed.voice_script;
    if (parsed.visual_plan) visualPlan = JSON.stringify(parsed.visual_plan);
  } catch (e) {
    console.log("Uso piano testuale diretto dall'Agente 1.");
  }

  // Pulisce caratteri speciali per evitare che Edge-TTS si blocchi
  voiceScript = voiceScript.replace(/[*_#`~<>]/g, "").replace(/\s+/g, " ").trim();
  fs.writeFileSync("voice.txt", voiceScript, "utf8");
  console.log("Script salvato in voice.txt:", voiceScript);

  console.log("=== AGENTE 2: Costruzione Mondo 3D Three.js e Texture Dipinte via Codice ===");
  const draftHtmlRaw = await askDeepSeek(
    `You are Agent 2 (Lead Three.js Procedural 3D Artist). Build a complete, self-contained <!DOCTYPE html> 9:16 vertical animation for this story and visual plan.
STRICT VISUAL RULES (NO BLOCKY TIN ROBOTS):
1. Load Three.js r128 from https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js.
2. NEVER draw wireframe lines on curved character parts! ONLY apply THREE.EdgesGeometry(geometry, 35) (threshold angle 35 degrees!) on flat architectural/cutaway boxes so spheres and cylinders stay 100% smooth without vertical stripes.
3. PAINT TEXTURES IN CODE: Create a helper function that draws wood grain, brick patterns, soil strata, and fabric textures on a 2D HTML5 <canvas> and returns new THREE.CanvasTexture(canvas). Apply these textures to the 3D cross-section cutaway layers!
4. CHARACTER DESIGN: Build an expressive, smooth-shaded stylized 3D human character wearing colored clothing (a colored hoodie/jacket torso with sleeves, dark pants, sneakers, neck, smooth head with eyes, eyebrows, and hair). Use MeshStandardMaterial with roughness: 0.6, metalness: 0.05 (NEVER metallic silver/white).
5. CONTINUOUS ACTION (0s to 20s): The character and the 3D cutaway mechanism MUST actively move throughout all 20 seconds (walking, falling/reacting, trapdoors/pistons/water moving, particles rising, legs and arms swinging via Math.sin).
6. CAMERA GLIDES: Smoothly interpolate camera.position and camera.lookAt across 4 shots (0-4s close-up hook, 4-10s wide cross-section reveal on the glowing blue studio grid floor, 10-15s internal cutaway close-up with dramatic lighting change, 15-20s final orbit).
7. Expose window.setSimulationTime = function(t) { ... } that updates all positions, limb rotations, particles, camera, and calls renderer.render(scene, camera) at time t (in seconds).`,
    `Story Script: "${voiceScript}"\nVisual Plan: ${visualPlan}\nReturn ONLY the complete <!DOCTYPE html>...</html> code.`,
    0.4
  );

  const draftHtml = cleanHtml(draftHtmlRaw);

  console.log("=== AGENTE 3: Art Director & Controllo Qualità (Upgrade Grafico e Animazioni) ===");
  const finalHtmlRaw = await askDeepSeek(
    `You are Agent 3 (Senior 3D Art Director & QA Engineer, replicating the multi-agent quality pass from the viral shorts workflow).
Inspect the provided Three.js HTML code and return an UPGRADED, COMPLETE <!DOCTYPE html>...</html> version that fixes any visual weakness:
1. Ensure there are NO vertical black wireframe stripes on cylinders or spheres (any EdgesGeometry MUST use threshold angle >= 35, and NEVER put EdgesGeometry on the character's head or limbs).
2. Ensure the character wears vibrant clothes (e.g., crimson/emerald jacket, dark trousers, shoes, eyes, hair) and has smooth skin tone—NOT a white/silver robot.
3. Ensure the 3D cross-section cutaway block has multiple visible underground/interior layers with procedural CanvasTextures, interior props, dynamic moving parts, and particle effects.
4. Ensure window.setSimulationTime(seconds) deterministically updates every animation (character walking/falling/gesturing, moving environment parts, camera glides) and calls renderer.render(scene, camera) at the end of setSimulationTime.
Return ONLY the complete raw HTML starting with <!DOCTYPE html> and ending with </html>.`,
    `Upgrade and polish this Three.js scene for the script "${voiceScript}":\n\n${draftHtml}`,
    0.3
  );

  let finalHtml = cleanHtml(finalHtmlRaw);
  if (!finalHtml.includes("<!DOCTYPE html>") || !finalHtml.includes("THREE")) {
    console.log("Uso il codice dell'Agente 2 come fallback sicuro.");
    finalHtml = draftHtml;
  }

  fs.writeFileSync("scene.html", finalHtml, "utf8");
  console.log("SUCCESSO: Pipeline a 3 Agenti completata e scene.html salvato!");
}

runMultiAgentPipeline().catch(err => {
  console.error("Errore fatale in generate.js:", err);
  process.exit(1);
});
