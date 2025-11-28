import { createElement, togglePressed } from './utils.js';

export class Toolbar {
  constructor(commandRegistry, modeManager) {
    this.commandRegistry = commandRegistry;
    this.modeManager = modeManager;
    this.el = this.render();
  }

  render() {
    const toolbar = createElement('div', 've-toolbar', {
      role: 'toolbar',
      'aria-label': 'Editor toolbar'
    });

    const buttonConfigs = [
      { name: 'bold', label: 'Bold', icon: 'B' },
      { name: 'italic', label: 'Italic', icon: 'I' },
      { name: 'underline', label: 'Underline', icon: 'U' },
      { name: 'strikeThrough', label: 'Strikethrough', icon: 'S' },
      { name: 'paragraph', label: 'Paragraph', icon: 'P' },
      { name: 'h1', label: 'Heading 1', icon: 'H1' },
      { name: 'h2', label: 'Heading 2', icon: 'H2' },
      { name: 'h3', label: 'Heading 3', icon: 'H3' },
      { name: 'blockquote', label: 'Blockquote', icon: '❝' },
      { name: 'unorderedList', label: 'Bulleted list', icon: '•' },
      { name: 'orderedList', label: 'Numbered list', icon: '1.' },
      { name: 'link', label: 'Insert link', icon: '🔗' },
      { name: 'unlink', label: 'Remove link', icon: '⤺' },
      { name: 'hr', label: 'Horizontal rule', icon: '―' },
      { name: 'clear', label: 'Clear formatting', icon: '✖' },
      { name: 'undo', label: 'Undo', icon: '↺' },
      { name: 'redo', label: 'Redo', icon: '↻' }
    ];

    buttonConfigs.forEach((config) => {
      const btn = this.createButton(config);
      toolbar.appendChild(btn);
      this.commandRegistry.registerButton(config.name, btn);
    });

    const htmlToggle = this.createButton({
      name: 'toggle-html',
      label: 'Toggle HTML view',
      icon: '</>'
    });
    htmlToggle.dataset.toggleHtml = 'true';
    toolbar.appendChild(htmlToggle);
    this.htmlToggleButton = htmlToggle;

    toolbar.addEventListener('keydown', (e) => this.handleKeyNav(e));

    return toolbar;
  }

  createButton(config) {
    const btn = createElement('button', 've-btn', {
      type: 'button',
      'aria-label': config.label
    });
    btn.textContent = config.icon;
    btn.addEventListener('click', () => this.handleClick(config.name, btn));
    return btn;
  }

  handleClick(name, btn) {
    if (btn.dataset.toggleHtml) {
      const newMode = this.modeManager.mode === 'visual' ? 'source' : 'visual';
      togglePressed(btn, newMode === 'source');
      this.modeManager.toggle();
      return;
    }
    this.commandRegistry.exec(name);
  }

  handleKeyNav(e) {
    const buttons = Array.from(this.el.querySelectorAll('button'));
    const idx = buttons.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === 'ArrowRight') {
      const next = buttons[idx + 1] || buttons[0];
      next.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = buttons[idx - 1] || buttons[buttons.length - 1];
      prev.focus();
      e.preventDefault();
    }
  }

  updateModeToggle(mode) {
    togglePressed(this.htmlToggleButton, mode === 'source');
  }
}
