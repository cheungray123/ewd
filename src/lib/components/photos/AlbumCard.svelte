<script lang="ts">
	import type { Album } from '$lib/types';

	interface Props {
		album: Album;
		href: string;
	}
	let { album, href }: Props = $props();
</script>

<a class="album-card" {href}>
	<span class="ph" style="background:{album.gradient}"></span>
	<img src={album.img} alt={album.alt} loading="lazy" />
	<span class="cap">
		<span class="ttl">{album.title}</span>
		<span class="n">{album.count} 张 · {album.year}</span>
	</span>
</a>

<style>
	.album-card {
		position: relative;
		overflow: hidden;
		aspect-ratio: 16 / 10;
		cursor: pointer;
		border: 2px solid var(--border);
		box-shadow: var(--pixel-shadow);
		display: block;
		background: var(--border-l);
		transition:
			transform 0.2s var(--ease),
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.album-card:hover {
		transform: translate(-2px, -2px);
		border-color: var(--accent);
		box-shadow: var(--pixel-shadow-hover);
	}
	.album-card:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}
	.ph {
		position: absolute;
		inset: 0;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		position: absolute;
		inset: 0;
	}
	.ph::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: var(--noise-texture);
		mix-blend-mode: overlay;
		opacity: 0.6;
		pointer-events: none;
	}
	.cap {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.8rem 1rem;
		background: linear-gradient(transparent, color-mix(in oklch, var(--bg) 76%, transparent));
	}
	.cap .ttl {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 1rem;
		color: #ffffff;
	}
	.cap .n {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: rgba(255, 255, 255, 0.8);
		margin-top: 0.2rem;
		letter-spacing: 0.04em;
	}
</style>
