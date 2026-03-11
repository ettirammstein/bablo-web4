// src/main.js
import { initTimeline, startGenesis } from './history/timeline.js';
import { initGame } from './game/game.js';
import { get, setStatus, setSmallStatus } from './ui.js';

window.addEventListener('DOMContentLoaded', async () => {
  initTimeline();
  await initGame();

  const btn = get('startGenesisBtn');
  if (btn) {
    btn.onclick = () => {
      setStatus('Запуск GENESIS...');
      setSmallStatus('Прокрутка вселенной: 13.8 млрд лет до 2026…');
      startGenesis();
      btn.disabled = true;
      btn.textContent = 'RUNNING…';
    };
  }
});
