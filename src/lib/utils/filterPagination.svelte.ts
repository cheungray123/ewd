import { page } from '$app/state';
import { goto } from '$app/navigation';
import { buildPagerItems } from '$lib/utils/pager';
import type { PagerItem } from '$lib/types';

/**
 * 通用筛选 + 分页逻辑（基于 URL 参数 ?category=xxx&page=N）
 *
 * 用法：
 * ```svelte
 * const fp = filterPagination('/posts', paginationConfig.posts, () => data.posts, (item, cat) => item.category === cat);
 * // fp.activeFilter, fp.currentPage, fp.filtered, fp.paged, fp.pagerItems, fp.handleFilterChange
 * ```
 */
export function filterPagination<T>(
	basePath: string,
	pageSize: number,
	/** 数据源的 getter 函数，确保响应式追踪 */
	getItems: () => T[],
	/** 筛选函数：返回 true 表示该项属于该分类 */
	matchCategory: (item: T, category: string) => boolean
) {
	const activeFilter = $derived(page.url.searchParams.get('category') ?? '全部');
	const currentPage = $derived(
		Math.max(1, parseInt(page.url.searchParams.get('page') ?? '1', 10) || 1)
	);

	const filtered = $derived.by<T[]>(() => {
		const items = getItems();
		if (activeFilter === '全部') return items;
		return items.filter((item) => matchCategory(item, activeFilter));
	});

	const paged = $derived.by<T[]>(() => {
		const start = (currentPage - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	});

	const pagerItems = $derived<PagerItem[]>(
		buildPagerItems(filtered.length, pageSize, currentPage, basePath)
	);

	function handleFilterChange(key: string) {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const url = new URL(page.url);
		if (key === '全部') {
			url.searchParams.delete('category');
		} else {
			url.searchParams.set('category', key);
		}
		url.searchParams.delete('page');
		goto(url.pathname + url.search, { replaceState: true, noScroll: true });
	}

	return {
		get activeFilter() {
			return activeFilter;
		},
		get currentPage() {
			return currentPage;
		},
		get filtered() {
			return filtered;
		},
		get paged() {
			return paged;
		},
		get pagerItems() {
			return pagerItems;
		},
		handleFilterChange
	};
}
