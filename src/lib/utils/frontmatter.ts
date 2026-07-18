/**
 * 极简 frontmatter 解析器
 * 解析 `---` 包裹的 YAML 头部，支持基本类型：string, number, boolean, array
 */

export interface ParsedMarkdown {
	metadata: Record<string, unknown>;
	body: string;
}

// 模块级正则常量，避免每次调用时创建新对象
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const IMG_MD_RE = /!\[[^\]]*\]\(([^)]+)\)/g;

export function parseMarkdown(raw: string): ParsedMarkdown {
	const fmMatch = raw.match(FRONTMATTER_RE);
	if (!fmMatch) {
		return { metadata: {}, body: raw };
	}

	return {
		metadata: parseYaml(fmMatch[1]),
		body: fmMatch[2]
	};
}

function parseYaml(yaml: string): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	const lines = yaml.split(/\r?\n/);

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		// 多行数组项：- item（收集到上一个 key）
		if (trimmed.startsWith('- ')) {
			// 找到最近一个已设置但为空数组的 key
			const keys = Object.keys(result);
			for (let k = keys.length - 1; k >= 0; k--) {
				const key = keys[k];
				if (Array.isArray(result[key]) && (result[key] as unknown[]).length === 0) {
					const val = trimmed.slice(2).trim();
					(result[key] as unknown[]).push(parseValue(val));
					break;
				}
			}
			continue;
		}

		const colonIdx = trimmed.indexOf(':');
		if (colonIdx === -1) continue;

		const key = trimmed.slice(0, colonIdx).trim();
		const value: unknown = trimmed.slice(colonIdx + 1).trim();

		if (value === '') {
			// 可能是多行数组开头，预置空数组
			result[key] = [];
			continue;
		}

		result[key] = parseValue(value as string);
	}

	return result;
}

function parseValue(raw: string): unknown {
	// 去引号
	if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
		return raw.slice(1, -1);
	}

	// 内联数组 [a, b, c]
	if (raw.startsWith('[') && raw.endsWith(']')) {
		const inner = raw.slice(1, -1).trim();
		if (!inner) return [];
		return inner.split(',').map((s) => parseValue(s.trim()) as string);
	}

	// boolean
	if (raw === 'true') return true;
	if (raw === 'false') return false;

	// number
	if (/^-?\d+$/.test(raw)) return parseInt(raw, 10);
	if (/^-?\d+\.\d+$/.test(raw)) return parseFloat(raw);

	return raw;
}

// rehype-slug 使用 github-slugger，其算法：
// 1. 转小写  2. 去除 ASCII 标点  3. 空白替换为连字符
const SLUG_SPECIALS = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g;
const SLUG_WHITESPACE = /\s/g;

function githubSlug(value: string): string {
	return value.toLowerCase().replace(SLUG_SPECIALS, '').replace(SLUG_WHITESPACE, '-');
}

/** 从 Markdown 正文中提取 h2/h3 标题（用于 TOC） */
export function extractHeadings(body: string): { id: string; label: string; level: number }[] {
	const headings: { id: string; label: string; level: number }[] = [];
	const lines = body.split(/\r?\n/);

	for (const line of lines) {
		const h2 = line.match(/^##\s+(.+)$/);
		if (h2) {
			const label = h2[1].trim();
			headings.push({ id: githubSlug(label), label, level: 2 });
			continue;
		}
		const h3 = line.match(/^###\s+(.+)$/);
		if (h3) {
			const label = h3[1].trim();
			headings.push({ id: githubSlug(label), label, level: 3 });
		}
	}

	return headings;
}

/** 从 Markdown 正文中提取所有图片 URL */
export function extractImages(body: string): string[] {
	const images: string[] = [];
	let match: RegExpExecArray | null;
	IMG_MD_RE.lastIndex = 0; // 全局正则需重置 lastIndex

	while ((match = IMG_MD_RE.exec(body)) !== null) {
		images.push(match[1]);
	}

	return images;
}

/**
 * 估算阅读时间（中文按 400 字/分钟）
 * 仅移除代码块和图片标记，保留正文标点
 */
export function estimateReadTime(body: string): string {
	const charCount = getWordCount(body);
	const minutes = Math.max(1, Math.ceil(charCount / 400));
	return `${minutes} 分钟`;
}

/** 计算正文字数（去除代码块、图片、标题标记后的纯文本字符数） */
export function getWordCount(body: string): number {
	const text = body
		.replace(/```[\s\S]*?```/g, '')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^\s{0,3}>\s?/gm, '')
		.replace(/[*_`~]/g, '')
		.trim();

	return text.replace(/\s/g, '').length;
}

/** 格式化字数为中文表示 */
export function formatWordCount(count: number): string {
	if (count < 1000) return `${count} 字`;
	return `${(count / 1000).toFixed(1)}k 字`;
}

/** 格式化日期为 MM.DD */
export function formatDateShort(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${mm}.${dd}`;
}

/** 格式化日期为 YYYY.MM.DD */
export function formatDateLong(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const yy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yy}.${mm}.${dd}`;
}

/** 获取相对时间描述 */
export function getRelativeTime(date: Date | string | number): string {
	const d =
		typeof date === 'number' ? new Date(date) : typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diff = now.getTime() - d.getTime();

	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const week = 7 * day;
	const month = 30 * day;
	const year = 365 * day;

	if (diff < minute) return '刚刚';
	if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
	if (diff < day) return `${Math.floor(diff / hour)}小时前`;
	if (diff < week) return `${Math.floor(diff / day)}天前`;
	if (diff < month) return `${Math.floor(diff / week)}周前`;
	if (diff < year) return `${Math.floor(diff / month)}个月前`;
	return `${Math.floor(diff / year)}年前`;
}

/** 格式化日期为 YYYY.MM.DD · HH:mm */
export function formatDateTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	const hh = String(d.getHours()).padStart(2, '0');
	const mi = String(d.getMinutes()).padStart(2, '0');
	return `${mm}.${dd} · ${hh}:${mi}`;
}
