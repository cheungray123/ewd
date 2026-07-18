<script lang="ts">
	import type { PagerItem } from '$lib/types';

	interface Props {
		items: PagerItem[];
	}
	let { items }: Props = $props();
</script>

<nav class="pager" aria-label="分页">
	{#if items.length > 1}
		{#each items as item (item.label)}
			{#if item.dots}
				<span class="dots">…</span>
			{:else if item.href}
				<a href={item.href}>{item.label}</a>
			{:else}
				<span class="cur">{item.label}</span>
			{/if}
		{/each}
	{/if}
</nav>

<style>
	:global(.pager) {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2.4rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--muted);
	}
	:global(.pager) :global(a),
	:global(.pager) span {
		min-width: 38px;
		height: 38px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--r-sm);
		border: var(--pixel-border);
		background: var(--surface);
		transition:
			color 0.22s var(--ease),
			border-color 0.22s var(--ease);
	}
	:global(.pager a:hover) {
		color: var(--accent);
		border-color: var(--accent);
	}
	:global(.cur) {
		background: var(--accent) !important;
		color: var(--on-accent) !important;
		border-color: var(--accent) !important;
	}
	:global(.dots) {
		border: none !important;
		background: none !important;
	}
	:global([data-theme='dark']) .cur {
		color: var(--on-accent);
	}
</style>
