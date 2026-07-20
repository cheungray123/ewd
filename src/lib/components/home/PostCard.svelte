<script lang="ts">
	import type { PostCard as PostCardData } from '$lib/types';

	interface Props {
		post: PostCardData;
		href: string;
	}
	let { post, href }: Props = $props();
</script>

<a class="post" class:featured={post.featured} {href} data-cat={post.category}>
	{#if post.pinned}
		<span class="pin">置顶</span>
	{/if}
	<span class="cat">{post.category}</span>
	<h3>{post.title}</h3>
	<p>{post.excerpt}</p>
	<div class="meta">
		<span>{post.date}</span>
		<span class="d">{post.readTime}</span>
		{#if post.wordCount}<span class="wc">{post.wordCount}</span>{/if}
		<span class="more">阅读 →</span>
	</div>
</a>

<style>
	.post {
		background: var(--surface);
		border: var(--pixel-border);
		padding: var(--sp-sm);
		display: flex;
		flex-direction: column;
		position: relative;
		box-shadow: var(--pixel-shadow);
		min-height: 11rem;
		transition:
			transform 0.2s var(--ease),
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.post:hover {
		transform: translate(-2px, -2px);
		border-color: var(--accent);
		box-shadow: var(--pixel-shadow-hover);
	}
	.post:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}
	.pin {
		position: absolute;
		top: 0.8rem;
		right: 0.8rem;
		z-index: 5;
		overflow: hidden;
		font-family: var(--font-pixel);
		font-size: 0.4375rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--on-accent-2);
		background: linear-gradient(135deg, var(--accent-2), var(--accent-2));
		padding: 0.28rem 0.7rem;
		border-radius: var(--r-sm);
		box-shadow: var(--pixel-shadow-hover-2);
	}
	.pin::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 60%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in oklch, var(--fg) 30%, transparent),
			transparent
		);
		animation: pin-shine 3s var(--ease) infinite;
	}
	@keyframes pin-shine {
		0%,
		70%,
		100% {
			left: -100%;
		}
		90% {
			left: 120%;
		}
	}
	.cat {
		display: inline-block;
		align-self: flex-start;
		background: var(--accent-soft);
		color: var(--accent);
		font-family: var(--font-pixel);
		font-size: 0.4375rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.22rem 0.55rem;
		border-radius: var(--r-sm);
	}
	h3 {
		font-family: var(--font-body);
		font-size: 1rem;
		font-weight: 600;
		margin: 0.75rem 0 0.55rem;
		line-height: 1.4;
		color: var(--fg);
		transition: color 0.2s var(--ease);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.post:hover h3 {
		color: var(--accent);
	}
	p {
		font-size: 0.75rem;
		color: var(--dim);
		line-height: 1.7;
		flex: 1;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.meta {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--muted);
		margin-top: 1rem;
		display: flex;
		gap: 0.6rem;
		align-items: center;
		letter-spacing: 0.04em;
	}
	.meta .d::before {
		content: '·';
		margin-right: 0.5rem;
		color: var(--border);
	}
	.meta .wc {
		color: var(--muted);
	}
	.meta .wc::before {
		content: '·';
		margin-right: 0.5rem;
		color: var(--border);
	}
	.more {
		margin-left: auto;
		color: var(--accent);
		opacity: 0;
		transform: translateX(-4px);
		transition:
			opacity 0.25s var(--ease),
			transform 0.25s var(--ease);
	}
	.post:hover .more {
		opacity: 1;
		transform: none;
	}
	@media (max-width: 680px) {
		.post {
			min-height: auto;
		}
	}
</style>
