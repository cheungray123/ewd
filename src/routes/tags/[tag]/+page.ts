import type { PageLoad } from './$types';
import { getPostsByTag, getAllTagSlugs } from '$lib/utils/loaders';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
	return getAllTagSlugs().map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export const load: PageLoad = ({ params }) => {
	const tag = decodeURIComponent(params.tag);
	const posts = getPostsByTag(tag);

	if (posts.length === 0) {
		throw error(404, `标签「${tag}」下暂无文章`);
	}

	return {
		tag,
		posts,
		count: `${posts.length} 篇`
	};
};
