<script lang="ts">
	import { onMount } from 'svelte';
	import ProgressBar from '$lib/components/base/ProgressBar.svelte';
	import TableOfContents from '$lib/components/article/TableOfContents.svelte';
	import CommentSection from '$lib/components/comment/CommentSection.svelte';
	import ShareBar from '$lib/components/article/ShareBar.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import RevealItem from '$lib/components/shared/RevealItem.svelte';
	import { getCounter } from '$lib/utils/comment';
	import { site } from '$lib/settings/site';
	import { ChevronRight, Clock, RefreshCw, FileText } from 'svelte-lucide';
	import type { PageData } from './$types';

	// 静态导入 mdsvex 编译的 Markdown 组件（模块级，只执行一次）
	const postModules = import.meta.glob('/src/content/posts/*.md', { eager: true }) as Record<
		string,
		{ default: import('svelte').Component }
	>;

	let { data }: { data: PageData } = $props();
	const article = $derived(data.article);
	const relatedPosts = $derived(data.relatedPosts);
	const Content = $derived(postModules[`/src/content/posts/${article.slug}.md`]?.default);

	// OG 图：优先使用文章自定义图片，否则使用构建时生成的 /og/{slug}.png
	let ogImage = $derived(article.image || `${site.url}/og/${article.slug}.png`);

	let apiViews = $state<string | null>(null);
	let viewCount = $derived(apiViews ?? article.views);

	// 面包屑数据
	let breadcrumbs = $derived([
		{ name: '首页', url: '/' },
		{ name: '文章', url: '/posts' },
		{ name: article.title, url: `/posts/${article.slug}` }
	]);

	onMount(() => {
		// 客户端请求访问计数（同时触发计数+1）
		getCounter(`/posts/${article.slug}`, article.title).then((result) => {
			if (result.time > 0) {
				apiViews = `${result.time} 次浏览`;
			}
		});
	});
</script>

<Seo
	title={article.title}
	description={article.tags.map((t) => t.label).join('、') + ' — ' + article.category}
	image={ogImage}
	type="article"
	articleSchema={{
		title: article.title,
		description: article.tags.map((t) => t.label).join('、') + ' — ' + article.category,
		image: ogImage,
		datePublished: article.datePublished || article.date,
		dateModified: article.updated,
		author: article.author.name,
		slug: article.slug
	}}
	{breadcrumbs}
/>

