<script lang="ts">
	import { X } from 'svelte-lucide';

	interface Props {
		type?: 'loading' | 'empty' | 'error';
		message?: string;
	}

	let { type = 'loading', message }: Props = $props();

	const displayMessage = $derived(
		message ||
			{
				loading: '加载评论中…',
				empty: '还没有评论，来说两句吧 ↓',
				error: '评论加载失败'
			}[type]
	);
</script>

<div class="c-status" class:error={type === 'error'}>
	{#if type === 'loading'}
		<span class="spinner"></span>
	{:else if type === 'error'}
		<X size="14" strokeWidth="1.6" />
	{/if}
	<span>{displayMessage}</span>
</div>

<style>
	.c-status {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		padding: 2.4rem 0;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted);
	}
	.c-status.error {
		color: var(--warn);
	}
	.spinner {
		width: 14px;
		height: 14px;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 0;
		animation: spin 0.8s var(--ease) infinite;
	}
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
