import type { PageLoad } from './$types';
import { getArticle, getRelatedPosts, getAllPostSlugs } from '$lib/utils/loaders';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
	return getAllPostSlugs().map((slug) => ({ slug }));
}

export const load: PageLoad = ({ params }) => {
	const article = getArticle(params.slug);
	if (!article) {
		throw error(404, `文章「${params.slug}」不存在`);
	}

	const relatedPosts = getRelatedPosts(params.slug, 3);

	return { article, relatedPosts };
};
