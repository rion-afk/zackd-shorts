```javascript
// ZackDFilms 3D Macro Animation
// Node.js + Three.js
// Run: npm install three && node server.js (or use browser via bundler)

const THREE = require('three');
const fs = require('fs');

// ============ SCENE SETUP ============
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a15);
scene.fog = new THREE.FogExp2(0x0a0a15, 0.045);

const camera = new THREE.PerspectiveCamera(50, 16/9, 0.1, 200);
camera.position.set(0, 3, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1920, 1080);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ============ LIGHTING ============
const ambient = new THREE.AmbientLight(0x445588, 0.6);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffeedd, 1.6);
keyLight.position.set(8, 12, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 40;
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x00ffff, 2.5, 30);
rimLight.position.set(-8, 6, -4);
scene.add(rimLight);

const fillLight = new THREE.PointLight(0xff0066, 2.0, 25);
fillLight.position.set(6, 4, -6);
scene.add(fillLight);

const spot = new THREE.SpotLight(0xffffff, 3, 30, Math.PI/6, 0.4);
spot.position.set(0, 15, 5);
scene.add(spot);

// ============ GROUND ============
const groundGeo = new THREE.CircleGeometry(20, 64);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x111122,
  roughness: 0.3,
  metalness: 0.7
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ============ CHARACTER FACTORY ============
const faces = [
  { skin: 0xffdbac, eye: 0x222222, hair: 0x2a1a0a },
  { skin: 0xc68642, eye: 0x1a1a1a, hair: 0x000000 },
  { skin: 0x8d5524, eye: 0x332211, hair: 0x1a0a00 },
  { skin: 0xf1c27d, eye: 0x004400, hair: 0xd4a017 },
  { skin: 0xe0ac69, eye: 0x002255, hair: 0x8b0000 }
];

const outfits = [
  { body: 0x1e3a8a, accent: 0xfbbf24, pants: 0x1f2937 },
  { body: 0xdc2626, accent: 0xffffff, pants: 0x111111 },
  { body: 0x059669, accent: 0xfacc15, pants: 0x374151 },
  { body: 0x7c3aed, accent: 0xec4899, pants: 0x1f2937 },
  { body: 0xf59e0b, accent: 0x111827, pants: 0x0f172a },
  { body: 0x0891b2, accent: 0xf472b6, pants: 0x27272a }
];

function createCharacter(faceIdx, outfitIdx, posX, posZ) {
  const face = faces[faceIdx % faces.length];
  const outfit = outfits[outfitIdx % outfits.length];
  const group = new THREE.Group();

  // Torso
  const torsoGeo = new THREE.CapsuleGeometry(0.55, 0.9, 8, 16);
  const torsoMat = new THREE.MeshStandardMaterial({
    color: outfit.body, roughness: 0.6, metalness: 0.15
  });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 1.8;
  torso.castShadow = true;
  group.add(torso);

  // Accent stripe
  const stripeGeo = new THREE.BoxGeometry(0.15, 0.9, 0.6);
  const stripeMat = new THREE.MeshStandardMaterial({ color: outfit.accent, emissive: outfit.accent, emissiveIntensity: 0.3 });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 1.8, 0.28);
  group.add(stripe);

  // Head
  const headGeo = new THREE.SphereGeometry(0.42, 32, 32);
  const headMat = new THREE.MeshStandardMaterial({ color: face.skin, roughness: 0.7 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 2.85;
  head.castShadow = true;
  group.add(head);

  // Hair
  const hairGeo = new THREE.SphereGeometry(0.44, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const hairMat = new THREE.MeshStandardMaterial({ color: face.hair, roughness: 0.9 });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 2.88;
  group.add(hair);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({ color: face.eye, emissive: 0x111111 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.15, 2.9, 0.37);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.15, 2.9, 0.37);
  group.add(eyeL, eyeR);

  // Mouth
  const mouthGeo = new THREE.BoxGeometry(0.18, 0.04, 0.05);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x660000 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, 2.7, 0.4);
  group.add(mouth);

  // Arms
  const armGeo = new THREE.CapsuleGeometry(0.14, 0.75, 6, 12);
  const armMat = new THREE.MeshStandardMaterial({ color: outfit.body, roughness: 0.6 });
  const armL = new THREE.Mesh(armGeo, armMat);
  armL.position.set(-0.7, 1.85, 0);
  armL.rotation.z = 0.3;
  armL.castShadow = true;
  const armR = new THREE.Mesh(armGeo, armMat);
  armR.position.set(0.7, 1.85, 0);
  armR.rotation.z = -0.3;
  armR.castShadow = true;
  group.add(armL, armR);

  // Pants (legs)
  const legGeo = new THREE.CapsuleGeometry(0.18, 0.85, 6, 12);
  const legMat = new THREE.MeshStandardMaterial({ color: outfit.pants, roughness: 0.7 });
  const legL = new THREE.Mesh(legGeo, legMat);
  legL.position.set(-0.25, 0.65, 0);
  legL.castShadow = true;
  const legR = new THREE.Mesh(legGeo, legMat);
  legR.position.set(0.25, 0.65, 0);
  legR.castShadow = true;
  group.add(legL, legR);

  // Shoes
  const shoeGeo = new THREE.BoxGeometry(0.32, 0.18, 0.5);
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4, metalness: 0.6 });
  const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
  shoeL.position.set(-0.25, 0.09, 0.06);
  const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
  shoeR.position.set(0.25, 0.09, 0.06);
  group.add(shoeL, shoeR);

  group.position.set(posX, 0, posZ);
  group.userData = { faceIdx, outfitIdx, armL, armR, head, torso, stripe };
  return group;
}

// ============ SPAWN CHARACTERS ============
const characters = [];
const positions = [
  [-3, 0], [3, 0], [-6, -2], [6, -2], [0, -3]
];
const faceOrder = [0, 1, 2, 3, 4];
const outfitOrder = [0, 2, 4, 1, 3, 5];

positions.forEach((p, i) => {
  const c = createCharacter(faceOrder[i], outfitOrder[i], p[0], p[1]);
  scene.add(c);
  characters.push(c);
});

// ============ PARTICLES ============
const particleCount = 800;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);
const particleVel = [];
for (let i = 0; i < particleCount; i++) {
  particlePos[i*3] = (Math.random() - 0.5) * 40;
  particlePos[i*3+1] = Math.random() * 15;
  particlePos[i*3+2] = (Math.random() - 0.5) * 40;
  particleVel.push({
    x: (Math.random() - 0.5) * 0.02,
    y: Math.random() * 0.03 + 0.005,
    z: (Math.random() - 0.5) * 0.02
  });
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0x66ddff, size: 0.08, transparent: true, opacity: 0.7,
  blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// ============ RINGS ============
const rings = [];
for (let i = 0; i < 3; i++) {
  const ringGeo = new THREE.TorusGeometry(2 + i * 1.2, 0.05, 16, 100);
  const ringMat = new THREE.MeshStandardMaterial({
    color: [0x00ffff, 0xff0066, 0xffaa00][i],
    emissive: [0x00ffff, 0xff0066, 0xffaa00][i],
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.8
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.1 + i * 0.1;
  scene.add(ring);
  rings.push(ring);
}

// ============ AUDIO (VOICE + THEME MUSIC) ============
// Voice lines: distinct "voices" via different oscillator frequencies and filters
class VoiceSynth {
  constructor(ctx) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
  }
  speak(freqBase, duration, time) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freqBase * 2.2;
    filter.Q.value = 8;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freqBase, time);
    osc.frequency.linearRampToValueAtTime(freqBase * 1.4, time + duration * 0.3);
    osc.frequency.linearRampToValueAtTime(freqBase * 0.8, time + duration);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.05);
    gain.gain.linearRampToValueAtTime(0.12, time + duration * 0.7);
    gain.gain.linearRampToValueAtTime(0, time + duration);
    osc.connect(filter); filter.connect(gain); gain.connect(this.master);
    osc.start(time); osc.stop(time + duration);
  }
  // Voice 1: deep male — 90Hz
  voiceDeep(t, dur) { this.speak(90, dur, t); }
  // Voice 2: female — 220Hz
  voiceFemale(t, dur) { this.speak(220, dur, t); }
  // Voice 3: robotic — 440Hz with vibrato
  voiceRobot(t, dur) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    lfo.frequency.value = 6;
    lfoGain.gain.value = 20;
    osc.type = 'square';
    osc.frequency.value = 440;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + dur);
    osc.connect(gain); gain.connect(this.master);
    osc.start(t); lfo.start(t);
    osc.stop(t + dur); lfo.stop(t + dur);
  }
}

// Theme music: cinematic synth
class ThemeMusic {
  constructor(ctx) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(ctx.destination);
  }
  playNote(freq, start, dur, type = 'sine', vol = 0.15) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain); gain.connect(this.master);
    osc.start(start); osc.stop(start + dur);
  }
  playKick(start) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, start);
    osc.frequency.exponentialRampToValueAtTime(40, start + 0.15);
    gain.gain.setValueAtTime(0.5, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    osc.connect(gain); gain.connect(this.master);
    osc.start(start); osc.stop(start + 0.3);
  }
  playSnare(start) {
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
    noise.connect(filter); filter.connect(gain); gain.connect(this.master);
    noise.start(start);
  }
  buildCinematicSequence(t0) {
    // C minor epic progression
    const notes = {
      C3: 130.81, Eb3: 155.56, G3: 196.00, C4: 261.63,
      Eb4: 311.13, G4: 392.00, Bb3: 233.08, Ab3: 207.65,
      F3: 174.61, F4: 349.23, D4: 293.66
    };
    // Drums
    for (let i = 0; i < 28; i++) {
      if (i % 2 === 0) this.playKick(t0 + i * 0.5);
      if (i % 4 === 2) this.playSnare(t0 + i * 0.5);
    }
    // Bass line
    const bassLine = [notes.C3, notes.C3, notes.Eb3, notes.Eb3, notes.G3, notes.G3, notes.Bb3, notes.Ab3];
    for (let i = 0; i < 14; i++) {
      this.playNote(bassLine[i % bassLine.length], t0 + i * 1.0, 0.9, 'sawtooth', 0.12);
    }
    // Melody
    const melody = [
      [notes.C4, 0.0], [notes.Eb4, 0.5], [notes.G4, 1.0], [notes.Eb4, 1.5],
      [notes.C4, 2.0], [notes.G4, 2.5], [notes.Bb3, 3.0], [notes.C4, 3.5],
      [notes.Ab3, 4.0], [notes.G4, 4.5], [notes.F4, 5.0], [notes.Eb4, 5.5],
      [notes.D4, 6.0], [notes.C4, 6.5], [notes.G3, 7.0], [notes.C4, 7.5],
      [notes.Eb4, 8.0], [notes.G4, 8.5], [notes.C4, 9.0], [notes.G3, 9.5],
      [notes.F3, 10.0], [notes.Ab3, 10.5], [notes.C4, 11.0], [notes.Eb4, 11.5],
      [notes.G4, 12.0], [notes.F4, 12.5], [notes.Eb4, 13.0], [notes.C4, 13.5]
    ];
    melody.forEach(([f, off]) => {
      this.playNote(f, t0 + off, 0.55, 'triangle', 0.10);
    });
    // Pad chords
    const chords = [
      [notes.C3, notes.Eb3, notes.G3],
      [notes.Ab3, notes.C4, notes.Eb4],
      [notes.F3, notes.Ab3, notes.C4],
      [notes.G3, notes.Bb3, notes.D4]
    ];
    for (let c = 0; c < 4; c++) {
      chords[c].forEach(f => {
        this.playNote(f, t0 + c * 3.5, 3.4, 'sine', 0.05);
      });
    }
  }
}

// ============ ANIMATION STATE ============
let audioCtx = null;
let voice = null;
let music = null;
let audioStarted = false;
const CLIP_DURATION = 25.0; // 25 seconds
let elapsed = 0;
let lastTime = Date.now();

// Outfit/face swap schedule (character, newOutfit, newFace, atTime)
const swapSchedule = [
  { char: 0, outfit: 3, face: 1, at: 5.0 },
  { char: 1, outfit: 5, face: 2, at: 7.0 },
  { char: 2, outfit: 1, face: 4, at: 9.0 },
  { char: 3, outfit: 0, face: 0, at: 11.0 },
  { char: 4, outfit: 2, face: 3, at: 13.0 },
  { char: 0, outfit: 4, face: 2, at: 16.0 },
  { char: 2, outfit: 3, face: 1, at: 18.0 },
  { char: 4, outfit: 5, face: 0, at: 20.0 }
];
const swapDone = new Set();

function applyOutfitChange(char, outfitIdx, faceIdx) {
  const outfit = outfits[outfitIdx % outfits.length];
  const face = faces[faceIdx % faces.length];
  char.children.forEach(child => {
    if (child.geometry && child.geometry.type === 'CapsuleGeometry' && child.position.y > 1) {
      child.material.color.setHex(outfit.body);
    }
    if (child.geometry && child.geometry.type === 'BoxGeometry' && child.position.z > 0.2) {
      child.material.color.setHex(outfit.accent);
      child.material.emissive.setHex(outfit.accent);
    }
    if (child.geometry && child.geometry.type === 'SphereGeometry' && child.position.y > 2.7 && !child.material.emissive) {
      child.material.color.setHex(face.skin);
    }
    if (child.geometry && child.geometry.type === 'SphereGeometry' && child.position.y > 2.85 && child.position.y < 3.0) {
      child.material.color.setHex(face.hair);
    }
  });
  // Flash effect
  const flash = new THREE.PointLight(0xffffff, 8, 6);
  flash.position.copy(char.position);
  flash.position.y = 2;
  scene.add(flash);
  setTimeout(() => scene.remove(flash), 400);
}

// ============ RENDER LOOP ============
function animate() {
  const now = Date.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  elapsed += dt;

  // ============ AUDIO START (on first frame after 0.5s) ============
  if (!audioStarted && elapsed > 0.5) {
    audioStarted = true;
    // node: use node-web-audio-api polyfill if available
    try {
      if (typeof AudioContext !== 'undefined') audioCtx = new AudioContext();
      else if (typeof webkitAudioContext !== 'undefined') audioCtx = new webkitAudioContext();
    } catch (e) {}
    if (audioCtx) {
      voice = new VoiceSynth(audioCtx);
      music = new ThemeMusic(audioCtx);
      const t0 = audioCtx.currentTime + 0.1;
      music.buildCinematicSequence(t0);
      // Voices at different times
      voice.voiceDeep(t0 + 2.0, 0.6);
      voice.voiceFemale(t0 + 3.5, 0.5);
      voice.voiceRobot(t0 + 5.0, 0.7);
      voice.voiceDeep(t0 + 7.5, 0.5);
      voice.voiceFemale(t0 + 9.5, 0.6);
      voice.voiceRobot(t0 + 12.0, 0.5);
      voice.voiceDeep(t0 + 15.0, 0.6);
      voice.voiceFemale(t0 + 18.0, 0.5);
      voice.voiceRobot(t0 + 21.0, 0.8);
    }
  }

  // ============ TIMELINE ============
  const t = elapsed;

  // Camera orbit (macro = close-up drifting)
  const camAngle = t * 0.25;
  const camRadius = 7.5 + Math.sin(t * 0.4) * 1.5;
  camera.position.x = Math.cos(camAngle) * camRadius;
  camera.position.z = Math.sin(camAngle) * camRadius;
  camera.position.y = 3.2 + Math.sin(t * 0.6) * 1.2;
  const targetY = 1.9 + Math.sin(t * 0.8) * 0.15;
  camera.lookAt(0, targetY, 0);

  // Character animations
  characters.forEach((char, i) => {
    const phase = i * 1.3;
    // Idle bob
    char.position.y = Math.sin(t * 2 + phase) * 0.06;
    // Arm sway
    char.userData.armL.rotation.z = 0.3 + Math.sin(t * 1.5 + phase) * 0.25;
    char.userData.armR.rotation.z = -0.3 - Math.sin(t * 1.5 + phase) * 0.25;
    // Head nod
    char.userData.head.rotation.x = Math.sin(t * 1.2 + phase) * 0.08;
    char.userData.head.rotation.y = Math.sin(t * 0.8 + phase) * 0.15;
    // Stripe pulse
    char.userData.stripe.material.emissiveIntensity = 0.3 + Math.sin(t * 3 + phase) * 0.4;
  });

  // Outfit/face swaps
  swapSchedule.forEach((s, i) => {
    if (t >= s.at && !swapDone.has(i)) {
      swapDone.add(i);
      applyOutfitChange(characters[s.char], s.outfit, s.face);
    }
  });

  // Rings rotation
  rings.forEach((ring, i) => {
    ring.rotation.z = t * (0.5 + i * 0.3);
    ring.position.y = 0.1 + i * 0.1 + Math.sin(t * 1.5 + i) * 0.15;
    ring.material.emissiveIntensity = 1.2 + Math.sin(t * 3 + i) * 0.8;
  });

  // Particles update
  const pos = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    pos[i*3] += particleVel[i].x;
    pos[i*3+1] += particleVel[i].y;
    pos[i*3+2] += particleVel[i].z;
    if (pos[i*3+1] > 15) {
      pos[i*3+1] = 0;
      pos[i*3] = (Math.random() - 0.5) * 40;
      pos[i*3+2] = (Math.random() - 0.5) * 40;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;

  // Lighting dynamics
  rimLight.intensity = 2.0 + Math.sin(t * 2.5) * 1.0;
  fillLight.intensity = 1.5 + Math.cos(t * 2) * 1.0;
  rimLight.position.x = Math.cos(t * 0.8) * 10;
  rimLight.position.z = Math.sin(t * 0.8) * 10;
  fillLight.position.x = Math.cos(t * 0.8 + Math.PI) * 10;
  fillLight.position.z = Math.sin(t * 0.8 + Math.PI) * 10;

  // Fade out end
  if (t > CLIP_DURATION - 2) {
    const fade = (t - (CLIP_DURATION - 2)) / 2;
    scene.fog.density = 0.045 + fade * 0.5;
    if (audioCtx && music) music.master.gain.value = Math.max(0, 0.35 * (1 - fade));
    if (audioCtx && voice) voice.master.gain.value = Math.max(0, 0.2 * (1 - fade));
  }

  renderer.render(scene, camera);

  if (t < CLIP_DURATION) {
    setImmediate(animate);
  } else {
    // Export final frame
    const dataURL = renderer.domElement.toDataURL('image/png');
    if (dataURL && typeof dataURL === 'string' && !dataURL.includes('undefined')) {
      fs.writeFileSync('frame_final.png', Buffer.from(dataURL.split(',')[1], 'base64'));
    }
    console.log('Animation complete: ' + CLIP_DURATION + 's');
    process.exit(0);
  }
}

// Setup renderer canvas for headless
const canvas = { width: 1920, height: 1080 };
if (typeof document === 'undefined') {
  // headless — render via buffer
  try {
    const { createCanvas } = require('canvas');
    const cnv = createCanvas(1920, 1080);
    renderer = new THREE.WebGLRenderer({ canvas: cnv, antialias: true });
    renderer.setSize(1920, 1080);
    renderer.shadowMap.enabled = true;
  } catch (e) {
    console.log('Using standard renderer (run in browser with bundler)');
  }
}

console.log('Starting ZackDFilms 3D macro animation: ' + CLIP_DURATION + 's');
animate();
```