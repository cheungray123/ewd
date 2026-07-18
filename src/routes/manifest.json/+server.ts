import type { RequestHandler } from './$types';
import { site } from '$lib/settings/site';

export const prerender = true;

export const GET: RequestHandler = () => {
	const manifest = {
		name: site.title,
		short_name: site.name,
		description: site.description,
		start_url: '/',
		display: 'standalone',
		background_color: '#faf8f5',
		theme_color: '#2e7d6b',
		lang: 'zh-CN',
		icons: [
			{
				src: '/icon-192.png',
				sizes: '192x192',
				type: 'image/png',
				purpose: 'any maskable'
			},
			{
				src: '/icon-512.png',
				sizes: '512x512',
				type: 'image/png',
				purpose: 'any maskable'
			}
		],
		categories: ['blog', 'personal', 'writing'],
		shortcuts: [
			{
				name: '文章',
				url: '/posts',
				description: '查看所有文章'
			},
			{
				name: '说说',
				url: '/moments',
				description: '查看说说动态'
			},
			{
				name: '相册',
				url: '/gallery',
				description: '查看相册'
			}
		]
	};

	return new Response(JSON.stringify(manifest, null, 2), {
		headers: {
			'Content-Type': 'application/manifest+json; charset=utf-8',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
