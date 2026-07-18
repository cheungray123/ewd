import { browser } from '$app/environment';

const STORAGE_KEY = 'df-theme';

export type Theme = 'light' | 'dark';

/** 全局主题状态（Svelte 5 Runes Store） */
class ThemeStore {
	current = $state<Theme>('dark');
	private initialized = false;
	private mediaQuery: MediaQueryList | null = null;
	private mediaHandler: ((e: MediaQueryListEvent) => void) | null = null;

	/**
	 * 初始化主题：
	 * 1. 从 localStorage 读取用户偏好，无则跟随系统
	 * 2. 写入 data-theme 属性（防闪烁）
	 * 3. 同步响应式状态
	 * 4. 监听系统深色模式变化，仅在用户未显式设置时跟随
	 *
	 * 可安全多次调用，仅首次执行实际逻辑
	 */
	init(): void {
		if (!browser || this.initialized) return;
		this.initialized = true;

		let t: Theme;
		let hasStored = false;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored === 'light' || stored === 'dark') {
				t = stored;
				hasStored = true;
			} else {
				t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
		} catch {
			// localStorage 不可用（隐私模式等），跟随系统偏好
			t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}

		document.documentElement.setAttribute('data-theme', t);
		this.current = t;

		// 监听系统深色模式变化：仅当用户未显式设置偏好时才跟随系统
		this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		this.mediaHandler = (e: MediaQueryListEvent) => {
			if (hasStored) return;
			const next: Theme = e.matches ? 'dark' : 'light';
			if (next === this.current) return;
			this.current = next;
			document.documentElement.setAttribute('data-theme', next);
		};
		this.mediaQuery.addEventListener('change', this.mediaHandler);
	}

	/** 切换主题并持久化 */
	toggle(): void {
		if (!browser) return;
		this.current = this.current === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', this.current);
		try {
			localStorage.setItem(STORAGE_KEY, this.current);
		} catch {
			/* ignore */
		}
	}
}

export const theme = new ThemeStore();
