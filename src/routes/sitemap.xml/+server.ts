import type { RequestHandler } from './$types';
import { site } from '$lib/settings/site';
import { getRawPosts, getAllPhotoSlugs, getAllTagSlugs } from '$lib/utils/loaders';

export const prerender = true;

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = () => {
	const siteUrl = site.url;
	const now = new Date().toISOString();

	// 静态页面
	const staticPages = ['', '/posts', '/moments', '/gallery', '/about', '/archive'];

	const staticUrls = staticPages
		.map(
			(path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${path === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`
		)
		.join('\n');

	// 文章页面
	const posts = getRawPosts();
	const postUrls = posts
		.map(
			(post) => `  <url>
    <loc>${siteUrl}/posts/${post.slug}</loc>
    <lastmod>${(post.updated || post.date).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
		)
		.join('\n');

	// 相册页面
	const photoSlugs = getAllPhotoSlugs();
	const photoUrls = photoSlugs
		.map(
			(slug) => `  <url>
    <loc>${siteUrl}/gallery/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`
		)
		.join('\n');

	// 标签页面
	const tagSlugs = getAllTagSlugs();
	const tagUrls = tagSlugs
		.map(
			(tag) => `  <url>
    <loc>${siteUrl}/tags/${encodeURIComponent(tag)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.4</priority>
  </url>`
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${postUrls}
${photoUrls}
${tagUrls}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
