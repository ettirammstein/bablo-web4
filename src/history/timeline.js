// src/history/timeline.js
import { cosmos, HISTORY_EVENTS } from './historyData.js';
import { get, setStatus, shortenTitle } from '../ui.js';
import { startGameLoop, switchToCosmosMode } from '../game/game.js';

let genesisActive = false;
let progress = 0; // 0..1
let lastFrameTime = performance.now();

const CONFIG = {
    totalDuration: 45000, // 45 секунд на всю историю
    startDays: 5040600000000, // Примерно 13.8 млрд лет в днях
};

// Функция для "остывающей" печати текста
function addLogWithGlow(year, text) {
    const logList = get('log-list');
    if (!logList) return;

    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    
    const yearSpan = document.createElement('span');
    yearSpan.className = 'log-year';
    yearSpan.textContent = year > 0 ? `${Math.floor(year)} г.` : `${Math.abs(Math.floor(year))} лет до н.э. `;
    logItem.appendChild(yearSpan);

    const textContainer = document.createElement('span');
    logItem.appendChild(textContainer);

    // Печатаем буквы по одной с задержкой
    text.split('').forEach((char, i) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.className = 'char-glow';
        charSpan.style.animationDelay = `${i * 30}ms`;
        textContainer.appendChild(charSpan);
    });

    logList.prepend(logItem); // Новые события сверху
    if (logList.childNodes.length > 20) logList.lastChild.remove();
}

export function initTimeline(canvas, onFinish) {
    const ctx = canvas.getContext('2d');
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = (now) => {
        const dt = now - lastFrameTime;
        lastFrameTime = now;

        if (genesisActive) {
            update(dt);
        }
        requestAnimationFrame(render);
    };
    render(performance.now());
}

// Внутри функции update(dt) в timeline.js

function update(dt) {
  // 1. Прогресс (от 0 до 1)
  progress += dt / CONFIG.totalDuration;
  
  // Улетающая кнопка при старте
  if (progress > 0.01) {
    const btn = document.getElementById('hud-bottom');
    if (btn) btn.style.opacity = '0'; // Плавно гасим
    if (progress > 0.05) btn.style.display = 'none'; // Убираем совсем
  }

  const eased = 1 - Math.pow(1 - progress, 2); // Плавное замедление к концу
  
  // 2. Жидкость и Годы
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${eased * 100}%`;
  
  const currentYear = -13800000000 + (13800000000 + 2026) * eased;
  const days = Math.floor(Math.abs(currentYear) * 365);
  document.getElementById('days-counter').textContent = days.toLocaleString();

  // 3. Синхронизация событий
  HISTORY_EVENTS.forEach(ev => {
    if (!ev.done && currentYear >= ev.year) {
      ev.done = true;
      spawnStoryLine(ev.txt);
    }
  });

  // 4. Финал кино (всё исчезает)
  if (progress >= 0.99) {
    document.getElementById('hud-top').style.opacity = '0';
    document.getElementById('hud-top').style.transition = '2s';
    // Вызываем переход в игру
  }
}

function spawnStoryLine(text) {
  const container = document.getElementById('story-stream');
  const line = document.createElement('div');
  line.className = 'story-line';
  
  // "Печатаем" буквы со свечением
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'char-glow';
    span.style.animationDelay = `${i * 30}ms`;
    line.appendChild(span);
  });

  container.appendChild(line);
}


function checkEvents(currentYear) {
    HISTORY_EVENTS.forEach(ev => {
        if (!ev.done && currentYear >= ev.year) {
            ev.done = true;
            addLogWithGlow(ev.year, ev.txt);
            const titleEl = get('timeline-title');
            if (titleEl) titleEl.textContent = shortenTitle(ev.txt);
        }
    });
}

export function startGenesisTimeline() {
    genesisActive = true;
    progress = 0;
    const logList = get('log-list');
    if (logList) logList.innerHTML = ''; // Очистка при старте
    
    HISTORY_EVENTS.forEach(ev => ev.done = false);
    startGameLoop();
}