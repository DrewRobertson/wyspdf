# VanillaEditor

A TinyMCE-inspired, dependency-free WYSIWYG HTML editor built with vanilla JavaScript.

## Features
- Visual (contenteditable) and Source (textarea) modes with toolbar toggle.
- Inline formatting, block styles, lists, links, horizontal rules, undo/redo, and clear formatting commands.
- Keyboard shortcuts (Ctrl/Cmd+B/I/U, undo/redo).
- Pretty-printed source view via bundled formatter fallback.
- Works with textarea or div targets; keeps backing form field synchronized.
- Character count and accessible toolbar semantics.

## Usage
Open `index.html` in a modern browser. Two demo instances are provided: one backed by a `<textarea>` and another by a `<div>` with an auto-created hidden field. Submitting the sample form logs the posted HTML values.
