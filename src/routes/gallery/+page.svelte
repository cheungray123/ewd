<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import PageHead from '$lib/components/shared/PageHead.svelte';
	import Filters from '$lib/components/shared/Filters.svelte';
	import Pager from '$lib/components/shared/Pager.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import AlbumCard from '$lib/components/photos/AlbumCard.svelte';
	import RevealItem from '$lib/components/shared/RevealItem.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import { galleryPageHead, paginationConfig } from '$lib/settings/pages';
	import { filterPagination } from '$lib/utils/filterPagination.svelte';
	import { easeOut } from '$lib/utils/motion';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const fp = filterPagination(
		'/gallery',
		paginationConfig.gallery,
		() => data.albums,
		(a, cat) => a.category === cat
	);

	let pageHead = $derived({
		...galleryPageHead,
		count: data.count
	});

	let seoTitle = $derived(fp.activeFilter === '全部' ? '相册' : `${fp.activeFilter} · 相册`);
</script>

<Seo title={seoTitle} description="東风博客的照片相册，展示旅途风景和生活瞬间" type="website" />

<main id="main" class="page" tabindex="-1">
	<RevealItem variant="up">
		<PageHead
			title={pageHead.title}
			en={pageHead.en}
			desc={pageHead.desc}
			count={pageHead.count}
			variant="secondary"
		/>
	</RevealItem>

	<RevealItem variant="fade" delay={0.08}>
		<Filters options={data.categories} active={fp.activeFilter} onchange={fp.handleFilterChange} />
	</RevealItem>

	<div class="album-grid">
		{#each fp.paged as album, i (album.slug)}
			<div
				class="album-cell"
				animate:flip={{ duration: 400, easing: easeOut }}
				in:fly={{ y: 16, duration: 400, easing: easeOut }}
				out:scale={{ start: 0.95, duration: 200, easing: easeOut }}
			>
				<RevealItem delay={i * 0.06}>
					<AlbumCard {album} href="/gallery/{album.slug}" />
				</RevealItem>
			</div>
		{/each}
	</div>

	{#if fp.paged.length === 0}
		<EmptyState
			message="「{fp.activeFilter}」分类下暂无相册"
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
	:global(.album-grid) {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.9rem;
		margin-top: 1.6rem;
	}
	:global(.album-cell) {
		will-change: transform, opacity;
	}

	@media (max-width: 900px) {
		:global(.album-grid) {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 680px) {
		:global(.album-grid) {
			grid-template-columns: 1fr;
		}
	}
</style>
