<script lang="ts">
	import SpyLink from '$lib/components/shared/SpyLink.svelte';
	import PageHead from '$lib/components/shared/PageHead.svelte';
	import TerminalHeader from '$lib/components/shared/TerminalHeader.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo title="归档" description="東风博客全部文章的归档页面，按时间线浏览历史内容" type="website" />

<main id="main" class="page" tabindex="-1">
	<PageHead
		title={data.pageHead.title}
		en="Archive"
		desc={data.pageHead.desc}
		count={data.pageHead.count}
		variant="default"
	/>

	<div class="arch-grid">
		<nav class="arch-nav" aria-label="按归档浏览">
			<TerminalHeader title="archive.exe" />
			<div class="arch-nav-content">
				{#each data.archiveNavItems as item (item.year)}
					<SpyLink targetId="y{item.year}" href={item.href} margin="-12% 0px -72% 0px">
						{item.year}
					</SpyLink>
				{/each}
			</div>
		</nav>

		<div class="arch-content">
			{#each data.years as yr (yr.year)}
				<section class="yr-sec" id="y{yr.year}">
					<div class="yr-head">
						<h2>{yr.year}</h2>
						<span class="count">{yr.count}</span>
					</div>
					{#each yr.months as month (month.label)}
						<div class="month">
							<h3>{month.label}</h3>
							<ul>
								{#each month.items as item (item.slug)}
									<li>
										<a href="/posts/{item.slug}">
											<span class="date">{item.date}</span>
											<span class="title">{item.title}</span>
											<span class="cat">{item.category}</span>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</section>
			{/each}
		</div>
	</div>
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
	}
	.arch-grid {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 2.4rem;
		align-items: start;
	}
	.arch-nav {
		position: sticky;
		top: 1.4rem;
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}
	.arch-nav-content {
		padding: 1rem;
	}
	:global(.arch-nav a) {
		display: block;
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--dim);
		padding: 0.45rem 0.6rem;
		border-radius: var(--r-sm);
		transition:
			background 0.2s var(--ease),
			color 0.2s var(--ease);
	}
	:global(.arch-nav a:hover) {
		background: var(--accent-soft);
		color: var(--accent);
	}
	:global(.arch-nav a.active) {
		background: var(--accent);
		color: var(--on-accent);
	}
	:global([data-theme='dark'] .arch-nav a.active) {
		color: var(--on-accent);
	}

	.yr-sec {
		scroll-margin-top: 1.5rem;
	}
	.yr-head {
		display: flex;
		align-items: baseline;
		gap: 0.9rem;
		margin-bottom: 1.2rem;
	}
	.yr-head h2 {
		font-family: var(--font-body);
		font-size: 2.4rem;
		font-weight: 700;
		color: var(--fg);
	}
	.yr-head .count {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--muted);
	}
	.yr-sec:not(:first-child) {
		margin-top: 3rem;
	}
	.month {
		margin-bottom: 1.6rem;
	}
	.month h3 {
		font-family: var(--font-body);
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--accent);
		margin-bottom: 0.6rem;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	li {
		border-bottom: 1px dashed var(--border-l);
	}
	li a {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 0.5rem;
		text-decoration: none;
		transition: background 0.2s var(--ease);
		border-radius: var(--r-sm);
	}
	li a:hover {
		background: var(--accent-soft);
	}
	.date {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
		flex: 0 0 auto;
	}
	.title {
		font-size: 13px;
		color: var(--fg);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.cat {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--faint);
		background: var(--bg);
		border: var(--pixel-border);
		padding: 0.2rem 0.5rem;
		border-radius: var(--r-sm);
		flex: 0 0 auto;
	}

	@media (max-width: 900px) {
		.arch-grid {
			grid-template-columns: 1fr;
		}
		.arch-nav {
			position: static;
		}
		.arch-nav-content {
			display: flex;
			flex-wrap: wrap;
			gap: 0.4rem;
			padding: 0.8rem;
		}
		:global(.arch-nav a) {
			display: inline-block;
		}
		.yr-head h2 {
			font-size: 1.8rem;
		}
		li a {
			flex-wrap: wrap;
			gap: 0.4rem;
		}
		.title {
			white-space: normal;
		}
	}
</style>
