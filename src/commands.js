import { togglePressed } from './utils.js';

export class CommandRegistry {
  constructor(selectionManager, syncCallback) {
    this.selectionManager = selectionManager;
    this.syncCallback = syncCallback;
    this.buttons = new Map();
    this.registerDefaults();
  }

  registerButton(name, button) {
    this.buttons.set(name, button);
  }

  registerDefaults() {
    this.commands = {
      bold: { exec: () => document.execCommand('bold'), state: () => document.queryCommandState('bold') },
      italic: { exec: () => document.execCommand('italic'), state: () => document.queryCommandState('italic') },
      underline: { exec: () => document.execCommand('underline'), state: () => document.queryCommandState('underline') },
      strikeThrough: { exec: () => document.execCommand('strikeThrough'), state: () => document.queryCommandState('strikeThrough') },
      paragraph: { exec: () => document.execCommand('formatBlock', false, 'p') },
      h1: { exec: () => document.execCommand('formatBlock', false, 'h1') },
      h2: { exec: () => document.execCommand('formatBlock', false, 'h2') },
      h3: { exec: () => document.execCommand('formatBlock', false, 'h3') },
      blockquote: { exec: () => document.execCommand('formatBlock', false, 'blockquote') },
      unorderedList: { exec: () => document.execCommand('insertUnorderedList'), state: () => document.queryCommandState('insertUnorderedList') },
      orderedList: { exec: () => document.execCommand('insertOrderedList'), state: () => document.queryCommandState('insertOrderedList') },
      link: {
        exec: () => {
          const url = window.prompt('Enter URL');
          if (url) document.execCommand('createLink', false, url);
        },
        state: () => document.queryCommandState('createLink')
      },
      unlink: { exec: () => document.execCommand('unlink') },
      hr: { exec: () => document.execCommand('insertHorizontalRule') },
      clear: { exec: () => document.execCommand('removeFormat') },
      undo: { exec: () => document.execCommand('undo') },
      redo: { exec: () => document.execCommand('redo') }
    };
  }

  exec(name) {
    const cmd = this.commands[name];
    if (!cmd) return;
    this.selectionManager.restore();
    cmd.exec();
    if (this.syncCallback) this.syncCallback();
    this.updateStates();
  }

  updateStates() {
    this.buttons.forEach((btn, name) => {
      const cmd = this.commands[name];
      if (!cmd || !cmd.state) return;
      togglePressed(btn, !!cmd.state());
    });
  }
}
