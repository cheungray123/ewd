<script lang="ts">
	import type { PhotoCard as PhotoCardData } from '$lib/types';

	interface Props {
		photo: PhotoCardData;
		href: string;
		variant?: string;
	}
	let { photo, href, variant = 'p1' }: Props = $props();
</script>

<a class="photo {variant}" {href} aria-label="查看 {photo.title}">
	<span class="ph"></span>
	<span class="frame"></span>
	<img src={photo.img} alt={photo.alt} loading="lazy" />
	<span class="view">查看</span>
	<span class="cap">
		<span class="loc">{photo.location}</span>
		<span class="ttl">{photo.title}</span>
	</span>
</a>

<style>
	.photo {
		position: relative;
		overflow: hidden;
		cursor: pointer;
		aspect-ratio: 1 / 1;
		background: var(--border-l);
		box-shadow: var(--pixel-shadow);
		display: block;
		border: 2px solid var(--border);
		transition:
			transform 0.2s var(--ease),
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		position: absolute;
		inset: 0;
	}
	.ph {
		position: absolute;
		inset: 0;
	}
	.ph::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(
			120% 90% at 26% 16%,
			color-mix(in oklch, var(--fg) 40%, transparent),
			transparent 52%
		);
		opacity: 0;
		transition: opacity 0.3s var(--ease);
		z-index: 1;
	}
	.photo::after {
		content: '';
		position: absolute;
		inset: 0;
		box-shadow: inset 0 0 64px color-mix(in oklch, var(--bg) 50%, transparent);
		pointer-events: none;
		z-index: 2;
	}
	.frame {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border: 2px solid transparent;
		transition: border-color 0.3s var(--ease);
	}
	.cap {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.75rem 0.8rem;
		background: linear-gradient(transparent, color-mix(in oklch, var(--bg) 78%, transparent));
		display: flex;
		flex-direction: column;
		gap: 0.18rem;
	}
	.cap .loc {
		font-family: var(--font-body);
		font-style: italic;
		font-size: var(--text-xs);
		letter-spacing: 0.02em;
		color: rgba(255, 255, 255, 0.85);
	}
	.cap .ttl {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-lg);
		color: #ffffff;
		line-height: 1.1;
	}
	.view {
		position: absolute;
		top: 0.6rem;
		right: 0.6rem;
		font-family: var(--font-pixel);
		font-size: var(--text-2xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--on-accent);
		background: var(--accent);
		padding: 0.18rem 0.5rem;
		border-radius: var(--r-sm);
		opacity: 0;
		transform: translateY(-4px);
		transition:
			opacity 0.3s var(--ease),
			transform 0.3s var(--ease);
	}
	.photo:hover {
		transform: translate(-2px, -2px);
		border-color: var(--accent);
		box-shadow: var(--pixel-shadow-hover);
	}
	.photo:hover .frame {
		border-color: var(--accent);
	}
	.photo:hover .ph::before {
		opacity: 1;
	}
	.photo:hover .view {
		opacity: 1;
		transform: none;
	}
	.photo:focus-visible .view {
		opacity: 1;
		transform: none;
	}

	.ph::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.12'/%3E%3C/svg%3E");
		mix-blend-mode: overlay;
		opacity: 0.6;
		pointer-events: none;
	}

	/* 照片卡片渐变背景 */
	:global(.p1) {
		background: var(--grad-photo-1);
	}
	:global(.p2) {
		background: var(--grad-photo-2);
	}
	:global(.p3) {
		background: var(--grad-photo-3);
	}

	:global([data-theme='dark']) .view {
		color: var(--on-accent);
	}

	@media (max-width: 900px) {
		.photo {
			aspect-ratio: 16 / 9;
		}
	}
</style>
