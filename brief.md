# Build Brief / Prompt: Vanilla JavaScript WYSIWYG Editor

You are an expert front-end engineer. Your task is to implement a **TinyMCE-inspired WYSIWYG HTML editor** using **vanilla JavaScript only**, based on the following specification.

The resulting implementation must be fully usable in commercial products, with no licensing conflicts.

---

## 1. Product Summary

Build a **single-view WYSIWYG HTML editor** in vanilla JavaScript, heavily inspired by TinyMCE:

- Can be initialized on a **single `<div>` or `<textarea>`**.
- Has **two modes**:
  - **Visual mode** – rich text / WYSIWYG.
  - **Source mode** – HTML view, pretty-printed via an external formatter library.
- Users can edit in Visual mode via:
  - Direct typing and caret navigation.
  - Keyboard shortcuts (Ctrl/Cmd + B, etc.).
  - Toolbar buttons.

### Form / Data Requirement

The editor’s content must always be representable as a single form field value:

- Canonical data format (MVP): **HTML string**.
- This HTML must be kept in sync with an underlying form control (`<textarea>` or hidden field) so it can be:
  - Submitted with a standard HTML form, and/or
  - Read and JSON-encoded by client-side code before submission.

No frameworks, no bundlers. Just HTML/CSS/JS files that can be dropped into any static site.

---

## 2. Target UX

### 2.1 DOM Structure

When initialized, the editor should wrap the target element in something like:

```html
<div class="ve-wrapper">
  <div class="ve-toolbar" role="toolbar" aria-label="Editor toolbar">
    <!-- toolbar buttons, including HTML toggle -->
  </div>

  <div class="ve-body">
    <!-- Visual view -->
    <div class="ve-view ve-view-wysiwyg" contenteditable="true"></div>

    <!-- Source view -->
    <textarea class="ve-view ve-view-source" spellcheck="false"></textarea>
  </div>

  <div class="ve-statusbar">
    <span class="ve-char-count"></span>
  </div>
</div>
```

Key points:

- Only **one** of `.ve-view-wysiwyg` or `.ve-view-source` is visible at a time.
- The **HTML/source toggle button lives in the toolbar**, not the status bar.
- The only explicit mode indicator is the **HTML toggle button’s style** (e.g. “pressed” state or different icon in source mode).
- The original element:
  - `<textarea>` → becomes or backs the data source for form submission.
  - `<div>` → its `innerHTML` becomes initial content; a hidden backing field is created so forms can submit the current HTML.

### 2.2 Toolbar UX

Toolbar layout (TinyMCE-inspired):

- **Formatting**: Bold, Italic, Underline, Strikethrough.
- **Blocks**: Paragraph, H1, H2, H3, Blockquote.
- **Lists**: Bulleted, Numbered.
- **Insert**: Link, Horizontal rule.
- **Utilities**: Undo, Redo, Clear formatting, **Toggle HTML view**.

Behaviour:

- All controls are `<button type="button">` with clear `aria-label` and optional icons.
- Active/pressed state reflects current selection (e.g. bold, list, HTML mode toggle).
- Left/right arrow keys move between toolbar buttons.
- `Tab` moves focus out of the toolbar into the editor view.
- The HTML toggle button visually indicates the current mode (e.g. `aria-pressed="true"` in Source mode).

### 2.3 Modes

- **Visual mode (default)**:
  - Uses a `contenteditable` container.
  - All user typing and toolbar commands update the DOM.
  - The editor keeps the backing form value (hidden field or textarea) in sync as HTML.

- **Source mode**:
  - Uses a `<textarea>` showing **pretty-printed HTML**.
  - Editing here and toggling back to Visual:
    - Optionally runs a sanitizer (if configured).
    - Replaces the Visual view HTML with the (sanitized) textarea value.

Mode switch should best-effort **preserve caret/selection** in Visual mode:

- Track last selection range before switching.
- Restore it when returning from Source mode where possible.

---

## 3. Feature Set (MVP)

### 3.1 Core Editing Features

Implement the following editing capabilities:

- Inline formatting:
  - Bold
  - Italic
  - Underline
  - Strikethrough

- Block-level formatting:
  - Paragraph
  - H1
  - H2
  - H3
  - Blockquote

- Lists:
  - Unordered list
  - Ordered list

- Inserts:
  - Horizontal rule (`<hr>`)

- Links:
  - Insert new link for selected text (prompt for URL in MVP).
  - Edit URL if caret is inside an existing link.
  - Remove link (e.g. “unlink”).

- Clear formatting:
  - Strip inline formatting elements (b, strong, i, em, u, s, span style, etc.) from the selection, keeping text and block structure.

### 3.2 Keyboard Shortcuts

Implement the following shortcuts when focus is within the editor:

