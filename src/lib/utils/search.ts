import Fuse from 'fuse.js';

export interface SearchResult {
	type: 'post' | 'photo';
	slug: string;
	title: string;
	excerpt: string;
	href: string;
}

interface SearchableItem {
	type: 'post' | 'photo';
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	tags: string[];
}

export interface SearchInput {
	type: 'post' | 'photo';
	slug: string;
	title: string;
	excerpt: string;
	category?: string;
	tags?: string[];
}

let _fuse: Fuse<SearchableItem> | null = null;
let _indexData: SearchableItem[] = [];

/**
 * 初始化搜索索引（只执行一次，后续调用复用单例）
 */
export function initSearchIndex(items: SearchInput[]): void {
	const searchable: SearchableItem[] = items.map((item) => ({
		type: item.type,
		slug: item.slug,
		title: item.title,
		excerpt: item.excerpt,
		category: item.category ?? '',
		tags: item.tags ?? []
	}));

	_indexData = searchable;
	_fuse = new Fuse(searchable, {
		keys: [
			{ name: 'title', weight: 0.6 },
			{ name: 'excerpt', weight: 0.25 },
			{ name: 'category', weight: 0.1 },
			{ name: 'tags', weight: 0.05 }
		],
		threshold: 0.4,
		ignoreLocation: true,
		minMatchCharLength: 2,
		includeScore: true
	});
}

/**
 * 执行搜索，返回格式化结果
 */
export function search(query: string, limit = 8): SearchResult[] {
	if (!_fuse || !query.trim()) return [];

	return _fuse.search(query, { limit }).map((r) => {
		const item = r.item;
		return {
			type: item.type,
			slug: item.slug,
			title: item.title,
			excerpt: item.excerpt,
			href: item.type === 'post' ? `/posts/${item.slug}` : `/gallery/${item.slug}`
		};
	});
}

/**
 * 获取已索引的数据（用于调试或展示）
 */
export function getSearchIndex(): SearchableItem[] {
	return _indexData;
}
