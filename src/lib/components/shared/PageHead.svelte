<script lang="ts">
	interface Props {
		title: string;
		en: string;
		desc: string;
		count: string;
		/** 虚线颜色变体：default (accent绿), secondary (accent-2粉), tertiary (accent-3蓝) */
		variant?: 'default' | 'secondary' | 'tertiary';
	}
	let { title, en, desc, count, variant = 'default' }: Props = $props();
</script>

<div class="page-head page-head--{variant}">
	<div class="title">
		<h1>{title}</h1>
		<span class="en">{en}</span>
	</div>
	<p class="desc">{desc}</p>
	<span class="count">{count}</span>
</div>

<style>
	:global(.page-head) {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 1rem;
		margin-bottom: 1.8rem;
		padding-bottom: 1.1rem;
		position: relative;
	}
	:global(.page-head::after) {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 3px;
		background: var(--dashed-accent);
		opacity: 0.7;
	}
	:global(.page-head--secondary::after) {
		background: var(--dashed-accent-2);
	}
	:global(.page-head--tertiary::after) {
		background: var(--dashed-accent-3);
	}
	.title {
		display: flex;
		align-items: baseline;
		gap: 0.8rem;
	}
	h1 {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: clamp(1.6rem, 3vw, 2rem);
		letter-spacing: -0.01em;
		line-height: 1.3;
	}
	.en {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.desc {
		font-size: var(--text-sm-2);
		color: var(--dim);
		max-width: 30rem;
		line-height: 1.7;
	}
	.count {
		font-family: var(--font-mono);
		font-size: var(--text-xs-2);
		color: var(--muted);
		white-space: nowrap;
	}

	@media (max-width: 680px) {
		:global(.page-head) {
			flex-direction: column;
			align-items: flex-start;
		}
		.count {
			align-self: flex-end;
		}
	}
</style>
