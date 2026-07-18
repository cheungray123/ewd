<script lang="ts">
	import MusicPlayer from '$lib/components/article/MusicPlayer.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import TerminalHeader from '$lib/components/shared/TerminalHeader.svelte';
	import { site } from '$lib/settings/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo title="关于" description="关于 東风博主 - 写代码、记生活、偶尔拍点照片" type="website" />

<main id="main" class="page" tabindex="-1">
	<div class="about-hero">
		<TerminalHeader title="profile.exe" />
		<div class="about-hero-content">
			<img class="portrait" src={site.avatar} alt={data.aboutHero.name} />
			<div>
				<h1>{data.aboutHero.name}</h1>
				<div class="role">{data.aboutHero.role}</div>
				<p>{data.aboutHero.desc}</p>
			</div>
		</div>
	</div>

	<div class="about-grid">
		<div class="about-block">
			<TerminalHeader title="Music.exe" />
			<div class="about-block-content">
				<MusicPlayer recommend openList />
			</div>
		</div>
		<div class="about-block">
			<TerminalHeader title="timeline.exe" />
			<div class="about-block-content">
				<h3>历程 <span class="en">Timeline</span></h3>
				{#each data.milestones as ms (ms.year)}
					<div class="milestone">
						<span class="yr">{ms.year}</span>
						<div class="ev">
							<h4>{ms.title}</h4>
							<p>{ms.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<div class="about-block">
		<TerminalHeader title="site.exe" />
		<div class="about-block-content">
			<h3>关于本站 <span class="en">This Site</span></h3>
			<p class="about-desc">{data.aboutSite.desc}</p>
			<div class="link-row">
				{#each data.aboutSite.links as link (link.label)}
					<a class="btn" href={link.href}>{link.label}</a>
				{/each}
				<a class="btn primary" href="/posts">查看文章 →</a>
			</div>
		</div>
	</div>
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
	}
	.about-hero {
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		margin-bottom: 2rem;
	}
	.about-hero-content {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 2rem;
		align-items: center;
		padding: var(--sp-sm);
	}
	.portrait {
		width: 200px;
		height: 200px;
		border-radius: var(--r-md);
		object-fit: cover;
		border: var(--pixel-border);
		box-shadow: var(--shadow-sm);
	}
	.about-hero h1 {
		font-family: var(--font-body);
		font-size: 1.8rem;
		font-weight: 700;
	}
	.role {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.1em;
		color: var(--accent);
		text-transform: uppercase;
		margin: 0.4rem 0 0.9rem;
	}
	.about-hero p {
		font-size: 13px;
		color: var(--dim);
		line-height: 1.8;
		max-width: 34rem;
	}

	.about-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.4rem;
		margin-bottom: 2rem;
	}
	.about-block {
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}
	.about-block-content {
		padding: var(--sp-sm);
	}
	.about-block h3 {
		font-family: var(--font-body);
		font-size: 1.25rem;
		font-weight: 700;
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.about-block h3 .en {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.16em;
		color: var(--accent);
		text-transform: uppercase;
	}
	.milestone {
		display: flex;
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px dashed var(--border-l);
	}
	.milestone:last-child {
		border-bottom: none;
	}
	.milestone .yr {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--accent);
		font-weight: 500;
		flex: 0 0 64px;
	}
	.milestone .ev h4 {
		font-size: 14px;
		color: var(--fg);
	}
	.milestone .ev p {
		font-size: 12px;
		color: var(--dim);
		margin-top: 0.25rem;
		line-height: 1.6;
	}
	.about-desc {
		font-size: 13px;
		color: var(--dim);
		line-height: 1.85;
		margin-bottom: 1rem;
	}
	.link-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
	}

	@media (max-width: 900px) {
		.about-grid {
			grid-template-columns: 1fr;
		}
		.about-hero-content {
			grid-template-columns: 1fr;
			text-align: center;
			justify-items: center;
		}
		.portrait {
			width: 140px;
			height: 140px;
		}
		.portrait::after {
			font-size: 3rem;
		}
		.about-hero p {
			margin: 0 auto;
		}
	}
	@media (max-width: 680px) {
		.about-block-content {
			padding: 1.2rem;
		}
	}
</style>
