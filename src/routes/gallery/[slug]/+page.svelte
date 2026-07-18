<script lang="ts">
	import { ChevronLeft, ChevronRight, Download } from 'svelte-lucide';
	import { fly } from 'svelte/transition';
	import PageHead from '$lib/components/shared/PageHead.svelte';
	import RevealItem from '$lib/components/shared/RevealItem.svelte';
	import { lightbox } from '$lib/stores/lightbox.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { easeOut } from '$lib/utils/motion';
	import type { LightboxItem } from '$lib/stores/lightbox.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import CommentSection from '$lib/components/comment/CommentSection.svelte';

	let { data }: { data: PageData } = $props();
	const photo = $derived(data.photo);
	const slug = $derived(page.params.slug);

	let currentIdx = $state(0);
	let direction = $state(1);
	let currentPhoto = $derived(photo.lightboxPhotos[currentIdx] ?? photo.lightboxPhotos[0]);

	// 构建灯箱数据
	const lightboxItems: LightboxItem[] = $derived(
		photo.lightboxPhotos.map((p) => ({
			img: p.img,
			alt: p.cap,
			caption: p.cap
		}))
	);

	function setActive(i: number) {
		const len = photo.lightboxPhotos.length;
		direction = i > currentIdx ? 1 : -1;
		currentIdx = ((i % len) + len) % len;
	}

	function openLightbox() {
		lightbox.show(lightboxItems, currentIdx);
	}
</script>

<Seo
	title={photo.title}
	description={photo.desc}
	image={photo.lightboxPhotos[0]?.img}
	type="article"
	articleSchema={{
		title: photo.title,
		description: photo.desc,
		image: photo.lightboxPhotos[0]?.img,
		datePublished: photo.date,
		author: '東风',
		slug: `gallery/${slug}`
	}}
/>

