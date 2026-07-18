import type { RequestHandler } from './$types';
import { site } from '$lib/settings/site';
import { getRawPosts } from '$lib/utils/loaders';

export const prerender = true;

export const GET: RequestHandler = () => {
	const posts = getRawPosts();
	const siteUrl = site.url;

	const feed = {
		version: 'https://jsonfeed.org/version/1.1',
		title: site.title,
		description: site.description,
		home_page_url: siteUrl,
		feed_url: `${siteUrl}/feed.json`,
		language: 'zh-CN',
		authors: [
			{
				name: site.name,
				url: siteUrl
			}
		],
		items: posts.map((post) => ({
			id: `${siteUrl}/posts/${post.slug}`,
			url: `${siteUrl}/posts/${post.slug}`,
			title: post.title,
			content_html: `<p>${post.description}</p>`,
			summary: post.description,
			date_published: post.date.toISOString(),
			date_modified: (post.updated || post.date).toISOString(),
			tags: [post.category, ...post.tags],
			image: post.image || undefined
		}))
	};

	return new Response(JSON.stringify(feed, null, 2), {
		headers: {
			'Content-Type': 'application/feed+json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
