// src/game/game.js
import { get, setStatus, setSmallStatus } from '../ui.js';
import { initWorld, ctx } from './world.js';
import { entities, vehicles, particles, spawnPerson } from './entities.js';

let lastFrame = performance.now();
let running = false;

export async function initGame() {
  const canvas = get('world');
  if (!canvas) return;

  initWorld(canvas);
  setSmallStatus('Мир загружен. GENESIS готов.');

  const spawnBtn = get('spawnBtn');
  if (spawnBtn) {
    spawnBtn.onclick = () => spawnPerson();
  }

  running = true;
  lastFrame = performance.now();
  loop();

  window.BABLINOVKA_GAME = {
    start: () => { running = true; },
    spawnPerson
  };
}

export function startGameLoop() {
  running = true;
}

export function startEmojiGame() {
  setStatus('BABLO WORLD: заселяем BABLINOVKA…');
  for (let i = 0; i < 5; i++) spawnPerson();
}

function loop() {
  const now = performance.now();
  const dt = now - lastFrame;
  lastFrame = now;

  if (running) {
    update(dt);
    render();
  }

  requestAnimationFrame(loop);
}

function update(dt) {
  for (const e of entities) e.update(dt);
  for (const v of vehicles) v.update(dt);
  for (const p of particles) p.update(dt);

  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
}

function render() {
  const c = ctx();
  if (!c) return;
  const canvas = get('world');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  c.clearRect(0, 0, w, h);

  const g = c.createRadialGradient(w * 0.5, h * 0.8, 20, w * 0.5, h * 0.4, Math.max(w, h));
  g.addColorStop(0, '#03261b');
  g.addColorStop(1, '#02030b');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);

  for (const v of vehicles) v.draw();
  for (const e of entities) e.draw();
  for (const p of particles) p.draw();
}
