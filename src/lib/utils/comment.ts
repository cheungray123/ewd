export type {
	ApiResponse,
	CommentData,
	CommentGetResponse,
	CommentSubmitParams,
	CommentConfig,
	CommentUser
} from '$lib/types/comment';

import type {
	ApiResponse,
	CommentData,
	CommentGetResponse,
	CommentSubmitParams,
	CommentConfig,
	CommentUser
} from '$lib/types/comment';

import { commentApi } from '$lib/settings/site';

const STORAGE_KEY = 'comment_user';
const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 2;

async function request<T>(
	event: string,
	params?: { [key: string]: unknown },
	retry = true
): Promise<T> {
	const body = { event, ...params };

	let lastError: Error | null = null;
	const maxRetries = retry ? MAX_RETRIES : 0;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

		try {
			const res = await fetch(commentApi, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(body),
				signal: controller.signal
			});

			clearTimeout(timeoutId);

			if (!res.ok) {
				throw new Error(`服务异常 (${res.status})`);
			}

			return await res.json();
		} catch (e) {
			clearTimeout(timeoutId);
			lastError = e instanceof Error ? e : new Error(String(e));

			// 非超时错误不重试
			const isTimeout = e instanceof Error && e.name === 'AbortError';
			if (!isTimeout || attempt === maxRetries) {
				if (isTimeout) {
					throw new Error('请求超时，请稍后重试', { cause: e });
				}
				throw e;
			}

			// 指数退避：1s → 2s
			const delay = 1000 * Math.pow(2, attempt);
			await new Promise((r) => setTimeout(r, delay));
		}
	}

	throw lastError ?? new Error('请求失败');
}

export async function getConfig(): Promise<CommentConfig | null> {
	try {
		const res = await request<ApiResponse & { config: CommentConfig }>('GET_CONFIG');
		if (res.code === 0 && res.config) {
			return res.config;
		}
		return null;
	} catch (e) {
		console.warn('[comment] 获取配置失败:', e);
		return null;
	}
}

export async function getComments(
	url: string,
	page?: number,
	pageSize?: number,
	mail?: string
): Promise<CommentGetResponse | null> {
	try {
		const params: { url: string; page?: number; pageSize?: number; mail?: string } = { url };
		if (page !== undefined) params.page = page;
		if (pageSize !== undefined) params.pageSize = pageSize;
		if (mail) params.mail = mail;

		const res = await request<ApiResponse<CommentData[]> & { more: boolean; count: number }>(
			'COMMENT_GET',
			params
		);

		if (res.code === 0) {
			return {
				data: res.data || [],
				more: res.more ?? false,
				count: res.count ?? 0
			};
		}
		return null;
	} catch (e) {
		console.warn('[comment] 获取评论列表失败:', e);
		return null;
	}
}

export async function submitComment(params: CommentSubmitParams): Promise<string | null> {
	try {
		const res = await request<ApiResponse<{ id: string }>>('COMMENT_SUBMIT', { ...params }, false);
		if (res.code === 0 && res.data) {
			return res.data.id;
		}
		throw new Error(res.message || '评论发送失败');
	} catch (error) {
		throw error instanceof Error ? error : new Error(String(error));
	}
}

export async function likeComment(id: string): Promise<boolean> {
	try {
		const res = await request<ApiResponse>('COMMENT_LIKE', { id });
		return res.code === 0;
	} catch (e) {
		console.warn('[comment] 点赞失败:', e);
		return false;
	}
}

export async function getCounter(
	url: string,
	title?: string
): Promise<{ time: number; likes: number }> {
	try {
		const res = await request<ApiResponse<{ time: number; likes: number }>>('COUNTER_GET', {
			url,
			title
		});
		if (res.code === 0 && res.data) {
			return { time: res.data.time || 0, likes: res.data.likes || 0 };
		}
		return { time: 0, likes: 0 };
	} catch (e) {
		console.warn('[comment] 获取计数失败:', e);
		return { time: 0, likes: 0 };
	}
}

export async function likePage(url: string): Promise<number> {
	const res = await request<ApiResponse<{ likes: number }>>('PAGE_LIKE', { url });
	if (res.code === 0 && res.data) {
		return res.data.likes;
	}
	throw new Error(res.message || '点赞失败');
}

export async function uploadImage(file: File): Promise<{ url: string } | null> {
	try {
		const reader = new FileReader();
		const dataUrl = await new Promise<string>((resolve, reject) => {
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});

		const res = await request<ApiResponse<{ url: string }>>('UPLOAD_IMAGE', { photo: dataUrl });
		if (res.code === 0 && res.data) {
			return { url: res.data.url };
		}
		return null;
	} catch (e) {
		console.error('上传图片失败:', e);
		return null;
	}
}

export function saveUser(user: CommentUser): void {
	if (typeof localStorage !== 'undefined') {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
		} catch (e) {
			console.warn('保存用户信息失败', e);
		}
	}
}

export function loadUser(): CommentUser | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch (e) {
		console.warn('用户信息解析失败，已清除损坏数据', e);
		localStorage.removeItem(STORAGE_KEY);
	}
	return null;
}

export function getGravatarUrl(
	mailMd5: string,
	cdn: string = 'weavatar.com',
	size: number = 80
): string {
	return `https://${cdn}/avatar/${mailMd5}?s=${size}&d=initials`;
}

export interface CommentSummary {
	count: number;
	commenters: { avatarUrl: string }[];
}

/** 简单并发限制器，避免大量同时请求打满连接池 */
async function pLimit<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
	const results: T[] = new Array(tasks.length);
	let cursor = 0;
	const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
		while (cursor < tasks.length) {
			const idx = cursor++;
			results[idx] = await tasks[idx]();
		}
	});
	await Promise.all(workers);
	return results;
}

export async function getCommentSummaries(
	ids: string[],
	urlPrefix: string
): Promise<Record<string, CommentSummary>> {
	const map: Record<string, CommentSummary> = {};

	await pLimit(
		ids.map((id) => async () => {
			try {
				const result = await getComments(`${urlPrefix}${id}`);
				if (!result) return;
				const seen = new Set<string>();
				const commenters: { avatarUrl: string }[] = [];
				for (const c of result.data) {
					if (!seen.has(c.nick)) {
						seen.add(c.nick);
						commenters.push({
							avatarUrl: c.avatar || getGravatarUrl(c.mailMd5, 'weavatar.com', 40)
						});
					}
				}
				map[id] = { count: result.count, commenters };
			} catch {
				// 单条失败不影响其他
			}
		}),
		6
	);

	return map;
}
