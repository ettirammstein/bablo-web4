// src/history/timeline.js
import { cosmos, HISTORY_EVENTS } from './historyData.js';
import {
  get,
  addLog,
  setStatus,
  setTimelineTitle,
  setTimelineYear,
  shortenTitle
} from '../ui.js';
import {
  startGameLoop,
  switchToCosmosMode,
  switchToGameMode
} from '../game/game.js';

let cosmosRunning = false;
let humanRunning = false;
let finishCallback = null;

const timelineState = {
  t: 0,
  cosmosIndex: 0,
  year: -13800000000,
  planetVisible: 0 // 0..1
};

let lastEventTime = performance.now();
let lastFrameTime = performance.now();

// Очередь титров
const captionQueue = [];

// Состояние центральных титров
const captionState = {
  fullText: '',
  visibleChars: 0,
  y: null,
  phase: 'idle', // 'typing' | 'scroll' | 'idle'
  holdTime: 2200,
  scrollSpeed: 22,
  _scrollStartedAt: 0
};

function enqueueCaption(text) {
  if (!text) return;
  captionQueue.push(text);
}

function startCaption(text) {
  captionState.fullText = text;
  captionState.visibleChars = 0;
  captionState.phase = 'typing';
  captionState.y = null;
}

function maybeStartNextCaption() {
  if (captionState.phase !== 'idle') return;
  const next = captionQueue.shift();
  if (next) startCaption(next);
}

function updateCaption(dt) {
  if (captionState.phase === 'idle' || !captionState.fullText) {
    // если титра нет, пробуем запускать следующий из очереди
    maybeStartNextCaption();
    return;
  }

  const charsPerSec = 18;
  if (captionState.phase === 'typing') {
    captionState.visibleChars += (charsPerSec * dt) / 1000;
    if (captionState.visibleChars >= captionState.fullText.length) {
      captionState.visibleChars = captionState.fullText.length;
      captionState.phase = 'scroll';
      captionState._scrollStartedAt = performance.now();
    }
  } else if (captionState.phase === 'scroll') {
    const t = performance.now() - captionState._scrollStartedAt;
    if (t > captionState.holdTime) {
      const dy = (captionState.scrollSpeed * dt) / 1000;
      captionState.y -= dy;
      if (captionState.y < -120) {
        captionState.phase = 'idle';
        captionState.fullText = '';
        // текущий титр ушёл — пробуем запустить следующий
        maybeStartNextCaption();
      }
    }
  }
}

function drawCaption(ctx, w, h) {
  if (captionState.phase === 'idle' || !captionState.fullText) return;

  const text = captionState.fullText.slice(
    0,
    Math.floor(captionState.visibleChars)
  );

  ctx.save();
  ctx.font =
    '18px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lineHeight = 22;
  const maxWidth = w * 0.7;

  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  let baseY = captionState.y;
  if (baseY == null) {
    baseY = h * 0.55;
    captionState.y = baseY;
  }

  const totalHeight = lines.length * lineHeight;
  const startY = baseY - totalHeight / 2;

  ctx.fillStyle = '#f5f7ff';
  lines.forEach((line, i) => {
    ctx.fillText(line, w * 0.5, startY + i * lineHeight);
  });

  ctx.restore();
}

export function initTimeline(canvas, onFinishGenesis) {
  finishCallback = onFinishGenesis;

  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  switchToCosmosMode();

  window.addEventListener('resize', resize);

  function render() {
    const now = performance.now();
    const dt = now - lastFrameTime;
    lastFrameTime = now;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    updateCaption(dt);
    drawCosmos(ctx, w, h, dt);
    drawCaption(ctx, w, h);

    requestAnimationFrame(render);
  }

  render();
}

export function startGenesisTimeline() {
  for (const ev of HISTORY_EVENTS) ev.done = false;
  timelineState.t = 0;
  timelineState.cosmosIndex = 0;
  lastEventTime = performance.now();

  cosmosRunning = true;
  humanRunning = false;

  // обнуляем очередь и состояние титров
  captionQueue.length = 0;
  captionState.fullText = '';
  captionState.phase = 'idle';
  captionState.visibleChars = 0;
  captionState.y = null;

  setTimelineYear(-13800000000);
  setTimelineTitle('БОЛЬШОЙ ВЗРЫВ');

  startGameLoop();
  enqueueCaption('Большой взрыв. Рождение Вселенной и физики.');
  timelineState.planetVisible = 0;
  startCosmosPhase();
}

function startCosmosPhase() {
  const totalCosmosDuration = 60000; // потом сузим
  const stepMs = 100;

  const timer = setInterval(() => {
    if (!cosmosRunning) {
      clearInterval(timer);
      return;
    }

    timelineState.t += 300;
    const progress = Math.min(timelineState.t / totalCosmosDuration, 1);
    const idx = Math.floor(progress * (cosmos.length - 1));
    timelineState.cosmosIndex = idx;

    const phase = cosmos[idx];
    setTimelineYear(phase.yr);
    setTimelineTitle(phase.title);

    // плавное появление планеты ближе к рождению Земли
    if (phase.yr >= -4600000000 && phase.yr <= -4300000000) {
      const span = -4300000000 + 4600000000; // 300 млн
      const done = Math.min(1, (phase.yr + 4600000000) / span);
      timelineState.planetVisible = done;
    } else if (phase.yr > -4300000000) {
      timelineState.planetVisible = 1;
    }

    // космические титры — в очередь
    if (progress > 0.15 && progress < 0.2) {
      enqueueCaption('Густой раскалённый туман превращается в первые звёзды.');
    }
    if (progress > 0.3 && progress < 0.35) {
      enqueueCaption('В спиралях галактик собираются облака газа и пыли.');
    }
    if (progress > 0.45 && progress < 0.5) {
      enqueueCaption('Протоземля. Океан магмы, бесконечные удары астероидов.');
    }
    if (progress > 0.6 && progress < 0.65) {
      enqueueCaption('Первые океаны. Вода покрывает поверхность планеты.');
    }
    if (progress > 0.75 && progress < 0.8) {
      enqueueCaption(
        'Химия становится биологией. Появляются первые формы жизни.'
      );
    }

    if (progress >= 1) {
      clearInterval(timer);
      cosmosRunning = false;
      startHumanTimeline();
    }
  }, stepMs);
}

