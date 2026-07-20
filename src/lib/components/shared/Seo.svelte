<script lang="ts">
	/**
	 * Seo — 统一 SEO meta 标签管理组件
	 *
	 * 功能：
	 * - Open Graph 标签（og:title / og:description / og:image / og:url / og:type）
	 * - Twitter Card 标签
	 * - canonical 链接
	 * - JSON-LD 结构化数据（Article / WebSite / BreadcrumbList）
	 *
	 * 用法：
	 * <Seo title="页面标题" description="页面描述" image="https://..." type="article" />
	 */

	import { site } from '$lib/settings/site';
	import { page } from '$app/state';

	interface SeoProps {
		/** 页面标题（不含站点后缀） */
		title?: string;
		/** 页面描述 */
		description?: string;
		/** 社交分享图片 URL（绝对路径） */
		image?: string;
		/** OG 类型：article 或 website */
		type?: 'article' | 'website';
		/** JSON-LD 结构化数据，传入对象数组 */
		jsonLd?: Record<string, unknown>[];
		/** 是否生成 Article JSON-LD（需配合 type="article"） */
		articleSchema?: {
			title: string;
			description: string;
			image?: string;
			datePublished: string;
			dateModified?: string;
			author: string;
			slug: string;
		};
		/** 面包屑数据 */
		breadcrumbs?: { name: string; url: string }[];
	}

	let {
		title,
		description = site.description,
		image,
		type = 'website',
		jsonLd = [],
		articleSchema,
		breadcrumbs
	}: SeoProps = $props();

	// 当前页面完整 URL
	let currentUrl = $derived(`${site.url}${page.url.pathname}`);

	// 完整标题
	let fullTitle = $derived(title ? `${title} · ${site.name}` : site.title);

	// OG 图片：优先使用传入的 image，否则回退到生成的默认图
	let ogImage = $derived(image || `${site.url}/og-default.png`);

	// 构建 JSON-LD 数据
	let structuredData = $derived.by(() => {
		const data: Record<string, unknown>[] = [];

		// WebSite 基础结构化数据
		data.push({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: site.title,
			url: site.url,
			description: site.description,
			inLanguage: 'zh-CN'
		});

		// Article 结构化数据
		if (articleSchema) {
			data.push({
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: articleSchema.title,
				description: articleSchema.description,
				image: articleSchema.image || ogImage,
				datePublished: articleSchema.datePublished,
				dateModified: articleSchema.dateModified || articleSchema.datePublished,
				author: {
					'@type': 'Person',
					name: articleSchema.author
				},
				publisher: {
					'@type': 'Person',
					name: articleSchema.author
				},
				mainEntityOfPage: {
					'@type': 'WebPage',
					'@id': `${site.url}/posts/${articleSchema.slug}`
				},
				inLanguage: 'zh-CN'
			});
		}

		// 面包屑结构化数据
		if (breadcrumbs && breadcrumbs.length > 0) {
			data.push({
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: breadcrumbs.map((item, i) => ({
					'@type': 'ListItem',
					position: i + 1,
					name: item.name,
					item: `${site.url}${item.url}`
				}))
			});
		}

		// 自定义 JSON-LD
		data.push(...jsonLd);

		return data;
	});
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />

	<!-- canonical -->
	<link rel="canonical" href={currentUrl} />

	<!-- Open Graph -->
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title || site.title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="zh_CN" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title || site.title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content={title || site.title} />

	<!-- JSON-LD 结构化数据 -->
	{#each structuredData as item, i (i)}
		{@html `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`}
	{/each}
</svelte:head>
