import type { PageLoad } from './$types';
import { getAllTags } from '$lib/utils/loaders';

export const prerender = true;

export const load: PageLoad = () => {
	const tags = getAllTags();
	const totalCount = tags.reduce((sum, t) => sum + t.count, 0);

	return {
		tags,
		totalCount: `${totalCount} 篇`
	};
};