function startHumanTimeline() {
  humanRunning = true;
  let yr = -10000000000;

  const timer = setInterval(() => {
    if (!humanRunning) {
      clearInterval(timer);
      return;
    }

    let step;
    if (yr < -5000000000) step = 500000000;
    else if (yr < -1000000000) step = 200000000;
    else if (yr < -100000000) step = 50000000;
    else if (yr < -10000) step = 100000;
    else if (yr < 0) step = 50;
    else if (yr < 1000) step = 50;
    else if (yr < 1900) step = 10;
    else if (yr < 2000) step = 1;
    else step = 0.05;

    yr += step;
    timelineState.year = yr;

    setTimelineYear(yr);

    const fill = get('progress-fill');
    if (fill) {
      const width = Math.min(yr, 2026.18) / 2026.18 * 100;
      fill.style.width = width + '%';
    }

    const now = performance.now();
    const minInterval = 1200;

    const ev = findClosestEvent(yr);
    if (ev && !ev.done && now - lastEventTime > minInterval) {
      ev.done = true;
      lastEventTime = now;
      addLog(ev.year, ev.txt);
      setTimelineTitle(shortenTitle(ev.txt));

      // вместо прямого старта — в очередь
      enqueueCaption(ev.txt);
    }

    if (yr >= 2026.18) {
      clearInterval(timer);
      humanRunning = false;
      finalizeGenesis();
    }
  }, 80);
}

function findClosestEvent(yr) {
  let best = null;
  let bestDist = Infinity;
  for (const ev of HISTORY_EVENTS) {
    if (ev.year > yr) continue;
    if (ev.done) continue;
    const dist = Math.abs(yr - ev.year);
    if (dist < bestDist) {
      bestDist = dist;
      best = ev;
    }
  }
  return best;
}

function finalizeGenesis() {
  setTimelineYear(2026.18);
  setTimelineTitle('9 МАРТА 2026 · BABLINOVKA CORE');

  setStatus(
    'GENESIS завершён. BABLINOVKA CORE активирован. Доступна кнопка BABLO.'
  );
  enqueueCaption('9 марта 2026 · BABLINOVKA CORE. Начало BABLO WEB4 WORLD.');

  switchToGameMode();

  if (typeof finishCallback === 'function') {
    finishCallback();
  }
}

function drawCosmos(ctx, w, h, dt) {
  // фон
  const grd = ctx.createRadialGradient(
    w * 0.5,
    h * 0.4,
    10,
    w * 0.5,
    h * 0.7,
    Math.max(w, h)
  );
  grd.addColorStop(0, '#0c264a');
  grd.addColorStop(0.4, '#050b20');
  grd.addColorStop(1, '#01020a');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Big Bang / частицы
  timelineState.t += dt;
  const tNorm = Math.min(timelineState.t / 8000, 1); // первые 8 сек — взрыв
  const flash = Math.max(0, 1 - tNorm * 1.2);

  if (flash > 0) {
    ctx.save();
    ctx.globalAlpha = flash * 0.8;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(w * 0.5, h * 0.4);
  const maxR = Math.max(w, h) * 0.8;

  for (let i = 0; i < 220; i++) {
    const angle = (i / 220) * Math.PI * 2;
    const base = (i % 40) / 40;
    const r = maxR * (tNorm * 0.9 * base);
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;

    const alpha =
      0.2 + 0.8 * (1 - tNorm) * (0.3 + 0.7 * Math.random());
    ctx.fillStyle = `rgba(230,240,255,${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.1 + (i % 3) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // обычные "галактические" точки
  ctx.fillStyle = 'rgba(210,230,255,0.3)';
  for (let i = 0; i < 80; i++) {
    const x = (i * 91 + timelineState.t * 0.04) % w;
    const y = (i * 53 + timelineState.t * 0.02) % h;
    const r = (i % 3) * 0.6 + 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // планета
  const phase =
    cosmos[timelineState.cosmosIndex] || cosmos[cosmos.length - 1];
  const cx = w * 0.5;
  const cy = h * 0.6;
  const R = Math.min(w, h) * 0.18;

  if (timelineState.planetVisible > 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = timelineState.planetVisible;

    let fill = '#0b2a3a';
    if (phase.cls === 'stage-void') fill = '#050814';
    else if (phase.cls === 'stage-lava') fill = '#ff7a2a';
    else if (phase.cls === 'stage-water') fill = '#1eaad9';
    else if (phase.cls === 'stage-life') fill = '#24e78b';
    else if (phase.cls === 'stage-core') fill = '#52ffba';

    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, R + 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
