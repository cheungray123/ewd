/**
 * 说说 / 页面点赞状态管理
 *
 * 基于 localStorage 持久化「已点赞」状态，
 * 通过 comment.ts 的 likePage API 与后端同步。
 */
import { browser } from '$app/environment';
import { likePage, getCounter } from '$lib/utils/comment';

const STORAGE_KEY = 'moment-likes';

interface LikeState {
	liked: Record<string, boolean>;
	likes: Record<string, number>;
	liking: Record<string, boolean>;
}

function loadState(): LikeState {
	if (!browser) return { liked: {}, likes: {}, liking: {} };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				liked: parsed.liked || {},
				likes: parsed.likes || {},
				liking: {}
			};
		}
	} catch {
		/* 损坏数据，忽略 */
	}
	return { liked: {}, likes: {}, liking: {} };
}

function saveState(state: LikeState): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ liked: state.liked, likes: state.likes }));
	} catch {
		/* 存储失败，忽略 */
	}
}

class LikeStore {
	state = $state<LikeState>({ liked: {}, likes: {}, liking: {} });

	init(): void {
		if (!browser) return;
		this.state = loadState();
	}

	isLiked(id: string): boolean {
		return this.state.liked[id] ?? false;
	}

	getLikes(id: string): number {
		return this.state.likes[id] ?? 0;
	}

	isLiking(id: string): boolean {
		return this.state.liking[id] ?? false;
	}

	/** 批量加载点赞数（并发限制 6） */
	async loadAll(ids: string[]): Promise<void> {
		if (!browser || ids.length === 0) return;
		const concurrency = 6;
		let cursor = 0;
		const workers = Array.from({ length: Math.min(concurrency, ids.length) }, async () => {
			while (cursor < ids.length) {
				const id = ids[cursor++];
				try {
					const result = await getCounter(`/moments/${id}`);
					this.state.likes[id] = result.likes;
				} catch {
					/* 单条失败不影响其他 */
				}
			}
		});
		await Promise.all(workers);
	}

	/** 切换点赞状态 */
	async toggle(id: string): Promise<void> {
		if (!browser || this.state.liking[id]) return;

		this.state.liking[id] = true;
		const wasLiked = this.state.liked[id] ?? false;
		const currentLikes = this.state.likes[id] ?? 0;

		// 乐观更新
		this.state.liked[id] = !wasLiked;
		this.state.likes[id] = wasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

		try {
			const newLikes = await likePage(`/moments/${id}`);
			this.state.likes[id] = newLikes;
		} catch {
			// 回滚
			this.state.liked[id] = wasLiked;
			this.state.likes[id] = currentLikes;
		} finally {
			this.state.liking[id] = false;
			saveState(this.state);
		}
	}
}

export const likeStore = new LikeStore();
