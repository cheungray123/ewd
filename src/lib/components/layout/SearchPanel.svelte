<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { Search, FileText, Camera, X, CornerDownLeft } from 'svelte-lucide';
	import { site } from '$lib/settings/site';
	import { initSearchIndex, search, type SearchResult } from '$lib/utils/search';
	import { getPostCards, getAlbums } from '$lib/utils/loaders';
	import type { PostCard } from '$lib/types';

	interface Props {
		open: boolean;
		onNavigate?: () => void;
	}
	let { open, onNavigate }: Props = $props();

	let searchQuery = $state('');
	let results = $state<SearchResult[]>([]);
	let inputEl = $state<HTMLInputElement | null>(null);
	let activeIndex = $state(0);

	// 热门文章（未搜索时显示）
	let popularPosts = $state<PostCard[]>([]);

	// 初始化搜索索引（仅在客户端执行一次）
	onMount(() => {
		const posts = getPostCards();
		const albums = getAlbums();
		popularPosts = posts.slice(0, 6);

		const items = [
			...posts.map((p) => ({
				type: 'post' as const,
				slug: p.slug,
				title: p.title,
				excerpt: p.excerpt,
				category: p.category
			})),
			...albums.map((a) => ({
				type: 'photo' as const,
				slug: a.slug,
				title: a.title,
				excerpt: `${a.count} · ${a.year}`,
				category: 'photo'
			}))
		];
		initSearchIndex(items);
	});

	// 面板打开时自动聚焦输入框并重置状态
	$effect(() => {
		if (open) {
			searchQuery = '';
			results = [];
			activeIndex = 0;
			tick().then(() => inputEl?.focus());
		}
	});

	// 搜索查询响应（debounce 150ms）
	$effect(() => {
		const q = searchQuery.trim();
		activeIndex = 0;
		if (!q) {
			results = [];
			return;
		}
		const timer = setTimeout(() => {
			results = search(q, 8);
		}, 150);
		return () => clearTimeout(timer);
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onNavigate?.();
			return;
		}

		const list = searchQuery.trim() ? results : [];
		if (list.length === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = (activeIndex + 1) % list.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = (activeIndex - 1 + list.length) % list.length;
		} else if (e.key === 'Enter' && list[activeIndex]) {
			e.preventDefault();
			onNavigate?.();
			window.location.href = list[activeIndex].href;
		}
	}

	function handleResultClick(r: SearchResult) {
		onNavigate?.();
	}

	function handlePopularClick(slug: string) {
		onNavigate?.();
	}
</script>

