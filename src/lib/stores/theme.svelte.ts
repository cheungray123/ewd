import { browser } from '$app/environment';

const STORAGE_KEY = 'df-theme';

export type Theme = 'light' | 'dark';

/** 全局主题状态（Svelte 5 Runes Store） */
class ThemeStore {
	current = $state<Theme>('dark');
	private initialized = false;

	/**
	 * 初始化主题：
	 * 1. 从 localStorage 读取用户偏好，无则跟随系统
	 * 2. 写入 data-theme 属性（防闪烁）
	 * 3. 同步响应式状态
	 *
	 * 可安全多次调用，仅首次执行实际逻辑
	 */
	init(): void {
		if (!browser || this.initialized) return;
		this.initialized = true;

		let t: Theme;
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored === 'light' || stored === 'dark') {
				t = stored;
			} else {
				t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
		} catch {
			// localStorage 不可用（隐私模式等），跟随系统偏好
			t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}

		document.documentElement.setAttribute('data-theme', t);
		this.current = t;
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
