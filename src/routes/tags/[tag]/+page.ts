import type { PageLoad } from './$types';
import { getPostsByTag, getAllTagSlugs } from '$lib/utils/loaders';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
	// 含 / 的标签（如 UI/UX）无法直接作为路径参数返回，
	// 但会被标签列表页通过 encodeURIComponent 链接发现并预渲染
	return getAllTagSlugs()
		.filter((tag) => !tag.includes('/'))
		.map((tag) => ({ tag }));
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
