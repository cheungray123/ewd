import type { RequestHandler } from './$types';
import { site } from '$lib/settings/site';
import { getRawPosts } from '$lib/utils/loaders';

export const prerender = true;

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = ({ url }) => {
	const allPosts = getRawPosts();
	const siteUrl = site.url;

	// 分类过滤支持：?category=xxx
	// 注意：静态站点下 query 参数在运行时不可用，此过滤仅对 SSR 部署有效。
	// 静态构建时生成的是包含全部分类的完整 RSS。
	// 预渲染时 url.searchParams 不可用，使用 try-catch 兼容
	let category: string | null = null;
	try {
		category = url.searchParams.get('category');
	} catch {
		// 预渲染时忽略 query 参数
	}
	let posts = allPosts;
	let channelTitle: string = site.title;
	let channelDesc: string = site.description;

	if (category && category !== '全部') {
		posts = allPosts.filter((p) => p.category === category);
		channelTitle = `${site.title} · ${category}`;
		channelDesc = `${site.description} — ${category} 分类`;
	}

	const items = posts
		.map((post) => {
			const postUrl = `${siteUrl}/posts/${post.slug}`;
			const pubDate = post.date.toUTCString();
			const tags = post.tags.map((t) => `      <category>${escapeXml(t)}</category>`).join('\n');
			return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
${tags}
      <pubDate>${pubDate}</pubDate>
    </item>`;
		})
		.join('\n');

	// 自引用链接
	const selfHref = category
		? `${siteUrl}/rss.xml?category=${encodeURIComponent(category)}`
		: `${siteUrl}/rss.xml`;

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(channelDesc)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(selfHref)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
