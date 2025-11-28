import { normalizeHTML } from './utils.js';

export function serializeHTMLFromVisual(viewEl) {
  return normalizeHTML(viewEl.innerHTML || '');
}
