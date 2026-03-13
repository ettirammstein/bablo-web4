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

function update(dt) {
    progress += dt / CONFIG.totalDuration;
    if (progress >= 1) {
        progress = 1;
        genesisActive = false;
        // Здесь можно вызвать finalizeGenesis()
    }

    // Нелинейное замедление: в начале летит, в конце ползет
    const eased = 1 - Math.pow(1 - progress, 3); 
    
    // 1. Обновляем счетчик дней (Одометр)
    const currentDays = Math.floor(CONFIG.startDays * (1 - eased));
    const daysEl = get('days-counter');
    if (daysEl) daysEl.textContent = currentDays.toLocaleString('ru-RU');

    // 2. Обновляем прогресс-бар (Жидкость)
    const fill = get('progress-fill');
    if (fill) fill.style.width = `${eased * 100}%`;

    // 3. Проверка событий истории
    const currentYear = -13800000000 + (13800000000 + 2026) * eased;
    checkEvents(currentYear);
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