export function createElement(tag, className, attrs = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'text') {
      el.textContent = value;
    } else if (key === 'html') {
      el.innerHTML = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  return el;
}

export function setVisible(el, visible) {
  el.style.display = visible ? '' : 'none';
}

export function togglePressed(button, pressed) {
  button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  button.classList.toggle('is-active', !!pressed);
}

let nameCounter = 0;
export function generateName(prefix = 've-field') {
  nameCounter += 1;
  return `${prefix}-${nameCounter}`;
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function normalizeHTML(html = '') {
  return html.replace(/\s+$/, '');
}

export function stripTags(text) {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || '';
}
