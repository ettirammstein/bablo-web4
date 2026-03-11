// src/history/timeline.js
import { cosmos, HISTORY_EVENTS } from './historyData.js';
import { get, addLog, setStatus, setSmallStatus, setTimelineTitle, setTimelineYear, shortenTitle } from '../ui.js';
import { startGameLoop, startEmojiGame } from '../game/game.js';

const state = {
  t: 0,
  target: -13800000000,
  year: -13800000000,
  cosmosIndex: 0
};

let lastEventTime = performance.now();

export function initTimeline() {
  const canvas = get('cosmos-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function render() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const grd = ctx.createRadialGradient(w * 0.3, h * 0.2, 10, w * 0.5, h * 0.5, Math.max(w, h));
    grd.addColorStop(0, '#1af7b4');
    grd.addColorStop(0.2, '#0a172f');
    grd.addColorStop(1, '#01020a');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(200,220,255,0.5)';
    for (let i = 0; i < 60; i++) {
      const x = (i * 73 + state.t * 0.03) % w;
      const y = (i * 41) % h;
      const r = (i % 3) * 0.7 + 0.4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const phase = cosmos[state.cosmosIndex] || cosmos[cosmos.length - 1];
    ctx.save();
    ctx.translate(w * 0.5, h * 0.55);
    const R = Math.min(w, h) * 0.23;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);

    let fill = '#0b2a3a';
    if (phase.cls === 'stage-void') fill = '#050814';
    else if (phase.cls === 'stage-lava') fill = '#ff7a2a';
    else if (phase.cls === 'stage-water') fill = '#1eaad9';
    else if (phase.cls === 'stage-life') fill = '#24e78b';
    else if (phase.cls === 'stage-core') fill = '#52ffba';
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, R + 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    requestAnimationFrame(render);
  }

  render();
}

export function startGenesis() {
  setStatus('GENESIS: от Большого взрыва до BABLINOVKA CORE…');
  setSmallStatus('Вселенная разворачивается, ждём 2026 года…');

  for (const ev of HISTORY_EVENTS) ev.done = false;
  lastEventTime = performance.now();

  const totalCosmosDuration = 60000;
  const cosmosTimer = setInterval(() => {
    state.t += 300;
    const progress = Math.min(state.t / totalCosmosDuration, 1);

    const idx = Math.floor(progress * (cosmos.length - 1));
    state.cosmosIndex = idx;

    const cosmosPhase = cosmos[idx];
    setTimelineYear(cosmosPhase.yr);
    setTimelineTitle(cosmosPhase.title);

    if (progress >= 1) {
      clearInterval(cosmosTimer);
      runHumanTimeline();
    }
  }, 100);

  startGameLoop();
}

function runHumanTimeline() {
  let yr = -10000;
  state.year = yr;
  state.target = yr;
  lastEventTime = performance.now();

  const timer = setInterval(() => {
    let step;
    if (yr < 0) step = 500000;
    else if (yr < 1000) step = 50;
    else if (yr < 1900) step = 10;
    else if (yr < 2000) step = 2;
    else if (yr < 2025) step = 0.5;
    else step = 0.05;

    yr += step;
    state.target = yr;
    state.year = yr;

    setTimelineYear(yr);

    const fill = get('progress-fill');
    if (fill) {
      const width = Math.min(yr, 2026) / 2026 * 100;
      fill.style.width = width + '%';
    }

    const now = performance.now();
    const minInterval = 3500;

    const ev = findClosestEvent(yr);
    if (ev && !ev.done && now - lastEventTime > minInterval) {
      ev.done = true;
      lastEventTime = now;
      addLog(ev.year, ev.txt);
      setTimelineTitle(shortenTitle(ev.txt));
    }

    if (yr >= 2026.18) {
      clearInterval(timer);
      finalizeGenesis();
    }
  }, 100);
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
  state.year = 2026.18;
  state.target = 2026.18;
  setTimelineYear(2026);
  setTimelineTitle('PRESENT DAY: BABLINOVKA CORE');

  const planet = get('main-planet');
  if (planet) {
    planet.style.boxShadow = '0 0 120px #0f0, inset 0 0 60px #0f0';
  }

  setStatus('BABLINOVKA CORE активирован. Можно запускать симуляцию BABLO WEB4 WORLD.');
  setSmallStatus('Готово. Нажми SPAWN BABLO, чтобы заселить мир…');

  startEmojiGame();
}
