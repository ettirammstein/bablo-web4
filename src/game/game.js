// src/game/game.js
import { ctx, initWorld } from './world.js';
import { entities, vehicles, particles, spawnPerson, EmojiPerson } from './entities.js';
import { get } from '../ui.js';

let lastFrame = performance.now();
let running = false;
let mode = 'cosmos'; // 'cosmos' | 'game'
let player = null;

export async function initGame(canvas) {
  initWorld(canvas);
  running = true;
  lastFrame = performance.now();
  loop();

  // слушаем клавиши для управления «кнопкой BABLO»
  window.addEventListener('keydown', onKeyDown);
}

export function startGameLoop() {
  running = true;
}

export function switchToCosmosMode() {
  mode = 'cosmos';
}

export function switchToGameMode() {
  mode = 'game';

  // создаём «кнопку BABLO» как управляемого персонажа в центре
  const centerX = 16;
  const centerY = 16;
  player = new EmojiPerson(centerX, centerY);
  player.isPlayer = true;
  player.mood = 0.8;
  player.energy = 1.0;
  player.wealth = 1.0;
  entities.push(player);

  // немного жителей вокруг
  for (let i = 0; i < 6; i++) spawnPerson();
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
  if (mode === 'game') {
    for (const e of entities) e.update(dt);
    for (const v of vehicles) v.update(dt);
    for (const p of particles) p.update(dt);

    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
  }
}

function render() {
  const c = ctx();
  if (!c) return;
  const canvas = get('scene');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  if (mode === 'cosmos') {
    // ничего не делаем: космос и планета рисуются в timeline.js
    return;
  }

  // режим game: рисуем 2.5D‑город/землю поверх фона
  const g = c.createRadialGradient(w * 0.5, h * 0.9, 20, w * 0.5, h * 0.4, Math.max(w, h));
  g.addColorStop(0, 'rgba(3, 38, 27, 0.95)');
  g.addColorStop(1, 'rgba(2, 3, 11, 0.4)');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);

  for (const v of vehicles) v.draw();
  for (const e of entities) e.draw();
  for (const p of particles) p.draw();

  // визуальный акцент на «кнопке BABLO»
  if (player) {
    c.save();
    c.globalAlpha = 0.35;
    c.fillStyle = '#26f0a8';
    const cx = w / 2;
    const cy = h * 0.75;
    c.beginPath();
    c.arc(cx, cy, 64, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
}

function onKeyDown(e) {
  if (!player || mode !== 'game') return;

  const speed = 0.12;

  if (e.key === 'ArrowUp' || e.key === 'w') {
    player.gy -= speed;
  } else if (e.key === 'ArrowDown' || e.key === 's') {
    player.gy += speed;
  } else if (e.key === 'ArrowLeft' || e.key === 'a') {
    player.gx -= speed;
  } else if (e.key === 'ArrowRight' || e.key === 'd') {
    player.gx += speed;
  }
}
