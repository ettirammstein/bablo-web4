// src/game/entities.js
import { ctx, getHeightAt, isoToScreen, MAP_W, MAP_H } from './world.js';

export const entities = [];
export const vehicles = [];
export const particles = [];

const HEAD_EMOJIS = ['😎', '🤖', '🧠', '🧑‍💻'];
const CAR_EMOJI = '🚗';
const BIKE_EMOJI = '🚲';
const MONEY_EMOJI = '💸';

export class EmojiPerson {
  constructor(gx, gy) {
    this.id = Math.random();
    this.gx = gx;
    this.gy = gy;

    this.vx = (Math.random() - 0.5) * 0.05;
    this.vy = (Math.random() - 0.5) * 0.05;

    this.head = HEAD_EMOJIS[Math.floor(Math.random() * HEAD_EMOJIS.length)];

    this.mood = 0.5 + Math.random() * 0.5;
    this.energy = 0.5 + Math.random() * 0.5;
    this.wealth = Math.random() * 0.3;

    this.walkPhase = Math.random() * Math.PI * 2;
  }

  update(dt) {
    const speed = 0.02 + this.energy * 0.06;
    const len = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 1;
    this.gx += (this.vx / len) * speed * dt;
    this.gy += (this.vy / len) * speed * dt;

    if (this.gx < 2 || this.gx > MAP_W - 2) this.vx *= -1;
    if (this.gy < 2 || this.gy > MAP_H - 2) this.vy *= -1;

    this.walkPhase += dt * 0.008;

    this.energy -= 0.000002 * dt;
    this.energy = Math.max(0.1, Math.min(1, this.energy));

    this.mood += (Math.random() - 0.5) * 0.0005 * dt;
    this.mood = Math.max(0, Math.min(1, this.mood));
  }

  draw() {
    const c = ctx();
    if (!c) return;
    const h = getHeightAt(this.gx, this.gy);
    const { x, y } = isoToScreen(this.gx, this.gy, h);
    const bob = Math.sin(this.walkPhase) * 4;

    c.save();
    c.translate(x, y);

    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.beginPath();
    c.ellipse(0, 0, 11, 4, 0, Math.PI * 2);
    c.fill();

    const moodColor = this.mood > 0.7 ? '#34f58a' : this.mood > 0.4 ? '#e4c94f' : '#ff6a6a';
    c.fillStyle = moodColor;
    c.fillRect(-5, -32 + bob, 10, 24);

    c.font = '22px system-ui, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(this.head, 0, -48 + bob);

    if (this.wealth > 0.4) {
      c.font = '14px system-ui, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji';
      c.fillText(MONEY_EMOJI, 12, -40 + bob);
    }

    c.restore();
  }
}

export class Vehicle {
  constructor(gx, gy) {
    this.gx = gx;
    this.gy = gy;
    this.type = Math.random() < 0.5 ? 'car' : 'bike';
    this.speed = this.type === 'car' ? 0.09 : 0.06;
    this.dir = Math.random() < 0.5 ? -1 : 1;
  }

  update(dt) {
    this.gx += this.dir * this.speed * dt;
    if (this.gx < -2) this.gx = MAP_W + 2;
    if (this.gx > MAP_W + 2) this.gx = -2;
  }

  draw() {
    const c = ctx();
    if (!c) return;
    const h = getHeightAt(this.gx, this.gy);
    const { x, y } = isoToScreen(this.gx, this.gy, h);
    c.save();
    c.translate(x, y - 10);

    c.font = '26px system-ui, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const emoji = this.type === 'car' ? CAR_EMOJI : BIKE_EMOJI;
    c.fillText(emoji, 0, 0);

    c.restore();
  }
}

export class Particle {
  constructor(gx, gy) {
    const h = getHeightAt(gx, gy);
    const { x, y } = isoToScreen(gx, gy, h);
    this.sx = x;
    this.sy = y;
    this.z = 0;
    this.vz = 0.08 + Math.random() * 0.07;
    this.life = 1500;
  }

  update(dt) {
    this.z += this.vz * dt;
    this.vz -= 0.0001 * dt;
    this.life -= dt;
  }

  draw() {
    const c = ctx();
    if (!c) return;
    c.save();
    c.font = '20px system-ui, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(MONEY_EMOJI, this.sx, this.sy - this.z);
    c.restore();
  }
}

export function spawnPerson() {
  const gx = 2 + Math.random() * (MAP_W - 4);
  const gy = 2 + Math.random() * (MAP_H - 4);
  const p = new EmojiPerson(gx, gy);
  entities.push(p);

  if (Math.random() < 0.5) {
    const v = new Vehicle(gx + 1, gy);
    vehicles.push(v);
  }

  for (let i = 0; i < 4; i++) {
    particles.push(new Particle(gx, gy));
  }
}
