<script lang="ts">
	import StatusTicker from '$lib/components/home/StatusTicker.svelte';
	import Hero from '$lib/components/home/Hero.svelte';
	import ModuleHead from '$lib/components/home/ModuleHead.svelte';
	import PostCard from '$lib/components/home/PostCard.svelte';
	import PhotoCard from '$lib/components/home/PhotoCard.svelte';
	import RevealItem from '$lib/components/shared/RevealItem.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import { site } from '$lib/settings/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo title={site.title} description={site.description} type="website" />

<main id="main" class="page" tabindex="-1">
	<StatusTicker />

	<Hero stats={data.heroStats} latestMoment={data.latestMoment} />

	<section class="module" id="posts" aria-label="文章">
		<ModuleHead
			idx="01"
			title="文章"
			en="POSTS"
			count={`${data.postCount} 篇`}
			href="/posts"
			variant="default"
		/>
		<div class="posts">
			{#each data.featuredPosts as post, i (post.slug)}
				<RevealItem delay={i * 0.06} class={post.pinned ? 'is-pinned' : ''}>
					<PostCard {post} href="/posts/{post.slug}" />
				</RevealItem>
			{/each}
		</div>
	</section>

	<section class="module" id="photos" aria-label="相册">
		<ModuleHead
			idx="02"
			title="相册"
			en="GALLERY"
			count={`${data.photoCount} 组`}
			href="/gallery"
			variant="tertiary"
		/>
		<div class="photos">
			{#each data.featuredPhotos as photo, i (photo.slug)}
				<RevealItem delay={i * 0.06}>
					<PhotoCard {photo} href="/gallery/{photo.slug}" variant={'p' + (i + 1)} />
				</RevealItem>
			{/each}
		</div>
	</section>
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
	}
	.module {
		margin-bottom: var(--sp-xl);
		scroll-margin-top: 5.5rem;
	}
	:global(.posts) {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.1rem;
	}
	:global(.posts > .reveal) {
		display: flex;
		height: 100%;
	}
	:global(.posts > .reveal > *) {
		flex: 1;
		width: 100%;
	}
	:global(.posts > .reveal.is-pinned) {
		grid-column: span 2;
	}
	:global(.photos) {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.9rem;
	}

	@media (max-width: 900px) {
		:global(.posts) {
			grid-template-columns: repeat(2, 1fr);
		}
		:global(.photos) {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 680px) {
		:global(.photos) {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 440px) {
		:global(.posts) {
			grid-template-columns: 1fr;
		}
		:global(.posts > .reveal.is-pinned) {
			grid-column: span 1;
		}
	}
</style>
