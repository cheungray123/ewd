import type { PagerItem } from '$lib/types';

/**
 * 根据总数和每页大小生成 PagerItem 列表
 *
 * @param total 数据总条数
 * @param pageSize 每页数量
 * @param current 当前页码（从 1 开始）
 * @param basePath 链接前缀（如 '/posts'）
 * @returns PagerItem 数组；只有一页时返回空数组（Pager 组件不渲染）
 */
export function buildPagerItems(
	total: number,
	pageSize: number,
	current: number,
	basePath: string
): PagerItem[] {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	if (totalPages <= 1) return [];

	const items: PagerItem[] = [];
	const showDots = totalPages > 7;

	for (let i = 1; i <= totalPages; i++) {
		// 页数多时省略中间页码
		if (showDots) {
			const nearStart = i <= 3;
			const nearEnd = i >= totalPages - 2;
			const nearCurrent = Math.abs(i - current) <= 1;
			if (!nearStart && !nearEnd && !nearCurrent) {
				// 避免连续省略号
				const last = items[items.length - 1];
				if (!last?.dots) {
					items.push({ label: '...', dots: true });
				}
				continue;
			}
		}

		if (i === current) {
			items.push({ label: String(i), current: true });
		} else {
			items.push({ label: String(i), href: `${basePath}?page=${i}` });
		}
	}

	return items;
}
