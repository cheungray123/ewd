<script lang="ts">
	interface Props {
		/** 空状态提示文案 */
		message: string;
		/** 重置按钮文字，不传则不显示按钮 */
		resetLabel?: string;
		/** 重置按钮回调 */
		onReset?: () => void;
	}
	let { message, resetLabel, onReset }: Props = $props();
</script>

<div class="empty" role="status">
	<span>{message}</span>
	{#if resetLabel && onReset}
		<button class="reset" onclick={onReset}>{resetLabel}</button>
	{/if}
</div>

<style>
	:global(.empty) {
		grid-column: 1 / -1;
		text-align: center;
		padding: 3rem 1rem;
		color: var(--muted);
		font-size: var(--text-sm-2);
	}
	:global(.reset) {
		display: block;
		margin: 1rem auto 0;
		font-family: var(--font-mono);
		font-size: var(--text-xs-2);
		color: var(--accent);
		background: none;
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		padding: 0.4rem 1rem;
		cursor: pointer;
		transition:
			border-color 0.2s var(--ease),
			background 0.2s var(--ease);
	}
	:global(.reset:hover) {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
</style>
