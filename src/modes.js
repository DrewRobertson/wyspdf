import { serializeHTMLFromVisual } from './serializer.js';
import { setVisible } from './utils.js';

export class ModeManager {
  constructor(wysiwygView, sourceView, options = {}) {
    this.wysiwygView = wysiwygView;
    this.sourceView = sourceView;
    this.options = options;
    this.mode = 'visual';
  }

  setMode(mode) {
    if (mode === this.mode) return;
    if (mode === 'source') {
      const html = serializeHTMLFromVisual(this.wysiwygView);
      const formatted = this.formatHTML(html);
      this.sourceView.value = formatted;
      setVisible(this.wysiwygView, false);
      setVisible(this.sourceView, true);
    } else {
      const raw = this.sourceView.value;
      const sanitizer = this.options.sanitizeHTML || ((value) => value);
      this.wysiwygView.innerHTML = sanitizer(raw);
      setVisible(this.wysiwygView, true);
      setVisible(this.sourceView, false);
    }
    this.mode = mode;
    if (this.options.onModeChange) this.options.onModeChange(mode);
  }

  toggle() {
    this.setMode(this.mode === 'visual' ? 'source' : 'visual');
  }

  formatHTML(html) {
    try {
      if (window.Formatter && typeof window.Formatter.format === 'function') {
        return window.Formatter.format(html);
      }
    } catch (e) {
      return html;
    }
    return html;
  }
}
