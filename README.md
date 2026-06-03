# github-viewed-diff

A Chrome extension that toggles the **Viewed** button on GitHub pull request diffs with a keyboard shortcut.

## What it does

On a GitHub PR **Files changed** page:

| Shortcut          | Action                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| `v`               | Mark the first unviewed file in the viewport as viewed, then scroll it to the top.                       |
| `Shift`+`v`       | Un-mark the first viewed file in the viewport.                                                           |
| `n`               | Scroll the next unviewed file to the top without marking it.                                             |
| `Esc`             | Collapse the currently focused file (defers to GitHub's own `Esc` handling, e.g. closing Submit review). |
| `Cmd`+`z`         | Undo the last check.                                                                                     |
| `Cmd`+`Shift`+`z` | Redo the last check.                                                                                     |

The shortcuts are ignored while typing in an input, textarea, or other editable field.

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
