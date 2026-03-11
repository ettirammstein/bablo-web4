// src/game/game.js
import { ctx, initWorld } from './world.js';
import { entities, vehicles, particles, spawnPerson } from './entities.js';
import { get } from '../ui.js';

let lastFrame = performance.now();
let running = false;

export async function initGame(canvas) {
  initWorld(canvas);
  running = true;
  lastFrame = performance.now();
  loop();
}

export function startGameLoop() {
  running = true;
}

export function startEmojiGame(extraSpawn = false) {
  if (!extraSpawn) {
    for (let i = 0; i < 5; i++) spawnPerson();
  } else {
    for (let i = 0; i < 2; i++) spawnPerson();
  }
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
  const canvas = get('scene');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  // фон сцены поверх космоса (легкий оттенок «земли/города» снизу)
  const g = c.createRadialGradient(w * 0.5, h * 0.9, 20, w * 0.5, h * 0.4, Math.max(w, h));
  g.addColorStop(0, 'rgba(3, 38, 27, 0.85)');
  g.addColorStop(1, 'rgba(2, 3, 11, 0.2)');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);

  for (const v of vehicles) v.draw();
  for (const e of entities) e.draw();
  for (const p of particles) p.draw();
}
