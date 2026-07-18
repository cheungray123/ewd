<script lang="ts">
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { Link, ChevronLeft, ChevronRight } from 'svelte-lucide';
	import PostCard from '$lib/components/home/PostCard.svelte';
	import RevealItem from '$lib/components/shared/RevealItem.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import { easeOut } from '$lib/utils/motion';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// 分页
	const PER_PAGE = 10;
	let currentPage = $state(1);

	let totalPages = $derived(Math.ceil(data.posts.length / PER_PAGE));
	let pagedPosts = $derived(data.posts.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE));

	function goToPage(page: number) {
		if (page < 1 || page > totalPages) return;
		currentPage = page;
		// 滚动到列表顶部
		document.getElementById('main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	// 生成页码数组（带省略号）
	let pageNumbers = $derived.by(() => {
		const pages: (number | '...')[] = [];
		const total = totalPages;
		const current = currentPage;

		if (total <= 7) {
			for (let i = 1; i <= total; i++) pages.push(i);
			return pages;
		}

		pages.push(1);
		if (current > 3) pages.push('...');

		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);
		for (let i = start; i <= end; i++) pages.push(i);

		if (current < total - 2) pages.push('...');
		pages.push(total);
		return pages;
	});
</script>

<Seo
	title={`标签：${data.tag}`}
	description={`标签「${data.tag}」下的全部文章，共 ${data.count}。`}
/>

<main id="main" class="page" tabindex="-1">
	<RevealItem variant="up">
		<div class="tag-head">
			<Link size="16" strokeWidth="1.6" />
			<span class="tag-label">标签</span>
			<h1 class="tag-title">{data.tag}</h1>
			<span class="tag-count">{data.count}</span>
			<a class="all-tags" href="/archive">全部归档 →</a>
		</div>
	</RevealItem>

	<div class="post-grid">
		{#each pagedPosts as post, i (post.slug)}
			<div
				class="post-cell"
				animate:flip={{ duration: 400, easing: easeOut }}
				in:fly={{ y: 16, duration: 400, easing: easeOut }}
			>
				<RevealItem delay={i * 0.06}>
					<PostCard {post} href="/posts/{post.slug}" />
				</RevealItem>
			</div>
		{/each}
	</div>

	{#if totalPages > 1}
		<nav class="pagination" aria-label="分页">
			<button
				class="page-btn"
				class:disabled={currentPage <= 1}
				onclick={() => goToPage(currentPage - 1)}
				aria-label="上一页"
				disabled={currentPage <= 1}
			>
				<ChevronLeft size="16" strokeWidth="1.6" />
			</button>

			{#each pageNumbers as pn (pn)}
				{#if pn === '...'}
					<span class="page-ellipsis">…</span>
				{:else}
					<button
						class="page-num"
						class:active={pn === currentPage}
						onclick={() => goToPage(pn)}
						aria-label={`第 ${pn} 页`}
						aria-current={pn === currentPage ? 'page' : undefined}
					>
						{pn}
					</button>
				{/if}
			{/each}

			<button
				class="page-btn"
				class:disabled={currentPage >= totalPages}
				onclick={() => goToPage(currentPage + 1)}
				aria-label="下一页"
				disabled={currentPage >= totalPages}
			>
				<ChevronRight size="16" strokeWidth="1.6" />
			</button>
		</nav>
	{/if}
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
	}
	.tag-head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 2rem;
		color: var(--muted);
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.04em;
	}
	.tag-label {
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.tag-title {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 1.5rem;
		color: var(--fg);
		letter-spacing: -0.01em;
	}
	.tag-count {
		color: var(--accent);
		font-weight: 500;
	}
	.all-tags {
		margin-left: auto;
		color: var(--link);
		text-decoration: none;
		font-size: 0.625rem;
		letter-spacing: 0.04em;
		transition: color 0.2s var(--ease);
	}
	.all-tags:hover {
		color: var(--accent);
	}

	:global(.post-grid) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.1rem;
	}
	:global(.post-cell) {
		will-change: transform, opacity;
	}
	@media (max-width: 680px) {
		:global(.post-grid) {
			grid-template-columns: 1fr;
		}
	}

	/* 分页 */
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		margin-top: 2.5rem;
	}
	.page-btn,
	.page-num {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 36px;
		height: 36px;
		padding: 0 0.5rem;
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		background: var(--surface);
		color: var(--dim);
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.04em;
		transition:
			border-color 0.2s var(--ease),
			color 0.2s var(--ease),
			background 0.2s var(--ease);
	}
	.page-btn:hover:not(.disabled),
	.page-num:hover:not(.active) {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}
	.page-btn.disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.page-num.active {
		border-color: var(--accent);
		background: var(--accent);
		color: var(--on-accent);
		font-weight: 600;
	}
	.page-ellipsis {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		height: 36px;
		color: var(--muted);
		font-family: var(--font-mono);
		font-size: 0.625rem;
	}
</style>
