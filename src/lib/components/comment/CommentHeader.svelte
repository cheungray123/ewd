<script lang="ts">
	interface Props {
		count: number;
		replyCount?: number;
		sortOrder?: 'latest' | 'earliest';
		showSort?: boolean;
		onSortChange?: (order: 'latest' | 'earliest') => void;
	}

	let {
		count,
		replyCount = 0,
		sortOrder = 'latest',
		showSort = false,
		onSortChange
	}: Props = $props();

	const displayText = $derived(
		count > 0 ? `共 ${count} 条${replyCount > 0 ? ` · 含 ${replyCount} 条回复` : ''}` : '暂无评论'
	);
</script>

<div class="c-head">
	<h3>评论</h3>
	<span class="n">{displayText}</span>
	{#if showSort}
		<div class="sort">
			<button
				class:active={sortOrder === 'latest'}
				onclick={() => onSortChange?.('latest')}
				type="button">最新</button
			>
			<button
				class:active={sortOrder === 'earliest'}
				onclick={() => onSortChange?.('earliest')}
				type="button">最早</button
			>
		</div>
	{/if}
</div>

<style>
	.c-head {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin-bottom: 1.4rem;
	}
	.c-head h3 {
		font-family: var(--font-body);
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--fg);
	}
	.c-head .n {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.sort {
		display: flex;
		gap: 2px;
		margin-left: auto;
		background: var(--bg);
		padding: 2px;
		border-radius: var(--r-sm);
	}
	.sort button {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--muted);
		padding: 0.2rem 0.5rem;
		border-radius: var(--r-sm);
		transition:
			color 0.2s var(--ease),
			background 0.2s var(--ease);
		border: none;
		background: transparent;
		cursor: pointer;
	}
	.sort button:hover {
		color: var(--fg);
	}
	.sort button.active {
		background: var(--accent-soft);
		color: var(--accent);
	}

	@media (max-width: 680px) {
		.c-head {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.3rem;
		}
		.sort {
			margin-left: 0;
		}
	}
</style>