<main id="main" class="page" tabindex="-1">
	<RevealItem variant="up">
		<PageHead
			title={photo.title}
			en="Series"
			desc={`${photo.date} · ${photo.location}。${photo.count}`}
			count={photo.currentIndex}
			variant="secondary"
		/>
	</RevealItem>

	<div class="photo-detail">
		<RevealItem variant="scale" class="photo-stage-wrap">
			<div class="photo-stage">
				{#key currentIdx}
					<span
						class="big"
						style="background:{currentPhoto.grad}"
						in:fly={{ x: direction > 0 ? 40 : -40, duration: 350, easing: easeOut }}
						out:fly={{ x: direction > 0 ? -40 : 40, duration: 200, easing: easeOut }}
						onclick={openLightbox}
						role="button"
						tabindex="0"
						onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && openLightbox()}
					>
						<img src={currentPhoto.img} alt={currentPhoto.cap} loading="lazy" />
					</span>
				{/key}
				<button class="nav-btn prev" aria-label="上一张" onclick={() => setActive(currentIdx - 1)}>
					<ChevronLeft size="20" strokeWidth="1.6" />
				</button>
				<button class="nav-btn next" aria-label="下一张" onclick={() => setActive(currentIdx + 1)}>
					<ChevronRight size="20" strokeWidth="1.6" />
				</button>
			</div>
		</RevealItem>

		<aside class="photo-side reveal reveal--right" use:reveal>
			<div class="meta-card">
				<h3>{photo.subtitle}</h3>
				<div class="loc">{photo.date} · {photo.location}</div>
				<p>{photo.desc}</p>
				<div class="meta-list">
					{#each photo.meta as m (m.label)}
						<div><span>{m.label}</span><b>{m.value}</b></div>
					{/each}
				</div>
			</div>

			<div class="meta-card">
				<h3 class="sub">本系列</h3>
				<div class="thumbs">
					{#each photo.thumbs as thumb, i (i)}
						<span
							class="t"
							class:active={i === currentIdx}
							style="background:{thumb.gradient}"
							onclick={() => setActive(i)}
							role="button"
							tabindex="0"
							onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && setActive(i)}
						>
							<img src={thumb.img} alt={thumb.alt} loading="lazy" />
						</span>
					{/each}
				</div>
			</div>

			<div class="link-row">
				<a class="btn" href="/gallery">← 返回相册</a>
				<a class="btn primary" href={currentPhoto.img} download
					><Download size="14" strokeWidth="1.6" /> 下载原图</a
				>
			</div>
		</aside>
	</div>

	<!-- 评论区域 -->
	<div class="gallery-comments">
		<RevealItem variant="up">
			<CommentSection url={`/gallery/${slug}`} title={photo.title} />
		</RevealItem>
	</div>
</main>

<style>
	:global {
		.page {
			margin: var(--sp-lg) 0 var(--sp-xl);
		}
		.photo-detail {
			display: grid;
			grid-template-columns: 1fr 280px;
			gap: 2.2rem;
			align-items: start;
		}
		.photo-stage {
			border-radius: var(--r-md);
			overflow: hidden;
			border: var(--pixel-border);
			box-shadow: var(--shadow-md);
			position: relative;
			background: var(--border-l);
			aspect-ratio: 3 / 2;
		}
		.photo-stage :global(.big) {
			display: block;
			width: 100%;
			height: 100%;
			position: absolute;
			inset: 0;
			cursor: pointer;
		}
		.photo-stage :global(.big img) {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
			position: absolute;
			inset: 0;
		}
		.nav-btn {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			width: 42px;
			height: 42px;
			border-radius: var(--r-sm);
			border: none;
			background: color-mix(in oklch, var(--surface) 70%, transparent);
			color: var(--on-accent);
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: background 0.2s var(--ease);
			z-index: 5;
		}
		.nav-btn:hover {
			background: var(--accent);
		}
		.prev {
			left: 1rem;
		}
		.next {
			right: 1rem;
		}

		.photo-side {
			position: sticky;
			top: 1.4rem;
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
		.meta-card {
			background: var(--surface);
			border: var(--pixel-border);
			border-radius: var(--r-md);
			padding: 1.3rem;
			box-shadow: var(--shadow-sm);
		}
		.meta-card h3 {
			font-family: var(--font-body);
			font-size: 1.3rem;
			font-weight: 700;
			line-height: 1.3;
		}
		.meta-card h3.sub {
			font-size: 1rem;
		}
		.loc {
			font-family: var(--font-body);
			font-style: italic;
			font-size: 13px;
			color: var(--dim);
			margin-top: 0.4rem;
		}
		.meta-card p {
			font-size: 13px;
			color: var(--dim);
			line-height: 1.7;
			margin-top: 0.9rem;
		}
		.meta-list {
			display: flex;
			flex-direction: column;
			gap: 0.6rem;
			margin-top: 1rem;
			font-family: var(--font-mono);
			font-size: 10px;
			color: var(--muted);
		}
		.meta-list div {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			border-bottom: 1px dashed var(--border-l);
			padding-bottom: 0.5rem;
		}
		.meta-list div:last-child {
			border-bottom: none;
		}
		.meta-list b {
			color: var(--fg);
			font-weight: 500;
		}
		.thumbs {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 0.5rem;
		}
		.t {
			aspect-ratio: 1;
			border-radius: var(--r-sm);
			cursor: pointer;
			box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.25);
			border: 2px solid transparent;
			transition: border-color 0.2s var(--ease);
			position: relative;
			overflow: hidden;
		}
		.t img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			display: block;
		}
		.t:hover,
		.t.active {
			border-color: var(--accent);
		}
		.link-row {
			display: flex;
			gap: 0.6rem;
		}

		.gallery-comments {
			margin-top: 3rem;
			max-width: 800px;
		}

		@media (max-width: 900px) {
			.photo-detail {
				grid-template-columns: 1fr;
			}
			.photo-side {
				position: static;
			}
			.gallery-comments {
				max-width: 100%;
			}
		}
	}
</style>
