import type { PageLoad } from './$types';
import {
	getFeaturedPosts,
	getFeaturedPhotos,
	getContentStats,
	getLatestMoment
} from '$lib/utils/loaders';
import { heroStatsConfig } from '$lib/settings/pages';
import { site } from '$lib/settings/site';
import { formatWordCount } from '$lib/utils/frontmatter';

export const load: PageLoad = () => {
	const stats = getContentStats();

	// 用实际数据填充统计项
	const heroStats = [
		{
			...heroStatsConfig[0],
			number: formatWordCount(stats.totalWords).replace(/\s*字$/, ''),
			unit: '字',
			sub: `${stats.postCount} 篇文章`
		},
		{
			...heroStatsConfig[1],
			number: String(stats.postCount + stats.photoCount),
			unit: '篇',
			sub: `${stats.categoryCount} 个分类 · ${stats.tagCount} 个标签`
		},
		{ ...heroStatsConfig[2], number: String(stats.runningDays), sub: `自 ${site.startYear} 年` }
	];

	return {
		featuredPosts: getFeaturedPosts(),
		featuredPhotos: getFeaturedPhotos(),
		heroStats,
		latestMoment: getLatestMoment(),
		postCount: stats.postCount,
		photoCount: stats.photoCount
	};
};
