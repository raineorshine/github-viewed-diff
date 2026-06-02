# github-fast-merge

A Chrome extension that merges GitHub PRs with a single keyboard shortcut.

## What it does

Press **Cmd+Shift+M** (Mac) or **Ctrl+Shift+M** (Windows/Linux) on any GitHub PR page to:

1. Verify all checks have passed
2. Tick the bypass rules checkbox (if present)
3. Click the merge button
4. Confirm the merge

A toast notification reports success or the reason it stopped.

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
