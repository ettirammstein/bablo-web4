// src/main.js
import { initTimeline, startGenesisTimeline } from './history/timeline.js';
import { initGame, startEmojiGame } from './game/game.js';
import { get, setStatus, setPrimaryButton, setSecondaryButton, showCenterTitle } from './ui.js';

const state = {
  mode: 'intro' // 'intro' | 'cosmos' | 'game'
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
    setStatus('GENESIS: 13.8 млрд лет истории. Смотрим от Большого Взрыва до 2026…');
    setPrimaryButton('GENESIS RUNNING…', true, true);
    setSecondaryButton('SPAWN BABLO', false, true);
  }

  if (mode === 'game') {
    setStatus('BABLINOVKA CORE активирован. Можно запускать BABLO WORLD.');
    setPrimaryButton('ENTER BABLO', false, true); // прячем главный, игра уже в мире
    setSecondaryButton('SPAWN BABLO', true, false);
    showCenterTitle('BABLINOVKA CORE · 9 МАРТА 2026', 2500);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = get('scene');
  if (!canvas) return;

  // init 2.5D «мир» (пока простой canvas‑рендер)
  await initGame(canvas);

  // init timeline+cosmos (он будет управлять годами и логами)
  initTimeline(canvas, () => {
    // callback, когда дошли до 9 марта 2026
    setMode('game');
    startEmojiGame();
  });

  // кнопки
  const primary = get('primary-btn');
  const secondary = get('secondary-btn');

  if (primary) {
    primary.onclick = () => {
      if (state.mode === 'intro') {
        setMode('cosmos');
        startGenesisTimeline();
      }
    };
  }

  if (secondary) {
    secondary.onclick = () => {
      if (state.mode === 'game') {
        // дополнительный спавн баблов
        startEmojiGame(true);
      }
    };
  }

  setMode('intro');
});
