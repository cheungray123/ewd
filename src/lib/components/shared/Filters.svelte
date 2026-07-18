<script lang="ts">
	import type { FilterOption } from '$lib/types';

	interface Props {
		options: FilterOption[];
		active: string;
		onchange?: (key: string) => void;
	}
	let { options, active = 'all', onchange }: Props = $props();

	let containerEl: HTMLElement;
	let pillLeft = $state(0);
	let pillWidth = $state(0);

	function updatePill() {
		if (!containerEl) return;
		const activeBtn = containerEl.querySelector<HTMLElement>('button.active');
		if (activeBtn) {
			const containerRect = containerEl.getBoundingClientRect();
			const btnRect = activeBtn.getBoundingClientRect();
			pillLeft = btnRect.left - containerRect.left;
			pillWidth = btnRect.width;
		}
	}

	$effect(() => {
		// 依赖 active 变化时重新计算 pill 位置
		void active;
		updatePill();
	});

	$effect(() => {
		// 窗口大小变化时重新计算
		const onResize = () => updatePill();
		window.addEventListener('resize', onResize, { passive: true });
		return () => window.removeEventListener('resize', onResize);
	});
</script>

<div class="filters" bind:this={containerEl} role="group" aria-label="分类筛选">
	<span class="pill-bg" style="width: {pillWidth}px; transform: translateX({pillLeft}px)"></span>
	{#each options as opt (opt.key)}
		<button class:active={active === opt.key} onclick={() => onchange?.(opt.key)}>
			<span class="label">{opt.label}</span>
		</button>
	{/each}
</div>

<style>
	:global(.filters) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.6rem;
		position: relative;
	}
	:global(.filters button) {
		position: relative;
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.04em;
		padding: 0.42rem 0.9rem;
		border-radius: var(--r-sm);
		border: var(--pixel-border);
		background: var(--surface);
		color: var(--muted);
		cursor: pointer;
		transition:
			color 0.22s var(--ease),
			border-color 0.22s var(--ease);
		z-index: 0;
	}
	:global(.filters button:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	@media (max-width: 680px) {
		:global(.filters button) {
			min-height: 44px;
			padding: 0.5rem 1rem;
		}
	}
	:global(.filters button:hover) {
		color: var(--accent);
		border-color: var(--accent);
	}
	:global(.filters button.active) {
		color: var(--on-accent);
		border-color: var(--accent);
		background: transparent;
	}
	:global(.pill-bg) {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		border-radius: var(--r-sm);
		background: var(--accent);
		z-index: -1;
		transition:
			transform 0.3s var(--ease),
			width 0.3s var(--ease);
		pointer-events: none;
	}
	:global(.label) {
		position: relative;
		z-index: 2;
	}
	:global([data-theme='dark']) :global(.filters button.active) {
		color: var(--on-accent);
	}
	:global([data-theme='dark']) :global(.pill-bg) {
		background: var(--accent);
	}
</style>
