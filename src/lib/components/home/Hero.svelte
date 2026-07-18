<script lang="ts">
	import { heroConfig } from '$lib/settings/pages';
	import { site } from '$lib/settings/site';
	import type { HeroStat, LatestMoment } from '$lib/types';
	import HeroTerminal from './HeroTerminal.svelte';

	interface Props {
		stats: HeroStat[];
		latestMoment: LatestMoment | null;
	}
	let { stats, latestMoment }: Props = $props();

	// 转换 stats 为 terminal 格式
	const terminalStats = $derived(
		stats.slice(0, 3).map((s) => ({
			num: s.number.toString(),
			label: s.label
		}))
	);
</script>

<section class="hero">
	<span class="float-scanline"></span>
	<div class="h-left">
		<div class="h-card" data-established={site.established}>
			<div class="eyebrow">{heroConfig.eyebrow}</div>
			<h1 class="h-title">{heroConfig.title}<em>{heroConfig.titleAccent}</em></h1>
			<p class="h-sub">{heroConfig.subtitle}</p>
		</div>
		{#if latestMoment}
			<a class="h-moment" href="/moments" style="animation-delay: 0.64s">
				<div class="h-moment-tag">
					<span class="h-moment-dot"></span>
					最新说说
				</div>
				<p class="h-moment-text">{latestMoment.text}</p>
				<div class="h-moment-foot">
					<span class="h-moment-time">{latestMoment.time}</span>
					<span class="h-moment-link">查看全部 →</span>
				</div>
			</a>
		{/if}
	</div>
	<div class="h-right">
		<HeroTerminal stats={terminalStats} />
	</div>
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: 1.6fr 1fr;
		gap: 1.4rem;
		align-items: stretch;
		margin-bottom: var(--sp-xl);
		position: relative;
	}

	.h-left {
		display: flex;
		flex-direction: column;
		gap: 1.4rem;
	}

	.h-right {
		display: flex;
		flex-direction: column;
	}

	.h-right :global(.terminal) {
		flex: 1;
		min-height: 280px;
	}

	:global(.h-card) {
		background: var(--surface);
		border: var(--pixel-border);
		padding: 2.1rem 1.9rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		box-shadow: var(--pixel-shadow);
		position: relative;
		overflow: hidden;
		transition:
			transform 0.2s var(--ease),
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
		animation: hero-slide-left 0.2s var(--ease) both;
	}
:global(.h-card:hover) {
	transform: translate(-2px, -2px);
	border-color: var(--accent);
	box-shadow: var(--pixel-shadow-hover);
}
:global(.h-card::after) {
	content: attr(data-established);
	position: absolute;
	top: 1.1rem;
	right: 1.3rem;
	font-family: var(--font-pixel);
	font-size: 0.5625rem;
	letter-spacing: 0.18em;
	color: var(--muted);
}
:global(.eyebrow) {
		font-family: var(--font-pixel);
		font-size: 0.5rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--accent);
		margin-bottom: 1.1rem;
		animation: hero-fade-up 0.2s var(--ease) 0.05s both;
	}
	:global(.h-title) {
		font-family: var(--font-body);
		font-size: clamp(1.6rem, 3.5vw, 2.2rem);
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.3;
		animation: hero-fade-up 0.2s var(--ease) 0.08s both;
	}
	:global(.h-title em) {
		font-family: var(--font-body);
		font-style: normal;
		font-weight: 700;
		color: var(--accent);
	}
	:global(.h-sub) {
		margin-top: 1.1rem;
		font-size: 0.8125rem;
		color: var(--dim);
		line-height: 1.75;
		max-width: 26rem;
		animation: hero-fade-up 0.2s var(--ease) 0.14s both;
	}

	/* 右侧区域：统计 + 最新说说 */
	.h-right {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		animation: hero-fade-up 0.2s var(--ease) 0.12s both;
	}

	/* 最新说说卡片 */
	.h-moment {
		flex: 1;
		background: var(--surface);
		border: var(--pixel-border);
		padding: 1.3rem 1.4rem;
		box-shadow: var(--pixel-shadow);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		text-decoration: none;
		color: inherit;
		opacity: 0;
		animation: hero-fade-up 0.2s var(--ease) both;
		position: relative;
		overflow: hidden;
		transition:
			transform 0.2s var(--ease),
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.h-moment:hover {
		transform: translate(-2px, -2px);
		border-color: var(--accent);
		box-shadow: var(--pixel-shadow-hover);
	}
	.h-moment-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-pixel);
		font-size: 0.4375rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.h-moment-dot {
		width: 7px;
		height: 7px;
		border-radius: var(--r-sm);
		background: var(--ok);
		animation: pulse 2.6s var(--ease) infinite;
	}
	.h-moment-text {
		font-size: 0.8125rem;
		line-height: 1.72;
		color: var(--fg);
		margin: 0.7rem 0 0;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.h-moment-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 0.9rem;
	}
	.h-moment-time {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--muted);
		letter-spacing: 0.04em;
	}
	.h-moment-link {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--muted);
		font-weight: 500;
		transition: color 0.2s var(--ease);
	}
	.h-moment:hover .h-moment-link {
		color: var(--accent);
	}

	@media (max-width: 900px) {
		.hero {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 440px) {
		.hero {
			gap: 1rem;
		}
		:global(.h-card) {
			padding: 1.5rem 1.3rem;
		}
		:global(.h-title) {
			font-size: clamp(12px, 4vw, 18px);
		}
		:global(.h-sub) {
			font-size: 0.75rem;
		}
	}
</style>
