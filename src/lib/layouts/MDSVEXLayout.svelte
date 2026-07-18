<script module>
	/**
	 * MDSVEXLayout — mdsvex 默认布局组件
	 *
	 * 在 mdsvex.config.ts 中通过 layout 选项引入。
	 * DOM 增强逻辑已抽离到 plugins/prose-enhancers.ts。
	 *
	 * 可用组件（在 .md 文件中直接使用）：
	 * - <Bilibili bvid="BV1xx411x7xx" />  嵌入 B 站视频
	 * - <MusicPlayer id="255020" />  网易云单曲播放
	 * - <MusicPlayer songs="255020,255021" />  多曲播放
	 * - <MusicPlayer playlist="7044354223" />  歌单播放
	 * - <MusicPlayer recommend />  每日推荐歌曲
	 * - <PostReference slug="my-article" />  引用站内文章
	 *
	 * 短代码写法（更简洁，推荐）：
	 * - ::music id="255020"
	 * - ::music songs="255020,255021"
	 * - ::music playlist="7044354223"
	 * - ::music recommend
	 * - ::music recommend compact  （精简模式）
	 * - ::post my-article  （引用文章，slug 不带引号）
	 * - ::post slug="my-article"
	 *
	 * 扩展自定义组件：
	 * 在此 <script module> 中继续 export 即可。
	 */
	export { default as Bilibili } from '$lib/components/article/Bilibili.svelte';
	export { default as MusicPlayer } from '$lib/components/article/MusicPlayer.svelte';
	export { default as PostReference } from '$lib/components/article/PostReference.svelte';
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import {
		enhanceCodeBlocks,
		lazyLoadImages,
		enhanceProseImages,
		renderMermaid,
		smoothAnchorScroll
	} from '../../../plugins/prose-enhancers';

	let { children } = $props();

	$effect(() => {
		if (!browser) return;
		enhanceCodeBlocks();
	});

	$effect(() => {
		if (!browser) return;
		lazyLoadImages();
	});

	$effect(() => {
		if (!browser) return;
		enhanceProseImages();
	});

	$effect(() => {
		if (!browser) return;
		return renderMermaid();
	});

	$effect(() => {
		if (!browser) return;
		return smoothAnchorScroll();
	});
</script>

{@render children?.()}

<style>
	:global(.prose pre) {
		position: relative;
		overflow-x: hidden;
		max-height: 500px;
	}
	:global(.prose pre.code-expanded) {
		max-height: none;
	}
	:global(.prose pre code) {
		overflow-x: auto;
		display: block;
	}

	:global(.code-copy-btn) {
		position: absolute;
		top: 0.3rem;
		right: 0.3rem;
		font-size: 11px;
		font-family: var(--font-mono);
		color: var(--muted);
		background: var(--accent-soft);
		border: none;
		padding: 2px 10px;
		border-radius: var(--r-sm);
		cursor: pointer;
		opacity: 0;
		transition:
			opacity 0.2s,
			color 0.2s;
		z-index: 2;
	}
	:global(.prose pre:hover .code-copy-btn) {
		opacity: 1;
	}
	:global(.code-copy-btn.copied) {
		color: var(--ok);
		opacity: 1;
	}

	:global(.code-expand-btn) {
		position: sticky;
		bottom: 0.3rem;
		display: block;
		margin-left: auto;
		width: fit-content;
		font-size: 11px;
		font-family: var(--font-mono);
		color: var(--muted);
		background: var(--accent-soft);
		border: none;
		padding: 2px 10px;
		border-radius: var(--r-sm);
		cursor: pointer;
		z-index: 2;
	}
	:global(.code-expand-btn:hover) {
		color: var(--accent);
	}

	/* ── 代码行号 ── */
	:global(.code-line-numbers) {
		position: absolute;
		left: 0;
		top: 1.1rem;
		bottom: 1.1rem;
		width: 2.4rem;
		text-align: right;
		padding-right: 0.6rem;
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.7;
		color: var(--muted);
		opacity: 0.4;
		user-select: none;
		pointer-events: none;
		border-right: 1px solid var(--border);
	}
	:global(.code-line-numbers span) {
		display: block;
	}
	:global([data-theme='dark'] .code-line-numbers) {
		color: var(--faint);
		border-right-color: var(--border-l);
	}

	/* ── 图片九宫格（remark-image-grid 生成） ── */
	:global(.prose .image-grid) {
		display: grid;
		gap: 0.5rem;
		margin: 1.2rem 0;
	}
	:global(.prose .image-grid[data-count='1']) {
		grid-template-columns: 1fr;
	}
	:global(.prose .image-grid[data-count='2']) {
		grid-template-columns: repeat(2, 1fr);
	}
	:global(.prose .image-grid[data-count='3']) {
		grid-template-columns: repeat(3, 1fr);
	}
	:global(.prose .image-grid[data-count='4']) {
		grid-template-columns: repeat(2, 1fr);
	}
	:global(.prose .image-grid[data-count='5']),
	:global(.prose .image-grid[data-count='6']),
	:global(.prose .image-grid[data-count='7']),
	:global(.prose .image-grid[data-count='8']),
	:global(.prose .image-grid[data-count='9']) {
		grid-template-columns: repeat(3, 1fr);
	}
	:global(.prose .image-grid p) {
		margin: 0;
	}
	:global(.prose .image-grid img) {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: var(--r-sm);
		cursor: pointer;
		transition:
			transform 0.2s var(--ease),
			opacity 0.2s var(--ease);
	}
	:global(.prose .image-grid[data-count='1'] img) {
		aspect-ratio: 16 / 9;
		max-width: 600px;
	}
	:global(.prose .image-grid img:hover) {
		opacity: 0.9;
		transform: scale(1.02);
	}
</style>
