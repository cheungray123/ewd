<script lang="ts">
	import { useClock } from '$lib/stores/clock.svelte';
	import TerminalHeader from '$lib/components/shared/TerminalHeader.svelte';

	interface Props {
		chips: string[];
		doing: { label: string; value: string }[];
	}
	let { chips, doing }: Props = $props();

	const clock = useClock();
</script>

<div class="now-card">
	<TerminalHeader title="now.exe" />
	<div class="now-content">
		<div class="now-top">
			<span class="live"><i></i> 此刻</span>
			<span class="now-en">NOW</span>
		</div>
		<div class="now-time">
			<b class="clock">{clock.value}</b>
			<span>北京</span>
		</div>
		<div class="now-chips">
			{#each chips as chip (chip)}
				<span class="chip">{chip}</span>
			{/each}
		</div>
		{#each doing as item (item.label)}
			<div class="now-doing">
				<span class="lbl">{item.label}</span>
				<span class="val">{item.value}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.now-card {
		background: var(--surface);
		border: var(--pixel-border);
		box-shadow: var(--pixel-shadow);
		overflow: hidden;
	}
	.now-content {
		padding: var(--sp-sm);
	}
	.now-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.85rem;
	}
	.live {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-family: var(--font-pixel);
		font-size: 0.4375rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.live i {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: var(--r-sm);
		background: var(--ok);
		animation: pulse 2.6s var(--ease) infinite;
	}
	/* @keyframes pulse 已提取到 app.css 共享 */
	.now-en {
		font-family: var(--font-pixel);
		font-size: 0.4375rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--faint);
	}
	.now-time {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}
	.now-time b {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--fg);
		letter-spacing: 0.04em;
		font-variant-numeric: tabular-nums;
	}
	.now-time span {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--muted);
		letter-spacing: 0.04em;
	}
	.now-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0.85rem 0;
	}
	.chip {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--dim);
		background: var(--accent-soft);
		padding: 0.26rem 0.55rem;
		border-radius: var(--r-sm);
		letter-spacing: 0.04em;
	}
	.now-doing {
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
		padding-top: 0.6rem;
		border-top: 1px dashed var(--border-l);
		margin-top: 0.6rem;
	}
	.now-doing:first-of-type {
		border-top: 1px dashed var(--border-l);
	}
	.lbl {
		font-family: var(--font-pixel);
		font-size: 0.4375rem;
		letter-spacing: 0.14em;
		color: var(--faint);
		text-transform: uppercase;
		flex: 0 0 auto;
	}
	.val {
		font-size: var(--text-sm-2);
		color: var(--fg);
	}

	@media (max-width: 440px) {
		.now-card {
			padding: 1rem;
		}
		.now-time b {
			font-size: 0.75rem;
		}
	}
</style>
