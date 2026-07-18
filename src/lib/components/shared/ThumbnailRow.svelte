<script lang="ts">
	import { lightbox } from '$lib/stores/lightbox.svelte';
	import type { LightboxItem } from '$lib/stores/lightbox.svelte';

	interface Props {
		/** 图片 URL 列表 */
		images: string[];
		/** 缩略图尺寸（px），默认 80 */
		size?: number;
		/** 每行最多显示数量，默认不限制 */
		max?: number;
	}
	let { images, size = 80, max }: Props = $props();

	let displayImages = $derived(max ? images.slice(0, max) : images);

	function openImage(index: number) {
		const items: LightboxItem[] = images.map((src) => ({ img: src, alt: '' }));
		lightbox.show(items, index);
	}
</script>

{#if displayImages.length > 0}
	<div class="img-row">
		{#each displayImages as img, i (i)}
			<button
				class="img-cell"
				style="width:{size}px;height:{size}px"
				onclick={() => openImage(i)}
				aria-label="查看图片 {i + 1}"
			>
				<img src={img} alt="" loading="lazy" />
			</button>
		{/each}
	</div>
{/if}

<style>
	:global(.img-row) {
		display: flex;
		gap: 0.3rem;
		margin-top: 0.75rem;
		flex-wrap: wrap;
	}
	:global(.img-cell) {
		border-radius: var(--r-sm);
		overflow: hidden;
		border: var(--pixel-border);
		cursor: pointer;
		padding: 0;
		background: var(--border);
		transition:
			opacity 0.2s var(--ease),
			transform 0.2s var(--ease),
			border-color 0.2s var(--ease);
		flex-shrink: 0;
	}
	:global(.img-cell:hover) {
		opacity: 0.88;
		transform: scale(1.05);
		border-color: var(--accent);
	}
	:global(.img-cell img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	@media (max-width: 680px) {
		:global(.img-cell) {
			width: 70px !important;
			height: 70px !important;
		}
	}
</style>
