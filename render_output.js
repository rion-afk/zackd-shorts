const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FPS = 30;
const DURATION_SECONDS = 20;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;
const FRAMES_DIR = path.join(__dirname, 'frames_temp');

async function renderVideo() {
  console.log('Avvio rendering 3D da scene.html...');

  if (!fs.existsSync('scene.html')) {
    console.error('ERRORE: scene.html non trovato!');
    process.exit(1);
  }

  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--window-size=1080,1920'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  const fileUrl = 'file://' + path.resolve(__dirname, 'scene.html');
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });

  // Attende 1 secondo per inizializzare Three.js, luci e geometrie
  await new Promise(r => setTimeout(r, 1000));

  console.log(`Cattura di ${TOTAL_FRAMES} fotogrammi a ${FPS} FPS (1080x1920)...`);

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const currentTimeSec = i / FPS;

    await page.evaluate((t) => {
      if (typeof window.setSimulationTime === 'function') {
        window.setSimulationTime(t);
      }
    }, currentTimeSec);

    await new Promise(r => setTimeout(r, 16));

    const frameFile = path.join(FRAMES_DIR, `frame_${String(i).padStart(4, '0')}.jpg`);
    await page.screenshot({
      path: frameFile,
      type: 'jpeg',
      quality: 92
    });

    if (i % 60 === 0 || i === TOTAL_FRAMES - 1) {
      console.log(`Progresso rendering: ${i + 1}/${TOTAL_FRAMES} frame (${Math.round(((i + 1) / TOTAL_FRAMES) * 100)}%)`);
    }
  }

  await browser.close();
  console.log('Cattura frame completata! Creazione di video_finale.mp4 con FFmpeg...');

  const hasVoice = fs.existsSync('voice.mp3');
  const ffmpegCmd = hasVoice
    ? `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%04d.jpg" -i voice.mp3 -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 -c:a aac -b:a 192k -shortest video_finale.mp4`
    : `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%04d.jpg" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 video_finale.mp4`;

  execSync(ffmpegCmd, { stdio: 'inherit' });

  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('SUCCESSO! video_finale.mp4 generato correttamente!');
}

renderVideo().catch(err => {
  console.error('Errore durante il rendering:', err);
  process.exit(1);
});