- `Ctrl/Cmd + B` → Bold.
- `Ctrl/Cmd + I` → Italic.
- `Ctrl/Cmd + U` → Underline.
- `Ctrl/Cmd + Z` → Undo.
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` → Redo.
- `Ctrl/Cmd + K` → Insert/edit link.

Use a central `keydown` handler on the editor wrapper and only act when the event target is part of the editor.

---

## 4. Public API (MVP)

Keep the public API small for v1; advanced event hooks and plugins are out of scope.

### 4.1 Initialization

Single entry point:

```js
const editor = new VanillaEditor(target, options);
```

Where `target` can be:

- A CSS selector **for a single element** (first match is used):
  - ID: `'#myTextarea'`
  - Class: `'.js-editor'`
  - Attribute: `'[data-editor="true"]'`
  - Tag name: `'textarea'` or `'div'`
- Or an `HTMLElement` reference to a single `<textarea>` or `<div>`.

If `target` resolves to multiple elements, MVP behaviour is:

- Use the **first matching element**.

`options` is **optional**. If omitted, default behaviour and layout are used.

Example:

```js
// Defaults-only initialization
const editor = new VanillaEditor('#content');

// With optional overrides
const editor2 = new VanillaEditor('#content', {
  mode: 'visual',  // 'visual' | 'source', default 'visual'
  toolbar: null,   // null = use default toolbar layout
  name: null       // null = infer from original element's name/id
});
```

Default behaviour:

- `mode`: `'visual'`.
- `toolbar`: built-in TinyMCE-style layout described above.
- `name`:
  - If original element has a `name`, use that.
  - Else, if it has an `id`, derive a name from that.
  - Else, auto-generate a unique name (e.g. `ve_field_1`).

### 4.2 Exposed Methods (MVP)

For MVP, expose only a minimal set:

- `editor.getHTML()` → returns the current HTML string from the editor.
- `editor.setHTML(html)` → replaces editor content in both modes.
- `editor.toggleSource()` → toggles between Visual and Source modes.
- `editor.destroy()` → tears down the editor and restores the original element and value.

Event hooks (`onChange`, `onModeChange`, etc.) and plugin registration are explicitly **out of scope for MVP** and will be added later.

---

## 5. Implementation Architecture

### 5.1 Modules / Responsibilities

Organize the code logically (separate files or IIFEs) as follows:

- **EditorCore**
  - Holds state: current mode, references to views, backing field, etc.
  - Exposes `getHTML`, `setHTML`, `toggleSource`, `destroy`.
  - Syncs content to the backing form element after changes.

- **Toolbar**
  - Renders buttons based on a config or default layout.
  - Binds button clicks to EditorCore commands.

- **ModeManager**
  - Switches between Visual and Source modes.
  - Visual → Source:
    - Reads DOM HTML.
    - Pretty-prints via a formatter library.
    - Populates the source `<textarea>`.
  - Source → Visual:
    - Reads source `<textarea>` value.
    - Optionally sanitizes.
    - Replaces Visual view `innerHTML`.

- **SelectionManager**
  - Tracks the current selection in Visual mode using `window.getSelection()` and `Range`.
  - Provides helpers to:
    - Get current range.
    - Save/restore range around mode switches and commands.

- **CommandRegistry**
  - Maps command names (`bold`, `italic`, `h1`, `ul`, `link`, etc.) to DOM-based implementations (no `execCommand`).

- **Serializer**
  - Provides `serializeHTMLFromVisual()` → HTML string.
  - Ensures consistent HTML used for:
    - The backing form field.
    - Source mode textarea.

- **Utils**
  - Shared helpers (class toggles, node type checks, etc.).

### 5.2 Command Strategy (No `execCommand`)

Do **not** use `document.execCommand`. Implement commands using DOM Ranges and nodes:

- Inline commands (bold, italic, underline, strikethrough):
  - Get current selection Range.
  - Wrap selected contents in semantic tags like `<strong>`, `<em>`, `<u>`, `<s>`.
  - If selection is fully inside that formatting, unwrap (toggle behaviour).

- Block commands (paragraph, headings, blockquote):
  - Normalize selection to entire block elements (`<p>`, `<div>`, etc.).
  - Replace those blocks with the corresponding tags (`<h1>`, `<h2>`, `<blockquote>`, etc.).
  - For paragraph, convert headings/blockquote back to `<p>`.

- Lists:
  - Identify current block(s).
  - Wrap them in `<ul><li>…</li></ul>` or `<ol><li>…</li></ol>`.
  - If they are already in a list of the same type, toggle off by unwrapping.

- Links:
  - If selection is not collapsed:
    - Wrap range in `<a href="…">`.
  - If collapsed inside an existing link:
    - Update that `<a>`'s `href`.
  - Unlink removes the `<a>` element but keeps its text.

- Clear formatting:
  - Walk nodes inside the selection and remove inline style-tag wrappers, preserving text and block structure.

This should be robust enough for standard rich-text editing while staying forward-compatible.

---

## 6. `<textarea>` vs `<div>` Behaviour and Form Submission

### 6.1 Initialized on `<textarea>`

- Use existing `textarea.value` as initial HTML content.
- Hide the original textarea (e.g. `display: none`) but keep it in the DOM.
- The editor's **backing field** is the original textarea:
  - After each meaningful change (key input, toolbar action, mode switch), update:

    ```js
    textarea.value = editor.serializeHTMLFromVisual();
    ```

- On `destroy()`:
  - Ensure final HTML is already in the textarea's `value`.
  - Remove the editor wrapper.
  - Show the original textarea again.

Form submissions will send `textarea.value` as before, now containing the editor-generated HTML.

### 6.2 Initialized on `<div>`

- Use the `<div>`'s `innerHTML` as initial HTML content.
- Replace the `<div>` in the DOM with the editor wrapper (keep a reference to restore later).
- Create a **hidden backing field** (textarea or hidden input) to store the HTML for forms, for example:

```html
<textarea name="content" class="ve-backfield" hidden></textarea>
```

- Name resolution for the backing field:
  - If the original `<div>` has `data-name`, use that.
  - Else, use `options.name` if provided.
  - Else, auto-generate a unique name.

- Sync logic:
  - After changes, update the backing field value with the latest HTML.
  - On `destroy()`:
    - Put final HTML back into the original `<div>`'s `innerHTML`.
    - Remove the editor wrapper and hidden backing field.
    - Restore the original `<div>`.

Result: Content originating in either a `<div>` or `<textarea>` always ends up with a form-postable field containing the HTML, which can be JSON-encoded or parsed as needed.

---

## 7. Source View & Pretty HTML (Off-the-Shelf Formatter)

The editor must use an **open-source HTML pretty-printing formatter** that:

- Is licensed for inclusion in commercial products (e.g. MIT, BSD, or Apache-style license).
- Does **not** require accreditation or attribution in the product UI.
- Can be bundled/distributed with the editor.
- Is browser-compatible without a build step (simple `<script>` include).

Implementation:

- Include the formatter as a standalone script, e.g. `/vendor/html-formatter.min.js`.
- The `ModeManager` will:
  - Call `Formatter.format(htmlString, options?)` when switching Visual → Source to obtain pretty-printed HTML.
  - Fallback: if the formatter is not loaded or throws an error, use the raw HTML string as-is.

This keeps the source view readable while avoiding writing a custom formatter.

---

## 8. Accessibility & Theming

### 8.1 Accessibility

Toolbar:

- `.ve-toolbar` uses `role="toolbar"`.
- Each button provides an `aria-label` describing its action (e.g. "Bold", "Toggle HTML view").
- Toggle buttons like Bold, Italic, List, and the HTML view use `aria-pressed="true|false"`.

Focus & Keyboard:

- All interactive elements should have a visible focus outline.
- Left/right arrow keys navigate between buttons in the toolbar.
- `Tab` moves focus from toolbar into the editing area (or next focusable element), not trapped.

Announcements (optional but desirable):

- Provide a hidden `aria-live="polite"` region that can be updated with messages such as:
  - "Switched to HTML mode".
  - "Switched to Visual mode".

### 8.2 Theming

- Ship with minimal, neutral CSS in `styles/editor.css` using `.ve-*` classes.
- Avoid high specificity; allow consumers to override styles easily.
- Key classes to style:
  - `.ve-wrapper`
  - `.ve-toolbar`
  - `.ve-view-wysiwyg`
  - `.ve-view-source`
  - `.ve-statusbar`
  - `.ve-char-count`

---

## 9. Repo Structure

Use the following project structure:

```text
/ (root)
  index.html              # demo page
  /dist                   # future: minified bundles
  /src
    editor-core.js        # EditorCore + public API
    toolbar.js            # Toolbar rendering / events
    modes.js              # ModeManager (visual/source switching)
    commands.js           # CommandRegistry (DOM-based commands)
    selection.js          # SelectionManager
    serializer.js         # serializeHTMLFromVisual()
    utils.js              # shared helpers
  /styles
    editor.css            # base styles
  /vendor
    html-formatter.min.js # 3rd-party HTML formatter (commercial-friendly license)
  README.md
  LICENSE
```

`index.html` should demonstrate:

- Editor attached to a `<textarea>` that posts its value via a standard form.
- Editor attached to a `<div>` with a hidden backing field used in form submission.
- A simple form submit handler that logs/prints the submitted HTML, so it is obvious what will be JSON-encoded or stored.

This completes the build brief for the MVP vanilla JavaScript WYSIWYG editor.

