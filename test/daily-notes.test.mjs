import assert from 'node:assert/strict';
import esbuild from 'esbuild';

const { outputFiles } = await esbuild.build({
	entryPoints: ['src/daily-notes.ts'],
	bundle: true,
	format: 'esm',
	write: false,
	alias: { obsidian: './test/obsidian-stub.mjs' },
});
const { dailyNoteDate, adjacentDailyNote } = await import(
	'data:text/javascript;base64,' +
		Buffer.from(outputFiles[0].text).toString('base64')
);

const fakeApp = (options, paths) => ({
	internalPlugins: { getPluginById: () => ({ instance: { options } }) },
	vault: { getMarkdownFiles: () => paths.map((path) => ({ path })) },
});

const app = fakeApp({ folder: 'Daily' }, [
	'Daily/2026-01-05.md',
	'Daily/2026-01-01.md',
	'Daily/2026-02-09.md',
	'Daily/2026-01-01 standup.md',
	'Notes/2026-01-03.md',
]);

assert.notEqual(dailyNoteDate(app, { path: 'Daily/2026-01-01.md' }), null);
assert.equal(dailyNoteDate(app, { path: 'Daily/2026-01-01 standup.md' }), null);
assert.equal(dailyNoteDate(app, { path: 'Notes/2026-01-03.md' }), null);

const jump = (path, step) =>
	adjacentDailyNote(app, { path }, step)?.path ?? null;

// Sorted by date, not by vault order, and gaps in the calendar are skipped.
assert.equal(jump('Daily/2026-01-01.md', 1), 'Daily/2026-01-05.md');
assert.equal(jump('Daily/2026-01-05.md', 1), 'Daily/2026-02-09.md');
assert.equal(jump('Daily/2026-01-05.md', -1), 'Daily/2026-01-01.md');
assert.equal(jump('Daily/2026-01-01.md', -1), null);
assert.equal(jump('Daily/2026-02-09.md', 1), null);
assert.equal(jump('Notes/2026-01-03.md', 1), null);

// Nested date format, and daily notes kept in the vault root.
const nested = fakeApp({ folder: 'Daily', format: 'YYYY/MM/YYYY-MM-DD' }, [
	'Daily/2026/01/2026-01-01.md',
	'Daily/2026/02/2026-02-09.md',
]);
assert.equal(
	adjacentDailyNote(nested, { path: 'Daily/2026/01/2026-01-01.md' }, 1)?.path,
	'Daily/2026/02/2026-02-09.md',
);

const root = fakeApp({ folder: '' }, ['2026-01-01.md', '2026-01-02.md', 'Inbox.md']);
assert.equal(dailyNoteDate(root, { path: 'Inbox.md' }), null);
assert.equal(
	adjacentDailyNote(root, { path: '2026-01-01.md' }, 1)?.path,
	'2026-01-02.md',
);

console.log('ok');
