// src/history/timeline.js
import { cosmos, HISTORY_EVENTS } from './historyData.js';
import { get, addLog, setStatus, setTimelineTitle, setTimelineYear, shortenTitle, showCenterTitle } from '../ui.js';
import { startGameLoop, switchToCosmosMode, switchToGameMode } from '../game/game.js';

let cosmosRunning = false;
let humanRunning = false;
let finishCallback = null;

const timelineState = {
  t: 0,
  cosmosIndex: 0,
  year: -13800000000
};

let lastEventTime = performance.now();

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
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    drawCosmos(ctx, w, h);

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

  setTimelineYear(-13800000000);
  setTimelineTitle('БОЛЬШОЙ ВЗРЫВ');

  startGameLoop();
  runCosmosPhase();
}

function runCosmosPhase() {
  const totalCosmosDuration = 60000;
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

    if (progress === 0) {
      showCenterTitle('BIG BANG', 1500);
    }
    if (progress > 0.2 && progress < 0.25) {
      showCenterTitle('РАСКАЛЁННАЯ ЗЕМЛЯ', 1500);
    }
    if (progress > 0.4 && progress < 0.45) {
      showCenterTitle('ПЕРВЫЕ ОКЕАНЫ', 1500);
    }
    if (progress > 0.6 && progress < 0.65) {
      showCenterTitle('ЖИЗНЬ', 1500);
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
    else if (yr < 0) step = 5000;
    else if (yr < 1000) step = 50;
    else if (yr < 1900) step = 10;
    else if (yr < 2000) step = 2;
    else if (yr < 2020) step = 0.5;
    else if (yr < 2025) step = 0.25;
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

      if (ev.year === -10000) showCenterTitle('НЕОЛИТ', 1500);
      if (ev.year === 1450) showCenterTitle('ПЕЧАТНЫЙ СТАНОК', 1500);
      if (ev.year === 1914) showCenterTitle('МИРОВЫЕ ВОЙНЫ', 1500);
      if (ev.year === 1969) showCenterTitle('ЛУНА', 1500);
      if (Math.floor(ev.year) === 2000) showCenterTitle('ЦИФРОВАЯ ЭРА', 1500);
      if (Math.floor(ev.year) === 2020) showCenterTitle('ГЛОБАЛЬНЫЙ RESET', 1500);
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

  setStatus('GENESIS завершён. BABLINOVKA CORE активирован. Доступна кнопка BABLO.');
  showCenterTitle('BABLINOVKA CORE · GENESIS COMPLETE', 2500);

  switchToGameMode();

  if (typeof finishCallback === 'function') {
    finishCallback();
  }
}

function drawCosmos(ctx, w, h) {
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

  ctx.fillStyle = 'rgba(210,230,255,0.6)';
  for (let i = 0; i < 80; i++) {
    const x = (i * 91 + timelineState.t * 0.02) % w;
    const y = (i * 53) % h;
    const r = (i % 3) * 0.6 + 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const phase = cosmos[timelineState.cosmosIndex] || cosmos[cosmos.length - 1];
  const cx = w * 0.5;
  const cy = h * 0.6;
  const R = Math.min(w, h) * 0.18;

  ctx.save();
  ctx.translate(cx, cy);

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
