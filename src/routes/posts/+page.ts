import type { PageLoad } from './$types';
import { getPostCards, getContentStats, getPostCategories } from '$lib/utils/loaders';

export const load: PageLoad = () => {
	const posts = getPostCards();
	const stats = getContentStats();
	const categories = getPostCategories();

	return {
		posts,
		count: `${stats.postCount} 篇`,
		categories
	};
};
