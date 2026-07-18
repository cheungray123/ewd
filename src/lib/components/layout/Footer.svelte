<script lang="ts">
	import { ArrowUp } from 'svelte-lucide';
	import { reveal } from '$lib/actions/reveal';
	import { site } from '$lib/settings/site';

	interface Props {
		links?: { label: string; href: string }[];
	}
	let { links = [] }: Props = $props();

	function scrollToTop(e: MouseEvent) {
		e.preventDefault();
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
	}
</script>

<footer class="foot reveal" use:reveal>
	<div class="pixel-divider" aria-hidden="true"></div>
	<div class="foot-row">
		<span>{site.copyright}</span>
		<span>
			{#each links as link, i (link.href)}
				{#if i > 0}<span class="sep"> · </span>{/if}
				<a href={link.href}>{link.label}</a>
			{/each}
			<span class="sep"> · </span>
			<button type="button" class="top" onclick={scrollToTop}>
				<ArrowUp size="12" strokeWidth="1.6" /> 顶部
			</button>
		</span>
	</div>
</footer>

<style>
	:global {
		.foot {
			padding: 0 0 3rem;
			border-top: none;
		}
		.foot-row {
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;
			gap: 0.8rem;
			font-family: var(--font-mono);
			font-size: 0.625rem;
			color: var(--muted);
			letter-spacing: 0.04em;
		}
		.foot a {
			transition: color 0.2s var(--ease);
		}
		.foot a:hover {
			color: var(--accent);
		}
		.foot .top {
			font-weight: 500;
			display: inline-flex;
			align-items: center;
			gap: 0.2rem;
			background: none;
			border: none;
			color: inherit;
			font-family: inherit;
			font-size: inherit;
			letter-spacing: inherit;
			cursor: pointer;
		}
		.sep {
			opacity: 0.5;
		}

		@media (max-width: 600px) {
			.foot-row {
				flex-direction: column;
				align-items: center;
				text-align: center;
				gap: 0.5rem;
				padding-top: 1.3rem;
			}
		}
	}
</style>
