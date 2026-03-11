// src/game/world.js
import { get } from '../ui.js';

export const MAP_W = 32;
export const MAP_H = 32;
let heightMap = [];
let ctxRef = null;

export function initWorld(canvas) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctxRef = ctx;

  generateHeightMap();

  window.addEventListener('resize', () => {
    const d = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * d;
    canvas.height = canvas.clientHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  });
}

export function ctx() {
  return ctxRef;
}

function generateHeightMap() {
  heightMap = [];
  for (let y = 0; y < MAP_H; y++) {
    const row = [];
    for (let x = 0; x < MAP_W; x++) {
      const cx = (x - MAP_W / 2) / (MAP_W / 2);
      const cy = (y - MAP_H / 2) / (MAP_H / 2);
      const r2 = cx * cx + cy * cy;
      const base = Math.max(0, 1 - r2);
      const noise =
        (Math.sin(x * 0.7) + Math.sin(y * 0.9) + Math.sin((x + y) * 0.5)) * 1.5;
      row.push(base * 12 + noise);
    }
    heightMap.push(row);
  }
}

export function getHeightAt(gx, gy) {
  const ix = Math.floor(gx);
  const iy = Math.floor(gy);
  if (ix < 0 || iy < 0 || ix >= MAP_W || iy >= MAP_H) return 0;
  return heightMap[iy][ix] || 0;
}

export function isoToScreen(gx, gy, h = 0) {
  const canvas = get('scene');
  const w = canvas.clientWidth;
  const hgt = canvas.clientHeight;
  const tileW = 32;
  const tileH = 18;

  const cx = w / 2;
  const cy = hgt * 0.7;

  const sx = (gx - gy) * (tileW / 2);
  const sy = (gx + gy) * (tileH / 2) - h * 2;

  return { x: cx + sx, y: cy + sy };
}
