import { App, TFile, moment } from 'obsidian';

const DEFAULT_FORMAT = 'YYYY-MM-DD';

/** Folder and date format, read from the core Daily notes plugin's private API. */
function dailyNotesOptions(app: App): { folder?: string; format?: string } {
	const internal = app as App & {
		internalPlugins?: {
			getPluginById(id: string): {
				instance?: { options?: { folder?: string; format?: string } };
			} | null;
		};
	};
	return (
		internal.internalPlugins?.getPluginById('daily-notes')?.instance
			?.options ?? {}
	);
}

/**
 * Timestamp encoded in a file's path by the Daily notes folder and date format,
 * or null when the file is not a daily note. Parsing the whole path below the
 * folder (not just the basename) also covers nested formats like `YYYY/MM/DD`.
 */
export function dailyNoteDate(app: App, file: { path: string }): number | null {
	const { folder, format } = dailyNotesOptions(app);
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
	return notes[index + step]?.file ?? null;
}
