# Daily Move — agent notes

Obsidian plugin: TypeScript in `src/`, bundled by esbuild to `main.js`. The repo *is* the
plugin folder inside the vault it serves, so `main.js` is committed and there is no
release pipeline — build, reload Obsidian, done.

## Scripts

- `npm run dev` — watch build
- `npm run build` — typecheck + production bundle
- `npm test` — date parsing and stepping checks (`test/daily-notes.test.mjs`)
- `npm run lint` — eslint with `eslint-plugin-obsidianmd`; it checks API calls against
  `minAppVersion` in `manifest.json`, so bump that when reaching for a newer API

## Rules

- Keep `src/main.ts` to plugin lifecycle; feature logic lives in its own module.
- Use `this.register*` for anything needing cleanup. View actions added with `addAction`
  are *not* auto-removed, so `onunload` clears them by class.
- Never change `id` in `manifest.json` — Obsidian keys plugin data off it.
- No network calls, no telemetry, nothing read or written outside the vault.
- The daily notes folder and format come from the core plugin's private API. Treat
  missing or unparseable options as "not a daily note" rather than guessing.
