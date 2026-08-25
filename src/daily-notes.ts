import { App, TFile, moment } from 'obsidian';

const DEFAULT_FORMAT = 'YYYY-MM-DD';

/**
 * Folder and date format, read from the core Daily notes plugin's private API,
 * or null when that plugin is disabled — without it there is no daily note
 * naming scheme to honour, so guessing one would match unrelated files.
 */
function dailyNotesOptions(
	app: App,
): { folder?: string; format?: string } | null {
	const internal = app as App & {
		internalPlugins?: {
			getPluginById(id: string): {
				instance?: { options?: { folder?: string; format?: string } };
			} | null;
		};
	};
	const instance = internal.internalPlugins?.getPluginById('daily-notes')
		?.instance;
	return instance ? (instance.options ?? {}) : null;
}

/**
 * Timestamp encoded in a file's path by the Daily notes folder and date format,
 * or null when the file is not a daily note. Parsing the whole path below the
 * folder (not just the basename) also covers nested formats like `YYYY/MM/DD`.
 */
export function dailyNoteDate(app: App, file: { path: string }): number | null {
	const options = dailyNotesOptions(app);
	if (!options) return null;
	const { folder, format } = options;
	const root = (folder ?? '').replace(/^\/+|\/+$/g, '');
	const prefix = root ? root + '/' : '';
	if (!file.path.startsWith(prefix)) return null;
	const stamp = file.path.slice(prefix.length).replace(/\.md$/, '');
	const date = moment(stamp, format || DEFAULT_FORMAT, true);
	return date.isValid() ? date.valueOf() : null;
}

/** The daily note `step` places from `file` in date order, or null at either end. */
export function adjacentDailyNote(
	app: App,
	file: TFile,
	step: number,
): TFile | null {
	if (dailyNoteDate(app, file) === null) return null;
	// ponytail: rescans every markdown file per jump; cache on vault events if a big vault drags.
	const notes = app.vault
		.getMarkdownFiles()
		.map((f) => ({ file: f, date: dailyNoteDate(app, f) }))
		.filter((n): n is { file: TFile; date: number } => n.date !== null)
		.sort((a, b) => a.date - b.date);
	const index = notes.findIndex((n) => n.file.path === file.path);
	if (index === -1) return null;
	return notes[index + step]?.file ?? null;
}
