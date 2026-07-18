<script lang="ts">
	/**
	 * PostReference — 文章引用卡片组件
	 *
	 * 在 Markdown 中通过 slug 引用站内其他文章，显示为紧凑的卡片链接。
	 *
	 * 短代码写法（推荐）：
	 * ```md
	 * ::post slug="my-article"
	 * ::post my-article          （简写，slug 不带引号）
	 * ```
	 *
	 * 也可以直接用 Svelte 组件语法：
	 * ```md
	 * <PostReference slug="my-article" />
	 * ```
	 */

	import { getPostCard } from '$lib/utils/loaders';
	import { FileText } from 'svelte-lucide';

	interface Props {
		/** 文章 slug */
		slug: string;
	}

	let { slug }: Props = $props();

	let post = $derived(getPostCard(slug));
</script>

{#if post}
	<a class="post-ref" href={`/posts/${post.slug}`}>
		<div class="pr-icon">
			<FileText size="18" />
		</div>
		<div class="pr-body">
			<span class="pr-cat">{post.category}</span>
			<span class="pr-title">{post.title}</span>
			{#if post.excerpt}
				<span class="pr-excerpt">{post.excerpt}</span>
			{/if}
			<span class="pr-meta">
				<span>{post.date}</span>
				<span class="sep">·</span>
				<span>{post.readTime}</span>
				{#if post.wordCount}
					<span class="sep">·</span>
					<span class="wc">{post.wordCount}</span>
				{/if}
			</span>
		</div>
		<span class="pr-arrow">→</span>
	</a>
{:else}
	<div class="post-ref-error">
		未找到 slug 为「{slug}」的文章，请检查 slug 是否正确。
	</div>
{/if}

<style>
	/* CSS 隔离：防止 .prose 全局样式污染 */
	:global(.prose .post-ref) {
		all: revert;
	}

	/* ===== 终端风格文章引用卡片 ===== */
	.post-ref {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin: 1.5rem 0;
		padding: 1rem 1.1rem;
		background: var(--surface);
		border: var(--pixel-border);
		box-shadow: var(--pixel-shadow);
		text-decoration: none !important;
		color: inherit;
		position: relative;
		transition:
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease),
			transform 0.15s var(--ease);
		isolation: isolate;
	}

	.post-ref:hover {
		border-color: var(--accent);
		box-shadow: var(--pixel-shadow-hover);
		transform: translate(-2px, -2px);
	}

	.post-ref:hover::before {
		background: var(--accent-2);
	}

	.post-ref:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	/* 图标 - 终端风格 */
	.pr-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: var(--bg);
		border: var(--pixel-border);
		color: var(--accent);
		flex-shrink: 0;
		transition:
			border-color 0.2s var(--ease),
			color 0.2s var(--ease);
	}

	.post-ref:hover .pr-icon {
		border-color: var(--accent);
		color: var(--accent-2);
	}

	/* 内容区域 */
	.pr-body {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex: 1;
		min-width: 0;
	}

	/* 分类标签 - 像素风格 */
	.pr-cat {
		display: inline-flex;
		align-self: flex-start;
		background: transparent;
		color: var(--accent);
		font-family: var(--font-pixel);
		font-size: 7px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 0.15rem 0.4rem;
		border: 1px solid var(--accent);
		transition:
			border-color 0.2s var(--ease),
			color 0.2s var(--ease),
			background 0.2s var(--ease);
	}

	.post-ref:hover .pr-cat {
		background: var(--accent);
		color: var(--on-accent);
	}

	/* 标题 */
	.pr-title {
		font-size: 14px;
		font-weight: 600;
		line-height: 1.45;
		color: var(--fg);
		transition: color 0.2s var(--ease);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.post-ref:hover .pr-title {
		color: var(--accent);
	}

	/* 摘要 */
	.pr-excerpt {
		font-size: 12px;
		color: var(--dim);
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* 元信息 - 等宽字体 */
	.pr-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--muted);
		margin-top: 0.2rem;
	}

	.pr-meta .sep {
		color: var(--faint);
	}

	.pr-meta .wc {
		color: var(--accent-3);
	}

	/* 箭头指示器 */
	.pr-arrow {
		display: flex;
		align-items: center;
		font-family: var(--font-pixel);
		font-size: 10px;
		color: var(--accent);
		opacity: 0;
		transform: translateX(-6px);
		transition:
			opacity 0.2s var(--ease),
			transform 0.2s var(--ease),
			color 0.2s var(--ease);
		flex-shrink: 0;
		padding-left: 0.5rem;
	}

	.post-ref:hover .pr-arrow {
		opacity: 1;
		transform: translateX(0);
		color: var(--accent-2);
	}

	/* 错误状态 */
	.post-ref-error {
		margin: 1.5rem 0;
		padding: 1rem 1.1rem;
		background: var(--surface);
		border: 1px dashed var(--accent-2);
		box-shadow: var(--pixel-shadow);
		color: var(--accent-2);
		font-family: var(--font-mono);
		font-size: 12px;
		position: relative;
	}

	.post-ref-error::before {
		content: '!';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--accent-2);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-pixel);
		font-size: 8px;
	}

	/* 移动端适配 */
	@media (max-width: 680px) {
		.post-ref {
			padding: 0.85rem 0.9rem;
			gap: 0.6rem;
		}

		.pr-icon {
			width: 32px;
			height: 32px;
		}

		.pr-title {
			font-size: 13px;
			-webkit-line-clamp: 3;
			line-clamp: 3;
		}

		.pr-excerpt {
			display: none;
		}

		.pr-arrow {
			display: none;
		}
	}
</style>
