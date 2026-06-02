# github-viewed-diff

A Chrome extension that toggles the **Viewed** button on GitHub pull request diffs with a keyboard shortcut.

## What it does

On a GitHub PR **Files changed** page:

- Press **`v`** to mark the next unviewed file as viewed.
- Press **`Shift`+`v`** to un-mark the last viewed file.

The shortcut is ignored while typing in an input, textarea, or other editable field.

## Local Development

```sh
npm run dev
```

Load the `dist/` folder as an unpacked extension in `chrome://extensions`. Do not run `npm run build` or it will overwrite the dev manifest.

## Build & Release

This _will_ overwrite the `dist/` manifest, so you'll need to restart the dev server after building.

```sh
npm run build
```
