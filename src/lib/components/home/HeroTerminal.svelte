<script lang="ts">
	import AnimatedNumber from './AnimatedNumber.svelte';

	interface Props {
		stats?: { num: string; label: string }[];
	}
	let { stats = [] }: Props = $props();

	const terminalLines = [
		{ prompt: '>', cmd: 'Welcome', output: 'Hello word' },
		{ prompt: '>', cmd: 'whoami', output: 'a@ewd.cc' },
		{ prompt: '>', cmd: 'ls -la /blog/', output: 'articles/ photos/ moments/' },
		{ prompt: '>', cmd: 'cat status.txt', output: 'online • writing • exploring' },
		{ prompt: '>', cmd: 'ping creativity', output: '64 bytes from inspiration: ttl=42' }
	];
</script>

<div class="terminal">
	<div class="terminal-header">
		<span class="terminal-dot"></span>
		<span class="terminal-dot"></span>
		<span class="terminal-dot"></span>
		<span class="terminal-title">status.exe</span>
	</div>
	<div class="terminal-body">
		{#each terminalLines as line (line.cmd)}
			<div class="terminal-line">
				<span class="prompt">{line.prompt}</span>
				<span class="cmd">{line.cmd}</span>
			</div>
			<div class="terminal-line output-line">
				<span class="output">{line.output}</span>
			</div>
		{/each}
		<div class="terminal-line">
			<span class="prompt">></span>
			<span class="cursor"></span>
		</div>
	</div>
	{#if stats.length > 0}
		<div class="terminal-stats">
			{#each stats as stat, i (stat.label)}
				<div class="terminal-stat" style="animation-delay: {i * 0.15}s">
					<div class="terminal-stat-num" style="animation-delay: {i * 0.15}s">
						<AnimatedNumber value={stat.num} delay={i * 150} />
					</div>
					<div class="terminal-stat-label">{stat.label}</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="terminal-stats">
			<div class="terminal-stat">
				<div class="terminal-stat-num">--</div>
				<div class="terminal-stat-label">加载中...</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.terminal {
		background: var(--surface);
		border: var(--pixel-border);
		box-shadow: var(--pixel-shadow);
		overflow: hidden;
		transition:
			transform 0.2s var(--ease),
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.terminal:hover {
		transform: translate(-2px, -2px);
		border-color: var(--accent);
		box-shadow: var(--pixel-shadow-hover);
	}

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

	.terminal-body {
		padding: 16px 18px;
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--fg);
		line-height: 1.9;
		flex: 1;
	}

	.terminal-line {
		display: flex;
		gap: 8px;
		align-items: flex-start;
	}

	.terminal-line.output-line {
		margin-bottom: 4px;
	}

	.prompt {
		color: var(--accent);
		flex-shrink: 0;
	}

	.cmd {
		color: var(--fg);
	}

	.output {
		color: var(--muted);
		padding-left: 16px;
	}

	.cursor {
		display: inline-block;
		width: 7px;
		height: 13px;
		background: var(--accent);
		animation: blink 1s step-end infinite;
		vertical-align: middle;
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	.terminal-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0;
		border-top: 1px solid var(--border);
	}

	.terminal-stat {
		padding: 12px 14px;
		text-align: center;
		border-right: 1px solid var(--border);
	}

	.terminal-stat:last-child {
		border-right: none;
	}

	.terminal-stat-num {
		font-family: var(--font-pixel);
		font-size: var(--text-base);
		color: var(--accent);
		margin-bottom: 4px;
		animation: number-glow 1.5s ease-out both;
		display: inline-block;
	}

	@keyframes number-pop {
		0% {
			opacity: 0;
			transform: scale(0.5) translateY(10px);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	@keyframes number-glow {
		0%,
		100% {
			text-shadow: 0 0 8px color-mix(in oklch, var(--accent) 30%, transparent);
		}
		50% {
			text-shadow:
				0 0 20px color-mix(in oklch, var(--accent) 60%, transparent),
				0 0 40px color-mix(in oklch, var(--accent) 20%, transparent);
		}
	}

	.terminal-stat-label {
		font-family: var(--font-mono);
		font-size: var(--text-2xs);
		color: var(--muted);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
</style>
