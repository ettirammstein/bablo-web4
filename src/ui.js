// src/ui.js

export function get(id) {
  return document.getElementById(id);
}

export function addLog(year, txt) {
  const list = get('log-list');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'log-item';

  const y = document.createElement('span');
  y.className = 'log-year';
  y.textContent = formatYear(year) + ':';

  const t = document.createElement('span');
  t.className = 'log-text';
  t.textContent = ' ' + txt;

  row.appendChild(y);
  row.appendChild(t);
  list.appendChild(row);
  list.scrollTop = list.scrollHeight;
}

export function setStatus(text) {
  const el = get('status-text');
  if (el) el.textContent = text;
}

export function setSmallStatus(text) {
  const el = get('small-status');
  if (el) el.textContent = text;
}

export function setTimelineYear(year) {
  const el = get('timeline-year');
  if (!el) return;
  el.textContent = formatYear(year);
}

export function setTimelineTitle(title) {
  const el = get('timeline-title');
  if (!el) return;
  el.textContent = title;
}

export function formatYear(y) {
  if (y < -1000000) {
    return '−' + (Math.abs(Math.round(y / 1000000))).toString() + ' млн';
  }
  if (y < 0) return '−' + Math.abs(Math.round(y)).toString();
  return Math.round(y).toString();
}

export function shortenTitle(txt) {
  if (txt.length <= 70) return txt;
  return txt.slice(0, 67) + '…';
}
