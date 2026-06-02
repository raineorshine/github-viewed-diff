# github-viewed-diff

A Chrome extension that toggles the **Viewed** button on GitHub pull request diffs with a keyboard shortcut.

## What it does

On a GitHub PR **Files changed** page:

- Press **`v`** to mark the next unviewed file as viewed.
- Press **`Shift`+`v`** to un-mark the last viewed file.

The shortcut is ignored while typing in an input, textarea, or other editable field.

## Install

```sh
npm install
npm run build
```

Load the `dist/` folder as an unpacked extension in `chrome://extensions`.

## Dev

```sh
npm run dev
```
