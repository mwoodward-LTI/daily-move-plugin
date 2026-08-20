# Daily Move

Back/forward arrows in the note header of every daily note, so you can walk
through them one note at a time.

- Arrows show up only on notes inside the **Daily notes** folder (folder and
  date format are read from the core Daily notes plugin — nothing to configure).
- Stepping follows date order and skips days with no note. A notice appears at
  either end of the range.
- Same jumps as commands, for hotkeys: **Go to previous daily note** /
  **Go to next daily note**.

## Development

```bash
npm install
npm run dev     # watch build into main.js
npm run build   # typecheck + production build
npm test        # date parsing / stepping checks
npm run lint
```

Reload Obsidian and enable **Daily Move** in **Settings → Community plugins**
after the first build.
