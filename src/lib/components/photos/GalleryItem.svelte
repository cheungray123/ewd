<script lang="ts">
	import type { GalleryPhoto } from '$lib/types';

	interface Props {
		photo: GalleryPhoto;
		href: string;
	}
	let { photo, href }: Props = $props();
</script>

<a class="g-item" {href} data-cat={photo.category} aria-label={photo.title}>
	<span class="ph" style="height:{photo.height};background:{photo.gradient}"></span>
	<img src={photo.img} alt={photo.alt} loading="lazy" />
	<span class="cap">
		<span class="loc">{photo.location}</span>
		<span class="ttl">{photo.title}</span>
	</span>
</a>

<style>
	.g-item {
		break-inside: avoid;
		margin-bottom: 0.9rem;
		overflow: hidden;
		position: relative;
		cursor: pointer;
		box-shadow: var(--pixel-shadow);
		border: var(--pixel-border);
		display: block;
		background: var(--border-l);
		transition:
			transform 0.2s var(--ease),
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.g-item:hover {
		transform: translate(-2px, -2px);
		border-color: var(--accent);
		box-shadow: var(--pixel-shadow-hover);
	}
	.g-item:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}
	.g-item:focus-visible .cap {
		opacity: 1;
		transform: none;
	}
	.ph {
		display: block;
		width: 100%;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		position: absolute;
		inset: 0;
	}
	.cap {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.7rem 0.8rem;
		background: linear-gradient(transparent, color-mix(in oklch, var(--bg) 70%, transparent));
		display: flex;
		flex-direction: column;
		gap: 0.12rem;
		opacity: 0;
		transform: translateY(6px);
		transition:
			opacity 0.3s var(--ease),
			transform 0.3s var(--ease);
	}
	.g-item:hover .cap {
		opacity: 1;
		transform: none;
	}
	.cap .loc {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 0.625rem;
		color: var(--fg);
	}
	.cap .ttl {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 1rem;
		color: var(--fg);
	}
</style>