<main id="main" class="page" tabindex="-1">
	<ProgressBar />

	<!-- 面包屑导航 -->
	<nav class="breadcrumb" aria-label="面包屑导航">
		<a href="/">首页</a>
		<ChevronRight size="12" strokeWidth="1.6" />
		<a href="/posts">文章</a>
		<ChevronRight size="12" strokeWidth="1.6" />
		<span class="current">{article.title}</span>
	</nav>

	<div class="article">
		<article class="body">
			{#if article.image}
				<RevealItem variant="scale" class="post-hero-wrap">
					<div class="post-hero">
						<img src={article.image} alt={article.title} />
						<span class="badge">{article.category}</span>
					</div>
				</RevealItem>
			{/if}

			<RevealItem variant="up">
				<h1 class="a-title">{article.title}</h1>
				<div class="a-meta">
					<span><b>東风</b></span>
					<span class="badge">{article.category}</span>
					<span class="meta-date"><Clock size="12" strokeWidth="1.6" />{article.date}</span>
					{#if article.updated}
						<span class="meta-updated">
							<RefreshCw size="12" strokeWidth="1.6" />更新于 {article.updated}
						</span>
					{/if}
					<span><FileText size="12" strokeWidth="1.6" />{article.readTime}</span>
					{#if article.wordCount}<span class="wc">{article.wordCount}</span>{/if}
					<span class="views">{viewCount}</span>
				</div>
			</RevealItem>

			<RevealItem variant="fade" delay={0.1}>
				<div class="prose">
					{#if Content}
						<Content />
					{/if}
				</div>
			</RevealItem>

			<!-- 标签 + 点赞 + 分享（水平排列） -->
			<RevealItem variant="up" delay={0.05}>
				<ShareBar
					title={article.title}
					slug={article.slug}
					tags={article.tags}
					path={`/posts/${article.slug}`}
				/>
			</RevealItem>

			<!-- 版权声明 -->
			<RevealItem variant="up" delay={0.05}>
				<div class="copyright-notice">
					<div class="copyright-icon">©</div>
					<div class="copyright-text">
						<p>
							本文由 <b>東风</b> 原创发布，转载请注明出处：
							<br />
							<a href="/posts/{article.slug}">{site.url}/posts/{article.slug}</a>
						</p>
						<p class="license">
							本站内容采用 <b>知识共享 署名-非商业性使用 4.0 国际许可协议</b> 进行许可。
						</p>
					</div>
				</div>
			</RevealItem>

			<RevealItem variant="up" delay={0.1}>
				<div class="author-card">
					<img class="ava" src={site.avatar} alt={article.author.name} />
					<div class="info">
						<h4>{article.author.name}</h4>
						<p>{article.author.bio}</p>
					</div>
					<div class="links">
						<a class="btn" href="/about">关注</a>
						<a class="btn primary" href="/rss.xml">RSS</a>
					</div>
				</div>
			</RevealItem>

			<!-- 相关文章推荐 -->
			{#if relatedPosts && relatedPosts.length > 0}
				<RevealItem variant="up" delay={0.1}>
					<div class="related-posts">
						<h3 class="related-title">相关文章</h3>
						<div class="related-grid">
							{#each relatedPosts as post (post.slug)}
								<a class="related-card" href="/posts/{post.slug}">
									<span class="related-cat">{post.category}</span>
									<span class="related-name">{post.title}</span>
									<span class="related-date">{post.date} · {post.readTime}</span>
								</a>
							{/each}
						</div>
					</div>
				</RevealItem>
			{/if}

			<RevealItem variant="up" delay={0.15}>
				<div class="pager-prevnext">
					{#if article.prev}
						<a class="pn prev" href={`/posts/${article.prev.slug}`}>
							<div class="lbl">← 上一篇</div>
							<div class="ttl">{article.prev.title}</div>
						</a>
					{:else}
						<span></span>
					{/if}
					{#if article.next}
						<a class="pn next" href={`/posts/${article.next.slug}`}>
							<div class="lbl">下一篇 →</div>
							<div class="ttl">{article.next.title}</div>
						</a>
					{:else}
						<span></span>
					{/if}
				</div>
			</RevealItem>
		</article>

		<TableOfContents items={article.toc} />
		<CommentSection url={`/posts/${article.slug}`} title={article.title} />
	</div>
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
	}

	/* 面包屑 */
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--muted);
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}
	.breadcrumb a {
		color: var(--dim);
		text-decoration: none;
		transition: color 0.2s var(--ease);
	}
	.breadcrumb a:hover {
		color: var(--accent);
	}
	.breadcrumb .current {
		color: var(--muted);
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.article {
		display: grid;
		grid-template-columns: 1fr 220px;
		gap: 2.4rem;
		align-items: start;
	}
	.body {
		min-width: 0;
	}
	:global(.post-hero-wrap) {
		margin-bottom: 1.6rem;
	}
	.post-hero {
		position: relative;
		border-radius: var(--r-md);
		overflow: hidden;
		height: 240px;
		box-shadow: var(--shadow-sm);
		border: var(--pixel-border);
	}
	.post-hero img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.post-hero .badge {
		position: absolute;
		left: 1.2rem;
		bottom: 1.1rem;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.1em;
		color: var(--on-accent);
		background: color-mix(in oklch, var(--bg) 55%, transparent);
		backdrop-filter: blur(4px);
		padding: 0.3rem 0.7rem;
		border-radius: var(--r-sm);
	}
	.a-title {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: clamp(1.8rem, 4vw, 2.6rem);
		line-height: 1.25;
		letter-spacing: 0.01em;
	}
	.a-meta {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--muted);
		margin: 1rem 0 1.6rem;
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: center;
	}
	.a-meta span {
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}
	.a-meta b {
		color: var(--fg);
		font-weight: 500;
	}
	.a-meta .meta-updated {
		color: var(--accent);
	}
	.a-meta .wc {
		color: var(--faint);
	}
	.a-meta .wc::before,
	.a-meta .views::before {
		content: '·';
		margin-right: 0.5rem;
		color: var(--border);
	}
	.a-meta .views {
		color: var(--faint);
	}

	.prose {
		font-size: 1rem;
		line-height: 1.85;
		color: var(--fg);
	}
	.prose :global(h2) {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 1.5rem;
		margin: 2.2rem 0 0.9rem;
		padding-left: 0.8rem;
		border-left: 3px solid var(--accent);
	}
	.prose :global(h3) {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 1.2rem;
		margin: 1.7rem 0 0.7rem;
	}
	.prose :global(p) {
		margin: 1rem 0;
		color: var(--dim);
	}
	.prose :global(a) {
		color: var(--link);
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-thickness: 1px;
	}
	.prose :global(strong) {
		color: var(--fg);
		font-weight: 700;
	}
	.prose :global(blockquote) {
		margin: 1.4rem 0;
		padding: 1rem 1.3rem;
		background: var(--accent-soft);
		border-left: 3px solid var(--accent);
		border-radius: 0 var(--r-sm) var(--r-sm) 0;
		color: var(--fg);
		font-family: var(--font-body);
		font-style: italic;
		line-height: 1.8;
	}
	.prose :global(ul),
	.prose :global(ol) {
		margin: 1rem 0 1rem 1.2rem;
		color: var(--dim);
	}
	.prose :global(li) {
		margin: 0.4rem 0;
	}
	.prose :global(pre) {
		margin: 1.4rem 0;
		border-radius: var(--r-md);
		padding: 1.1rem 1.2rem;
		overflow: auto;
		background: var(--code-bg);
		color: var(--code-fg);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1.7;
		box-shadow: var(--shadow-sm);
	}
	.prose :global(pre code) {
		font-family: var(--font-mono);
	}
	.prose :global(code:not(pre code)) {
		font-family: var(--font-mono);
		font-size: 0.85em;
		background: var(--accent-soft);
		color: var(--accent);
		padding: 0.1rem 0.35rem;
		border-radius: var(--r-sm);
	}
	.prose :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: var(--r-md);
		margin: 1.2rem 0;
		box-shadow: var(--shadow-sm);
		cursor: zoom-in;
	}
	.prose :global(hr) {
		border: none;
		border-top: 1px dashed var(--border);
		margin: 2rem 0;
	}

	/* 四级标题 */
	.prose :global(h4) {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 1.05rem;
		margin: 1.5rem 0 0.6rem;
		color: var(--fg);
	}

	/* 五级、六级标题 */
	.prose :global(h5),
	.prose :global(h6) {
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: 0.9rem;
		margin: 1.3rem 0 0.5rem;
		color: var(--dim);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	/* 斜体 */
	.prose :global(em) {
		font-style: italic;
		color: var(--dim);
	}

	/* 删除线 */
	.prose :global(del) {
		text-decoration: line-through;
		color: var(--muted);
		opacity: 0.7;
	}

	/* 表格容器 */
	.prose :global(.table-wrapper) {
		overflow-x: auto;
		margin: 1.4rem 0;
	}

	/* 表格 */
	.prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		border: var(--pixel-border);
	}

	.prose :global(thead) {
		background: var(--surface);
	}

	.prose :global(th) {
		font-family: var(--font-mono);
		font-weight: 600;
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--accent);
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 2px solid var(--border);
	}

	.prose :global(td) {
		padding: 0.65rem 1rem;
		border-bottom: 1px solid var(--border-l);
		color: var(--dim);
	}

	.prose :global(tr:hover) {
		background: var(--surface-h);
	}

	.prose :global(tr:last-child td) {
		border-bottom: none;
	}

	/* 任务列表 */
	.prose :global(.task-list-item) {
		list-style: none;
		margin-left: -1.2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.prose :global(.task-list-item input[type='checkbox']) {
		appearance: none;
		width: 14px;
		height: 14px;
		border: 2px solid var(--border);
		border-radius: var(--r-sm);
		background: var(--surface);
		cursor: pointer;
		position: relative;
		transition: all 0.2s var(--ease);
	}

	.prose :global(.task-list-item input[type='checkbox']:checked) {
		background: var(--accent);
		border-color: var(--accent);
	}

	.prose :global(.task-list-item input[type='checkbox']:checked::after) {
		content: '✓';
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 9px;
		color: var(--on-accent);
	}

	/* 上标、下标 */
	.prose :global(sup),
	.prose :global(sub) {
		font-size: 0.75em;
		line-height: 0;
	}

	/* 高亮标记 */
	.prose :global(mark) {
		background: color-mix(in oklch, var(--accent) 20%, transparent);
		color: var(--fg);
		padding: 0.1rem 0.25rem;
		border-radius: var(--r-sm);
	}

	/* 脚注 */
	.prose :global(.footnotes) {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px dashed var(--border);
		font-size: 0.8125rem;
	}

	.prose :global(.footnotes ol) {
		margin-left: 0;
		padding-left: 1.2rem;
	}

	.prose :global(.footnote-backref) {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		margin-left: 0.3rem;
	}

	/* 定义列表 */
	.prose :global(dl) {
		margin: 1rem 0;
	}

	.prose :global(dt) {
		font-weight: 600;
		color: var(--fg);
		margin-top: 0.8rem;
	}

	.prose :global(dd) {
		margin-left: 1.2rem;
		color: var(--dim);
	}

	/* 缩写 */
	.prose :global(abbr) {
		border-bottom: 1px dotted var(--muted);
		cursor: help;
	}

	/* 键盘按键 */
	.prose :global(kbd) {
		font-family: var(--font-mono);
		font-size: 0.8em;
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		padding: 0.15rem 0.4rem;
		box-shadow: var(--shadow-sm);
	}

	/* 版权声明 */
	.copyright-notice {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		background: var(--accent-soft);
		border: var(--pixel-border);
		border-left: 3px solid var(--accent);
		border-radius: 0 var(--r-md) var(--r-md) 0;
		padding: 1rem 1.2rem;
		margin: 1.5rem 0;
	}
	.copyright-icon {
		font-size: 1.4rem;
		color: var(--accent);
		line-height: 1;
		margin-top: 0.1rem;
	}
	.copyright-text p {
		font-size: 0.75rem;
		color: var(--dim);
		line-height: 1.7;
		margin: 0;
	}
	.copyright-text b {
		color: var(--fg);
		font-weight: 600;
	}
	.copyright-text a {
		color: var(--link);
		text-decoration: none;
		word-break: break-all;
	}
	.copyright-text .license {
		margin-top: 0.5rem;
		color: var(--muted);
		font-size: 11px;
	}

	.author-card {
		display: flex;
		gap: 1.1rem;
		align-items: center;
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		padding: 1.4rem;
		box-shadow: var(--shadow-sm);
		margin: 2rem 0;
	}
	.author-card .ava {
		width: 64px;
		height: 64px;
		border-radius: var(--r-sm);
		flex: 0 0 auto;
		object-fit: cover;
		border: var(--pixel-border);
		box-shadow: var(--shadow-sm);
	}
	.author-card .info h4 {
		font-family: var(--font-body);
		font-size: 1.1rem;
	}
	.author-card .info p {
		font-size: 0.75rem;
		color: var(--dim);
		margin-top: 0.3rem;
		line-height: 1.6;
	}
	.author-card .links {
		margin-left: auto;
		display: flex;
		gap: 0.5rem;
	}

	/* 相关文章 */
	.related-posts {
		margin: 2rem 0;
	}
	.related-title {
		font-family: var(--font-body);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--fg);
		margin-bottom: 0.8rem;
		padding-left: 0.8rem;
		border-left: 3px solid var(--accent);
	}
	.related-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.8rem;
	}
	.related-card {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		background: var(--surface);
		border: var(--pixel-border);
		padding: 0.9rem 1rem;
		text-decoration: none;
		transition:
			border-color 0.2s var(--ease),
			transform 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.related-card:hover {
		border-color: var(--accent);
		transform: translate(-2px, -2px);
		box-shadow: var(--pixel-shadow-hover);
	}
	.related-cat {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.1em;
		color: var(--muted);
		text-transform: uppercase;
	}
	.related-name {
		font-family: var(--font-body);
		font-size: 13px;
		color: var(--fg);
		font-weight: 600;
		line-height: 1.4;
		transition: color 0.2s var(--ease);
	}
	.related-card:hover .related-name {
		color: var(--accent);
	}
	.related-date {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--faint);
		margin-top: auto;
	}

	.pager-prevnext {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin: 2rem 0;
	}
	.pn {
		background: var(--surface);
		border: var(--pixel-border);
		padding: 1.1rem 1.3rem;
		box-shadow: var(--pixel-shadow);
		transition:
			border-color 0.2s var(--ease),
			transform 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.pn:hover {
		border-color: var(--accent);
		transform: translate(-2px, -2px);
		box-shadow: var(--pixel-shadow-hover);
	}
	.pn .lbl {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.1em;
		color: var(--muted);
		text-transform: uppercase;
	}
	.pn .ttl {
		font-family: var(--font-body);
		font-size: 1rem;
		margin-top: 0.4rem;
		line-height: 1.4;
		color: var(--fg);
		transition: color 0.2s var(--ease);
	}
	.pn.next {
		text-align: right;
	}
	.pn:hover .ttl {
		color: var(--accent);
	}

	@media (max-width: 900px) {
		.article {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 900px) {
		.post-hero {
			height: 180px;
		}
		.prose :global(h2) {
			font-size: 1.3rem;
			padding-left: 0.6rem;
		}
		.a-meta {
			gap: 0.6rem;
		}
		.related-grid {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 680px) {
		.pager-prevnext {
			grid-template-columns: 1fr;
		}
		.author-card {
			flex-direction: column;
			text-align: center;
		}
		.author-card .info {
			text-align: center;
		}
		.author-card .links {
			margin-left: 0;
			justify-content: center;
		}
	}

	/* 打印样式 */
	@media print {
		:global(.breadcrumb),
		:global(.progress-bar),
		:global(.toc),
		:global(.comments),
		:global(.share-bar),
		:global(.pager-prevnext),
		:global(.related-posts),
		:global(.copyright-notice .copyright-icon) {
			display: none !important;
		}
		.page {
			margin: 0;
		}
		.article {
			display: block;
		}
		.prose {
			font-size: 12pt;
			line-height: 1.6;
		}
		.a-title {
			font-size: 20pt;
		}
		.prose :global(pre) {
			white-space: pre-wrap;
			word-wrap: break-word;
			box-shadow: none;
			border: 1px solid #ccc;
		}
		.prose :global(img) {
			max-width: 100%;
			box-shadow: none;
		}
		.author-card,
		.copyright-notice {
			box-shadow: none;
			break-inside: avoid;
		}
	}
</style>
