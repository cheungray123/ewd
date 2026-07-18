<script lang="ts">
	import SpyLink from '$lib/components/shared/SpyLink.svelte';
	import TerminalHeader from '$lib/components/shared/TerminalHeader.svelte';

	interface Props {
		items: { year: string; count: number; href: string; active?: boolean }[];
	}
	let { items }: Props = $props();
</script>

<nav class="yr-nav" aria-label="按年份浏览说说">
	<TerminalHeader title="archive.exe" />
	<div class="yr-nav-content">
		<div class="yr-cap">归档 · 按年</div>
		{#each items as item (item.year)}
			<SpyLink targetId="y{item.year}" href={item.href} margin="-12% 0px -72% 0px">
				{item.year} <em>{item.count}</em>
			</SpyLink>
		{/each}
	</div>
</nav>

<style>
	.yr-nav {
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}
	.yr-nav-content {
		padding: 1rem 1.1rem;
	}
	.yr-cap {
		font-family: var(--font-pixel);
		font-size: 0.4375rem;
		letter-spacing: 0.14em;
		color: var(--faint);
		text-transform: uppercase;
		margin-bottom: 0.7rem;
	}
	:global(.yr-nav a) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--dim);
		padding: 0.42rem 0.55rem;
		border-radius: var(--r-sm);
		margin: 0 -0.2rem;
		letter-spacing: 0.04em;
		transition:
			background 0.2s var(--ease),
			color 0.2s var(--ease);
	}
	:global(.yr-nav a em) {
		font-style: normal;
		font-size: 0.625rem;
		color: var(--faint);
		transition: color 0.2s var(--ease);
	}
	:global(.yr-nav a:hover) {
		background: var(--accent-soft);
		color: var(--accent);
	}
	:global(.yr-nav a.active) {
		background: var(--accent);
		color: var(--on-accent);
	}
	:global(.yr-nav a.active em) {
		color: var(--dim);
	}

	:global([data-theme='dark'] .yr-nav a.active) {
		color: var(--on-accent);
	}
	:global([data-theme='dark'] .yr-nav a.active em) {
		color: var(--muted);
	}
</style>
