import { createElement, generateName, debounce } from './utils.js';
import { SelectionManager } from './selection.js';
import { CommandRegistry } from './commands.js';
import { ModeManager } from './modes.js';
import { Toolbar } from './toolbar.js';
import { serializeHTMLFromVisual } from './serializer.js';

export class VanillaEditor {
  constructor(target, options = {}) {
    this.options = options;
    this.originalEl = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.originalEl) throw new Error('Target element not found');
    this.isTextarea = this.originalEl.tagName.toLowerCase() === 'textarea';
    this.name = this.resolveName();
    this.setup();
  }

  resolveName() {
    if (this.originalEl.dataset && this.originalEl.dataset.name) return this.originalEl.dataset.name;
    if (this.options.name) return this.options.name;
    return this.originalEl.getAttribute('name') || generateName();
  }

  setup() {
    this.buildDOM();
    this.attachListeners();
    this.syncFromSource();
  }

  buildDOM() {
    const initialHTML = this.isTextarea ? this.originalEl.value : this.originalEl.innerHTML;

    this.wrapper = createElement('div', 've-wrapper');
    this.toolbarContainer = createElement('div', 've-toolbar-container');
    this.body = createElement('div', 've-body');
    this.status = createElement('div', 've-statusbar');
    this.charCount = createElement('span', 've-char-count');
    this.liveRegion = createElement('div', 've-live', { 'aria-live': 'polite', class: 've-visually-hidden' });

    this.wysiwygView = createElement('div', 've-view ve-view-wysiwyg', {
      contenteditable: 'true'
    });
    this.wysiwygView.innerHTML = initialHTML;
    this.sourceView = createElement('textarea', 've-view ve-view-source', { spellcheck: 'false' });
    setVisible(this.sourceView, false);

    this.body.appendChild(this.wysiwygView);
    this.body.appendChild(this.sourceView);
    this.status.appendChild(this.charCount);

    this.selectionManager = new SelectionManager(this.wysiwygView);
    this.modeManager = new ModeManager(this.wysiwygView, this.sourceView, {
      sanitizeHTML: this.options.sanitizeHTML,
      onModeChange: (mode) => this.handleModeChange(mode)
    });
    this.commandRegistry = new CommandRegistry(this.selectionManager, () => this.syncToField());
    this.toolbar = new Toolbar(this.commandRegistry, this.modeManager);
    this.toolbarContainer.appendChild(this.toolbar.el);

    this.wrapper.appendChild(this.toolbarContainer);
    this.wrapper.appendChild(this.body);
    this.wrapper.appendChild(this.status);
    this.wrapper.appendChild(this.liveRegion);

    if (this.isTextarea) {
      this.backingField = this.originalEl;
      this.originalEl.style.display = 'none';
      this.originalEl.insertAdjacentElement('afterend', this.wrapper);
    } else {
      this.backingField = createElement('textarea', 've-backfield', { name: this.name, hidden: true });
      this.backingField.value = initialHTML;
      this.originalEl.insertAdjacentElement('afterend', this.wrapper);
      this.wrapper.appendChild(this.backingField);
      this.originalPlaceholder = this.originalEl;
      this.originalEl.replaceWith(this.wrapper);
    }

    this.updateCharCount();
  }

  attachListeners() {
    this.inputHandler = debounce(() => {
      this.syncToField();
      this.updateCharCount();
    }, 150);

    this.wysiwygView.addEventListener('input', this.inputHandler);
    this.wysiwygView.addEventListener('keyup', () => this.commandRegistry.updateStates());
    this.wysiwygView.addEventListener('mouseup', () => this.commandRegistry.updateStates());
    this.wysiwygView.addEventListener('keyup', () => this.selectionManager.save());
    this.wysiwygView.addEventListener('mouseup', () => this.selectionManager.save());

    this.sourceView.addEventListener('input', this.inputHandler);

    this.wysiwygView.addEventListener('keydown', (e) => this.handleShortcuts(e));
  }

  handleShortcuts(e) {
    if (!e.ctrlKey && !e.metaKey) return;
    const key = e.key.toLowerCase();
    const map = {
      b: 'bold',
      i: 'italic',
      u: 'underline',
      z: e.shiftKey ? 'redo' : 'undo',
      y: 'redo'
    };
    const cmd = map[key];
    if (cmd) {
      e.preventDefault();
      this.commandRegistry.exec(cmd);
    }
  }

  handleModeChange(mode) {
    this.toolbar.updateModeToggle(mode);
    this.liveRegion.textContent = mode === 'source' ? 'Switched to HTML mode' : 'Switched to Visual mode';
    if (mode === 'visual') {
      this.selectionManager.restore();
      this.updateCharCount();
      this.syncToField();
    } else {
      this.selectionManager.save();
    }
  }

  syncToField() {
    const html = this.modeManager.mode === 'source'
      ? this.sourceView.value
      : serializeHTMLFromVisual(this.wysiwygView);
    this.backingField.value = html;
    this.commandRegistry.updateStates();
  }

  syncFromSource() {
    const html = this.isTextarea ? this.originalEl.value : this.originalEl.innerHTML;
    this.wysiwygView.innerHTML = html;
    this.sourceView.value = html;
    if (this.backingField) this.backingField.value = html;
  }

  updateCharCount() {
    const text = this.modeManager.mode === 'source'
      ? this.sourceView.value
      : this.wysiwygView.textContent || '';
    this.charCount.textContent = `${text.length} characters`;
  }

  destroy() {
    this.syncToField();
    if (this.isTextarea) {
      this.originalEl.style.display = '';
      this.wrapper.replaceWith(this.originalEl);
    } else if (this.originalPlaceholder) {
      this.originalPlaceholder.innerHTML = this.wysiwygView.innerHTML;
      this.wrapper.replaceWith(this.originalPlaceholder);
      this.backingField.remove();
    }
  }
}

if (typeof window !== 'undefined') {
  window.VanillaEditor = VanillaEditor;
}
