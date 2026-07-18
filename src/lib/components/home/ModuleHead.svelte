<script lang="ts">
	import RevealItem from '$lib/components/shared/RevealItem.svelte';

	interface Props {
		idx: string;
		title: string;
		en: string;
		count: string;
		href: string;
		/** 虚线颜色变体：default (accent绿), secondary (accent-2粉), tertiary (accent-3蓝) */
		variant?: 'default' | 'secondary' | 'tertiary';
	}
	let { idx, title, en, count, href, variant = 'default' }: Props = $props();
</script>

<RevealItem variant="up" class="m-head m-head--{variant}">
	<div class="m-head-info">
		<span class="idx">{idx}</span>
		<h2>{title}</h2>
		<span class="en">{en}</span>
		<span class="count">{count}</span>
	</div>
	<a {href}>查看更多 →</a>
</RevealItem>

<style>
	:global {
		.m-head {
			display: flex;
			justify-content: space-between;
			align-items: center;
			position: relative;
			margin-bottom: 1.3rem;
			padding-bottom: 0.85rem;
		}
		.m-head::after {
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			height: 3px;
			background: var(--dashed-accent);
			opacity: 0.7;
		}
		.m-head--secondary::after {
			background: var(--dashed-accent-2);
		}
		.m-head--tertiary::after {
			background: repeating-linear-gradient(
				90deg,
				var(--accent-3) 0,
				var(--accent-3) 8px,
				transparent 8px,
				transparent 16px
			);
		}

		.m-head-info {
			display: flex;
			align-items: center;
			gap: 0.7rem;
		}
		.idx {
			font-family: var(--font-mono);
			font-size: var(--text-xs);
			font-weight: 500;
			color: var(--accent);
			border: var(--pixel-border);
			border-radius: var(--r-sm);
			padding: 0.18rem 0.42rem;
			letter-spacing: 0.04em;
			transition:
				background 0.3s var(--ease),
				color 0.3s var(--ease),
				border-color 0.3s var(--ease);
		}
		:global(.module:hover) .idx {
			background: var(--accent);
			color: var(--on-accent);
			border-color: var(--accent);
		}
		h2 {
			font-family: var(--font-body);
			font-weight: 700;
			font-size: var(--text-xl);
			letter-spacing: -0.01em;
			line-height: 1.3;
		}
		.en {
			font-family: var(--font-pixel);
			font-size: var(--text-2xs);
			letter-spacing: 0.14em;
			text-transform: uppercase;
			color: var(--accent);
			align-self: center;
		}
		.count {
			font-family: var(--font-mono);
			font-size: var(--text-xs);
			color: var(--muted);
			letter-spacing: 0.04em;
		}
		a {
			font-family: var(--font-mono);
			font-size: var(--text-xs);
			color: var(--muted);
			letter-spacing: 0.04em;
			transition:
				color 0.2s var(--ease),
				transform 0.2s var(--ease);
		}
		a:hover {
			color: var(--accent);
			transform: translateX(3px);
		}

		:global([data-theme='dark']) .idx {
			color: var(--on-accent);
		}

		@media (max-width: 680px) {
			.m-head {
				flex-direction: column;
				align-items: flex-start;
				gap: 0.5rem;
			}
			.m-head > a {
				align-self: flex-end;
			}
		}
	}
</style>
