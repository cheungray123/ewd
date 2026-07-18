import type { PageLoad } from './$types';
import { getPostsByTag, getAllTagSlugs } from '$lib/utils/loaders';
import { error } from '@sveltejs/kit';

export const prerender = 'auto';

export function entries() {
	// 只返回不包含特殊字符的标签进行预渲染
	// 包含 / 的标签（如 UI/UX）将在运行时处理
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
