/**
 * 网易云音乐 API 封装
 *
 * 基于 Cloudflare Workers 部署的网易云音乐 API。
 * 仅在客户端调用（静态博客，无 SSR）。
 */

import { musicApi } from '$lib/settings/site';

const BASE = musicApi;

/** 歌曲信息 */
export interface SongInfo {
	id: number;
	name: string;
	artist: string;
	album: string;
	cover: string;
	/** 播放时长（毫秒），可能为 0 */
	duration: number;
}

/** 歌词行 */
export interface LyricLine {
	time: number; // 秒
	text: string;
}

/** 简易 fetch 封装 */
async function fetchJson<T>(path: string, params: Record<string, string>): Promise<T> {
	const url = new URL(`${BASE}${path}`);
	for (const [k, v] of Object.entries(params)) {
		url.searchParams.set(k, v);
	}
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error(`API ${path} 返回 ${res.status}`);
	return res.json() as Promise<T>;
}

/**
 * 获取歌曲详情（支持多首）
 * @param ids 歌曲ID，逗号分隔或数组
 */
export async function getSongDetail(
	ids: string | number | (string | number)[]
): Promise<SongInfo[]> {
	const idStr = Array.isArray(ids) ? ids.join(',') : String(ids);
	const data = await fetchJson<{
		code: number;
		songs?: Array<{
			id: number;
			name: string;
			ar?: Array<{ name: string }>;
			artists?: Array<{ name: string }>;
			al?: { name: string; picUrl?: string };
			album?: { name: string; picUrl?: string };
			dt?: number;
			duration?: number;
		}>;
	}>('/song_detail', { ids: idStr });

	if (!data.songs) return [];

	return data.songs.map((s) => ({
		id: s.id,
		name: s.name,
		artist: (s.ar || s.artists || []).map((a) => a.name).join(' / '),
		album: s.al?.name || s.album?.name || '',
		cover:
			(s.al?.picUrl || s.album?.picUrl || '').replace('http://', 'https://') + '?param=300x300',
		duration: s.dt || s.duration || 0
	}));
}

/**
 * 获取歌曲播放链接
 * @param id 歌曲ID
 * @returns 播放 URL 或 null（版权限制等）
 */
export async function getSongUrl(id: string | number): Promise<string | null> {
	const data = await fetchJson<{
		code: number;
		data?: Array<{ id: number; url: string | null }>;
	}>('/song_url', { id: String(id), br: '320000' });

	const item = data.data?.find((d) => d.id === Number(id));
	return item?.url || null;
}

/**
 * 获取歌词
 * @param id 歌曲ID
 */
export async function getLyric(id: string | number): Promise<LyricLine[]> {
	try {
		const data = await fetchJson<{
			code: number;
			lrc?: { lyric?: string };
		}>('/lyric', { id: String(id) });

		const raw = data.lrc?.lyric || '';
		return parseLyric(raw);
	} catch {
		return [];
	}
}

/**
 * 获取歌单所有歌曲
 * @param playlistId 歌单ID
 * @param limit 数量限制，默认 100
 */
export async function getPlaylistTracks(
	playlistId: string | number,
	limit = 100
): Promise<SongInfo[]> {
	const data = await fetchJson<{
		code: number;
		songs?: Array<{
			id: number;
			name: string;
			ar?: Array<{ name: string }>;
			artists?: Array<{ name: string }>;
			al?: { name: string; picUrl?: string };
			album?: { name: string; picUrl?: string };
			dt?: number;
			duration?: number;
		}>;
	}>('/playlist_track_all', { id: String(playlistId), limit: String(limit) });

	if (!data.songs) return [];

	return data.songs.map((s) => ({
		id: s.id,
		name: s.name,
		artist: (s.ar || s.artists || []).map((a) => a.name).join(' / '),
		album: s.al?.name || s.album?.name || '',
		cover:
			(s.al?.picUrl || s.album?.picUrl || '').replace('http://', 'https://') + '?param=300x300',
		duration: s.dt || s.duration || 0
	}));
}

/**
 * 获取歌单信息（名称、封面等）
 */
export async function getPlaylistInfo(playlistId: string | number): Promise<{
	name: string;
	cover: string;
	trackCount: number;
} | null> {
	const data = await fetchJson<{
		code: number;
		playlist?: {
			name: string;
			coverImgUrl?: string;
			picUrl?: string;
			trackCount: number;
		};
	}>('/playlist_detail', { id: String(playlistId) });

	if (!data.playlist) return null;

	const p = data.playlist;
	return {
		name: p.name,
		cover: (p.coverImgUrl || p.picUrl || '').replace('http://', 'https://') + '?param=300x300',
		trackCount: p.trackCount
	};
}

/**
 * 获取每日推荐歌曲（需 API 端配置 MUSIC_U）
 */
export async function getRecommendSongs(): Promise<SongInfo[]> {
	const data = await fetchJson<{
		code: number;
		data?: {
			dailySongs?: Array<{
				id: number;
				name: string;
				ar?: Array<{ name: string }>;
				artists?: Array<{ name: string }>;
				al?: { name: string; picUrl?: string };
				album?: { name: string; picUrl?: string };
				dt?: number;
				duration?: number;
			}>;
		};
	}>('/recommend_songs', {});

	const songs = data.data?.dailySongs;
	if (!songs) return [];

	return songs.map((s) => ({
		id: s.id,
		name: s.name,
		artist: (s.ar || s.artists || []).map((a) => a.name).join(' / '),
		album: s.al?.name || s.album?.name || '',
		cover:
			(s.al?.picUrl || s.album?.picUrl || '').replace('http://', 'https://') + '?param=300x300',
		duration: s.dt || s.duration || 0
	}));
}

/**
 * 解析 LRC 歌词为结构化数组
 */
function parseLyric(raw: string): LyricLine[] {
	const lines = raw.split('\n');
	const result: LyricLine[] = [];
	const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

	for (const line of lines) {
		const matches = [...line.matchAll(timeRegex)];
		if (matches.length === 0) continue;

		const text = line.replace(timeRegex, '').trim();
		for (const m of matches) {
			const min = parseInt(m[1], 10);
			const sec = parseInt(m[2], 10);
			const ms = parseInt(m[3].padEnd(3, '0'), 10);
			result.push({ time: min * 60 + sec + ms / 1000, text });
		}
	}

	result.sort((a, b) => a.time - b.time);
	return result;
}
