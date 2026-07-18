<script lang="ts">
	interface Props {
		title?: string;
		dots?: boolean;
	}
	let { title = '', dots = true }: Props = $props();
</script>

<div class="terminal-header">
	{#if dots}
		<span class="terminal-dot"></span>
		<span class="terminal-dot"></span>
		<span class="terminal-dot"></span>
	{/if}
	{#if title}
		<span class="terminal-title">{title}</span>
	{/if}
</div>

<style>
	.terminal-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		border-bottom: 1px solid var(--border);
		background: color-mix(in oklch, var(--fg) 2%, transparent);
	}

	.terminal-dot {
		width: 8px;
		height: 8px;
		border: 2px solid;
	}

	.terminal-dot:nth-child(1) {
		border-color: var(--accent);
		background: var(--accent);
	}

	.terminal-dot:nth-child(2) {
		border-color: var(--accent-2);
		background: var(--accent-2);
	}

	.terminal-dot:nth-child(3) {
		border-color: var(--accent-3);
		background: var(--accent-3);
	}

	.terminal-title {
		font-family: var(--font-pixel);
		font-size: var(--text-2xs);
		color: var(--muted);
		letter-spacing: 0.1em;
		margin-left: auto;
		text-transform: uppercase;
	}
</style>
