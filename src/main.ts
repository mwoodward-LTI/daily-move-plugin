import { MarkdownView, Notice, Plugin } from 'obsidian';
import { adjacentDailyNote, dailyNoteDate } from './daily-notes';

const NAV_CLASS = 'daily-move-nav';

const STEPS = [
	{ step: 1, id: 'next-daily-note', icon: 'arrow-right', label: 'Next daily note' },
	{ step: -1, id: 'previous-daily-note', icon: 'arrow-left', label: 'Previous daily note' },
] as const;

export default class DailyMovePlugin extends Plugin {
	onload() {
		for (const { step, id, label } of STEPS) {
			this.addCommand({
				id,
				name: `Go to ${label.toLowerCase()}`,
				checkCallback: (checking: boolean) => {
					const view = this.app.workspace.getActiveViewOfType(MarkdownView);
					if (!view?.file || dailyNoteDate(this.app, view.file) === null) {
						return false;
					}
					if (!checking) void this.go(view, step);
					return true;
				},
			});
		}

		const refresh = () => this.refreshArrows();
		this.app.workspace.onLayoutReady(refresh);
		this.registerEvent(this.app.workspace.on('file-open', refresh));
		this.registerEvent(this.app.workspace.on('layout-change', refresh));
	}

	onunload() {
		this.eachMarkdownView((view) => this.clearArrows(view));
	}

	/** Arrows belong on daily notes only, so rebuild them whenever a view's file changes. */
	private refreshArrows() {
		this.eachMarkdownView((view) => {
			this.clearArrows(view);
			if (!view.file || dailyNoteDate(this.app, view.file) === null) return;
			for (const { step, icon, label } of STEPS) {
				view
					.addAction(icon, label, () => void this.go(view, step))
					.addClass(NAV_CLASS);
			}
		});
	}

	private eachMarkdownView(fn: (view: MarkdownView) => void) {
		for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
			// Deferred leaves have a placeholder view until they are opened.
			if (leaf.view instanceof MarkdownView) fn(leaf.view);
		}
	}

	private clearArrows(view: MarkdownView) {
		view.containerEl
			.querySelectorAll(`.${NAV_CLASS}`)
			.forEach((el) => el.remove());
	}

	private async go(view: MarkdownView, step: number) {
		const target = view.file && adjacentDailyNote(this.app, view.file, step);
		if (!target) {
			new Notice(`No ${step < 0 ? 'earlier' : 'later'} daily note`);
			return;
		}
		await view.leaf.openFile(target);
	}
}
