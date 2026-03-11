import { HISTORY_EVENTS } from './historyData.js';

export function startStarsCredits() {
  const layer = document.getElementById('credits-layer');
  if (!layer) return;

  // Очищаем слой перед запуском
  layer.innerHTML = '';

  const inner = document.createElement('div');
  inner.id = 'credits-inner';
  layer.appendChild(inner);

  // Создаем строки событий
  HISTORY_EVENTS.forEach((ev, i) => {
    const line = document.createElement('div');
    // Добавляем класс 'core' последнему элементу для жирного шрифта Unbounded
    line.className = 'credit-line' + (i === HISTORY_EVENTS.length - 1 ? ' core' : '');
    
    const icon = ev.icon ? ev.icon + ' ' : '';
    const text = `${ev.year} · ${icon}${ev.txt}`;

    // Разбиваем текст на span для работы CSS-анимации @keyframes comet.forEach((ch, idx) => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch; // Обработка пробелов
      span.style.setProperty('--i', idx);
      
      // Подсветка "ядра" (первых 3 символов)
      if (idx < 3) span.classList.add('comet-head');
      
      line.appendChild(span);
    });

    inner.appendChild(line);
  });

  let start = null;
  const totalDuration = 50000; // 50 секунд на весь полет

  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const t = Math.min(elapsed / totalDuration, 1);

    // Плавное ускорение/замедление
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Движение: начинаем снизу (80vh) и улетаем вверх (-120vh)
    const y = 80 - (200 * ease); 
    // Уменьшение размера для эффекта удаления в даль
    const scale = 1.2 - (ease * 0.8); 

    inner.style.transform = `
      translateX(-50%)
      translateY(${y}vh)
      rotateX(25deg)
      scale(${scale})
    `;

    if (t < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}