{#if open}
	<!-- 遮罩层 -->
	<button
		class="search-overlay"
		transition:fade={{ duration: 200 }}
		onclick={onNavigate}
		aria-label="关闭搜索"
		tabindex="-1"
	></button>

	<!-- 搜索面板（屏幕中央） -->
	<div
		class="search-modal"
		transition:scale={{ duration: 200, start: 0.96, opacity: 0 }}
		role="dialog"
		aria-modal="true"
		aria-label="搜索"
	>
		<!-- 搜索框 -->
		<div class="search-form" role="search">
			<Search size="20" strokeWidth="1.8" class="search-icon" />
			<input
				bind:this={inputEl}
				class="search-input"
				type="text"
				name="q"
				placeholder={site.searchPlaceholder}
				aria-label="搜索关键词"
				bind:value={searchQuery}
				onkeydown={handleKeydown}
				autocomplete="off"
			/>
			{#if searchQuery}
				<button
					class="search-clear"
					type="button"
					aria-label="清空"
					onclick={() => (searchQuery = '')}
				>
					<X size="16" strokeWidth="2" />
				</button>
			{/if}
			<button class="search-close" type="button" aria-label="关闭搜索" onclick={onNavigate}>
				ESC
			</button>
		</div>

		<!-- 搜索结果 / 热门文章 -->
		<div class="search-body">
			{#if searchQuery.trim()}
				{#if results.length > 0}
					<div class="result-header">
						<span>{results.length} 条结果</span>
					</div>
					<ul class="result-list" role="listbox">
						{#each results as r, i (r.slug)}
							<li>
								<a
									href={r.href}
									class="result-item"
									class:active={i === activeIndex}
									onclick={() => handleResultClick(r)}
									onmouseenter={() => (activeIndex = i)}
									role="option"
									aria-selected={i === activeIndex}
								>
									<span
										class="r-icon"
										class:is-post={r.type === 'post'}
										class:is-photo={r.type === 'photo'}
									>
										{#if r.type === 'post'}
											<FileText size="16" strokeWidth="1.6" />
										{:else}
											<Camera size="16" strokeWidth="1.6" />
										{/if}
									</span>
									<div class="r-info">
										<b>{r.title}</b>
										<small>{r.excerpt}</small>
									</div>
									{#if i === activeIndex}
										<span class="r-enter"><CornerDownLeft size="14" strokeWidth="1.8" /></span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="search-empty">
						<p>未找到与「{searchQuery.trim()}」匹配的结果</p>
					</div>
				{/if}
			{:else}
				<!-- 默认显示热门文章 -->
				<div class="result-header">
					<span>热门文章</span>
				</div>
				<ul class="result-list">
					{#each popularPosts as item, i (item.slug)}
						<li>
							<a
								href={`/posts/${item.slug}`}
								class="result-item"
								class:active={i === activeIndex}
								onclick={() => handlePopularClick(item.slug)}
								onmouseenter={() => (activeIndex = i)}
							>
								<span class="r-icon is-post">
									<FileText size="16" strokeWidth="1.6" />
								</span>
								<div class="r-info">
									<b>{item.title}</b>
									<small>{item.excerpt}</small>
								</div>
								{#if i === activeIndex}
									<span class="r-enter"><CornerDownLeft size="14" strokeWidth="1.8" /></span>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}

<style>
	.search-overlay {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		background: color-mix(in oklch, var(--bg) 40%, transparent);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: var(--z-modal-backdrop);
		cursor: pointer;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
	}

	:global([data-theme='dark']) .search-overlay {
		background: color-mix(in oklch, var(--bg) 60%, transparent);
	}

	.search-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(640px, 92vw);
		max-height: min(560px, 80vh);
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-lg);
		box-shadow: var(--shadow-lg);
		z-index: var(--z-modal);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* 搜索框 */
	.search-form {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.9rem 1.2rem;
		border-bottom: 1px solid var(--border-l);
		flex-shrink: 0;
	}
	.search-form :global(.search-icon) {
		color: var(--dim);
		flex-shrink: 0;
	}
	.search-input {
		flex: 1 1 auto;
		min-width: 0;
		border: none;
		background: transparent;
		color: var(--fg);
		font-size: 1rem;
		font-family: var(--font-body);
		outline: none;
	}
	.search-input::placeholder {
		color: var(--faint);
	}
	.search-clear {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border: none;
		background: var(--border);
		color: var(--fg);
		border-radius: var(--r-sm);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background 0.2s var(--ease),
			color 0.2s var(--ease);
	}
	.search-clear:hover {
		background: var(--accent);
		color: var(--on-accent);
	}
	.search-close {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.08em;
		color: var(--muted);
		background: var(--bg);
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		padding: 0.3rem 0.55rem;
		cursor: pointer;
		transition:
			border-color 0.2s var(--ease),
			color 0.2s var(--ease);
	}
	.search-close:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	/* 搜索结果区 */
	.search-body {
		overflow-y: auto;
		flex: 1;
		padding: 0.5rem 0.6rem 0.6rem;
	}

	.result-header {
		padding: 0.5rem 0.7rem 0.35rem;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--faint);
	}

	.result-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.result-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.7rem 0.75rem;
		border-radius: var(--r-sm);
		text-decoration: none;
		color: inherit;
		transition: background 0.15s var(--ease);
		position: relative;
	}
	.result-item:hover,
	.result-item.active {
		background: var(--accent-soft);
	}

	.r-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--r-sm);
		flex-shrink: 0;
	}
	.r-icon.is-post {
		background: var(--accent-soft);
		color: var(--accent);
	}
	.r-icon.is-photo {
		background: var(--accent-soft);
		color: var(--warn);
	}

	.r-info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
		flex: 1;
	}
	.r-info b {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--fg);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.r-info small {
		font-size: 0.6875rem;
		color: var(--dim);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.r-enter {
		flex-shrink: 0;
		color: var(--accent);
		opacity: 0.7;
	}

	.search-empty {
		padding: 2.5rem 1rem;
		text-align: center;
	}
	.search-empty p {
		font-size: 0.8125rem;
		color: var(--dim);
		line-height: 1.6;
	}

	@media (max-width: 680px) {
		.search-modal {
			width: 94vw;
			max-height: 78vh;
		}
		.search-form {
			padding: 0.75rem 1rem;
		}
		.search-input {
			font-size: 0.8125rem;
		}
		.search-close {
			display: none;
		}
	}
</style>
