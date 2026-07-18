<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import PageHead from '$lib/components/shared/PageHead.svelte';
	import Filters from '$lib/components/shared/Filters.svelte';
	import Pager from '$lib/components/shared/Pager.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import PostCard from '$lib/components/home/PostCard.svelte';
	import RevealItem from '$lib/components/shared/RevealItem.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import { postsPageHead, paginationConfig } from '$lib/settings/pages';
	import { filterPagination } from '$lib/utils/filterPagination.svelte';
	import { easeOut } from '$lib/utils/motion';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const fp = filterPagination(
		'/posts',
		paginationConfig.posts,
		() => data.posts,
		(a, cat) => a.category === cat
	);

	let pageHead = $derived({
		...postsPageHead,
		count: data.count
	});
</script>

<Seo
	title="文章"
	description="東风博客的文章列表，包含技术博客、生活记录和教程文章"
	type="website"
/>

<main id="main" class="page" tabindex="-1">
	<RevealItem variant="up">
		<PageHead
			title={pageHead.title}
			en={pageHead.en}
			desc={pageHead.desc}
			count={pageHead.count}
			variant="default"
		/>
	</RevealItem>

	<RevealItem variant="fade" delay={0.08}>
		<Filters options={data.categories} active={fp.activeFilter} onchange={fp.handleFilterChange} />
	</RevealItem>

	<div class="post-grid">
		{#each fp.paged as post, i (post.slug)}
			<div
				class="post-cell"
				animate:flip={{ duration: 400, easing: easeOut }}
				in:fly={{ y: 16, duration: 400, easing: easeOut }}
				out:scale={{ start: 0.95, duration: 200, easing: easeOut }}
			>
				<RevealItem delay={i * 0.06}>
					<PostCard {post} href="/posts/{post.slug}" />
				</RevealItem>
			</div>
		{/each}
	</div>

	{#if fp.paged.length === 0}
		<EmptyState
			message="「{fp.activeFilter}」分类下暂无文章"
			resetLabel="查看全部"
			onReset={() => fp.handleFilterChange('全部')}
		/>
	{/if}

	<Pager items={fp.pagerItems} />
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
	}
	:global(.post-grid) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.1rem;
	}
	:global(.post-cell) {
		will-change: transform, opacity;
	}
	@media (max-width: 900px) {
		:global(.post-grid) {
			grid-template-columns: 1fr;
		}
	}
</style>
