export class SelectionManager {
  constructor(editableEl) {
    this.editableEl = editableEl;
    this.lastRange = null;
  }

  save() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!this.editableEl.contains(range.commonAncestorContainer)) return;
    this.lastRange = range;
  }

  restore() {
    if (!this.lastRange) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(this.lastRange);
  }
}
