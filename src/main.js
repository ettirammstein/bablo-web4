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
    setPrimaryButton('ENTER BABLO', false, true);
    setSecondaryButton('SPAWN BABLO', true, false);
    showCenterTitle('BABLINOVKA CORE · 9 МАРТА 2026', 2500);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const canvas = get('scene');
  if (!canvas) return;

  await initGame(canvas);

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
