import { startStarsCredits } from './credits.js';
import { initTimeline, startGenesisTimeline } from './history/timeline.js';
import { initGame, startEmojiGame } from './game/game.js';
import { get, setStatus, setPrimaryButton, setSecondaryButton, showCenterTitle } from './ui.js';

const state = {
  mode: 'intro' 
};

function setMode(mode) {
  state.mode = mode;

  if (mode === 'intro') {
    setStatus('BABLO WEB4 WORLD · GENESIS READY. Нажми START GENESIS.');
    setPrimaryButton('START GENESIS', true, false);
    setSecondaryButton('SPAWN BABLO', false, true);
    showCenterTitle('BABLO WEB4 WORLD · GENESIS', 1500);
  }

  if (mode === 'cosmos') {
    setStatus('GENESIS: 13.8 млрд лет истории...');
    setPrimaryButton('GENESIS RUNNING…', true, true);
    setSecondaryButton('SPAWN BABLO', false, true);
  }

  if (mode === 'game') {
    setStatus('BABLINOVKA CORE активирован.');
    setPrimaryButton('ENTER BABLO', false, true);
    setSecondaryButton('SPAWN BABLO', true, false);
    showCenterTitle('BABLINOVKA CORE · 9 МАРТА 2026', 2500);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = get('scene');
  if (!canvas) return;

  // 1. Инициализация игры
  await initGame(canvas);

  // 2. Инициализация таймлайна с колбэком завершения
  initTimeline(canvas, () => {
    setMode('game');
    startEmojiGame();
  });

  const primary = get('primary-btn');
  const secondary = get('secondary-btn');

  if (primary) {
    primary.onclick = () => {
      if (state.mode === 'intro') {
        setMode('cosmos');
        startGenesisTimeline();        
        startStarsCredits(); 
      }
    };
  }

  if (secondary) {
    secondary.onclick = () => {
      if (state.mode === 'game') {
        startEmojiGame(true);
      }
    };
  }

  setMode('intro');
});

const creditsContainer = document.getElementById('credits-layer');

function showCreditLine(text) {
  const line = document.createElement('div');
  line.className = 'credit-line';
  
  const textNode = document.createElement('span');
  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  
  line.appendChild(textNode);
  line.appendChild(cursor);
  creditsContainer.appendChild(line);

  // 1. Раздвигаем интервал
  requestAnimationFrame(() => {
    line.classList.add('active');
  });

  // 2. Печатаем текст
  let i = 0;
  const typingSpeed = 40; // мс на символ

  function type() {
    if (i < text.length) {
      textNode.textContent += text.charAt(i);
      i++;
      setTimeout(type, typingSpeed);
    } else {
      // Плавное исчезновение курсора после печати
      cursor.style.transition = 'opacity 0.5s';
      cursor.style.opacity = '0';
      setTimeout(() => cursor.remove(), 500);
    }
  }

  // Начинаем печать чуть позже начала раздвигания
  setTimeout(type, 200);
}
