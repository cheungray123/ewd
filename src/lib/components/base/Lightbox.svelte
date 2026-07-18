<script lang="ts">
	import { X, ChevronLeft, ChevronRight } from 'svelte-lucide';
	import { fade, fly, scale } from 'svelte/transition';
	import { lightbox } from '$lib/stores/lightbox.svelte';
	import { easeOut } from '$lib/utils/motion';
	import { tick } from 'svelte';

	let modalEl = $state<HTMLDivElement | null>(null);

	function handleKeydown(e: KeyboardEvent) {
		if (!lightbox.open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			lightbox.close();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			lightbox.prev();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			lightbox.next();
		} else if (e.key === 'Tab') {
			// Focus trap：Tab 键在模态框内部循环
			trapFocus(e);
		}
	}

	/** 焦点陷阱：Tab 键在模态框内部可聚焦元素之间循环 */
	function trapFocus(e: KeyboardEvent) {
		const root = modalEl;
		if (!root) return;
		const focusable = root.querySelectorAll<HTMLElement>(
			'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) {
			e.preventDefault();
			root.focus();
			return;
		}
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (e.shiftKey) {
			if (active === first || !root.contains(active)) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (active === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}

	// 打开时自动聚焦容器，便于捕获键盘事件并实现焦点陷阱
	let lastFocused = $state<HTMLElement | null>(null);
	$effect(() => {
		if (lightbox.open) {
			lastFocused = document.activeElement as HTMLElement | null;
			tick().then(() => modalEl?.focus());
		} else if (lastFocused) {
			lastFocused?.focus();
			lastFocused = null;
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if lightbox.open}
	<div
		bind:this={modalEl}
		class="lightbox"
		onclick={(e: MouseEvent) => e.target === e.currentTarget && lightbox.close()}
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				lightbox.close();
			}
		}}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-label="图片查看器"
		transition:fade={{ duration: 250, easing: easeOut }}
	>
		<div class="lb-inner">
			<button
				class="lb-close"
				aria-label="关闭"
				onclick={() => lightbox.close()}
				in:scale={{ start: 0.8, duration: 200, easing: easeOut, delay: 100 }}
				out:fade={{ duration: 150 }}
			>
				<X size="20" strokeWidth="1.6" />
			</button>
			{#if lightbox.items.length > 1}
				<button
					class="lb-nav lb-prev"
					aria-label="上一张"
					onclick={() => lightbox.prev()}
					in:fly={{ x: -16, duration: 250, easing: easeOut, delay: 150 }}
					out:fly={{ x: -16, duration: 150 }}
				>
					<ChevronLeft size="24" strokeWidth="1.6" />
				</button>
			{/if}
			<div class="lb-stage">
				{#key lightbox.current}
					{#if lightbox.active}
						<img
							src={lightbox.active.img}
							alt={lightbox.active.alt ?? ''}
							in:scale={{ start: 0.96, duration: 300, easing: easeOut }}
							out:scale={{ start: 0.96, duration: 200, easing: easeOut }}
						/>
					{/if}
				{/key}
			</div>
			{#if lightbox.items.length > 1}
				<button
					class="lb-nav lb-next"
					aria-label="下一张"
					onclick={() => lightbox.next()}
					in:fly={{ x: 16, duration: 250, easing: easeOut, delay: 150 }}
					out:fly={{ x: 16, duration: 150 }}
				>
					<ChevronRight size="24" strokeWidth="1.6" />
				</button>
			{/if}
			{#if lightbox.active?.caption}
				<div
					class="lb-caption"
					in:fly={{ y: 8, duration: 250, easing: easeOut, delay: 300 }}
					out:fade={{ duration: 150 }}
				>
					{lightbox.active.caption}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(.lightbox) {
		position: fixed;
		inset: 0;
		background: color-mix(in oklch, var(--bg) 92%, transparent);
		z-index: 200;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.lightbox:focus-visible) {
		outline: none;
	}
	.lb-inner {
		position: relative;
		max-width: 90vw;
		max-height: 85vh;
	}
	.lb-stage {
		width: min(800px, 85vw);
		max-height: 85vh;
		border-radius: var(--r-md);
		overflow: hidden;
		position: relative;
	}
	.lb-stage :global(img) {
		width: 100%;
		height: auto;
		max-height: 85vh;
		object-fit: contain;
		display: block;
		border-radius: var(--r-md);
	}
	:global(.lb-close) {
		position: absolute;
		top: -2.5rem;
		right: 0;
		background: none;
		border: none;
		color: var(--on-accent);
		cursor: pointer;
		display: flex;
		align-items: center;
		padding: 0.3rem;
		transition: opacity 0.2s;
	}
	:global(.lb-close:hover) {
		opacity: 1 !important;
	}
	:global(.lb-nav) {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 44px;
		height: 44px;
		border-radius: var(--r-sm);
		border: none;
		background: color-mix(in oklch, var(--fg) 12%, transparent);
		color: var(--on-accent);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s var(--ease);
	}
	:global(.lb-nav:hover) {
		background: var(--accent);
	}
	:global(.lb-prev) {
		left: -3.5rem;
	}
	:global(.lb-next) {
		right: -3.5rem;
	}
	:global(.lb-caption) {
		position: absolute;
		bottom: -2rem;
		left: 0;
		right: 0;
		text-align: center;
		font-family: var(--font-mono);
		font-size: 10px;
		color: color-mix(in oklch, var(--fg) 70%, transparent);
		letter-spacing: 0.04em;
	}

	@media (max-width: 680px) {
		/* 移动端：按钮贴近图片内部边缘，避免负定位溢出容器 */
		:global(.lb-prev) {
			left: 0.5rem;
		}
		:global(.lb-next) {
			right: 0.5rem;
		}
		:global(.lb-close) {
			top: 0.5rem;
			right: 0.5rem;
			background: color-mix(in oklch, var(--bg) 60%, transparent);
			border-radius: var(--r-sm);
			padding: 0.4rem;
		}
		:global(.lb-caption) {
			bottom: -1.5rem;
			font-size: 10px;
		}
		/* 移动端导航按钮半透明背景，确保在图片上可见 */
		:global(.lb-nav) {
			background: color-mix(in oklch, var(--bg) 50%, transparent);
			backdrop-filter: blur(4px);
			-webkit-backdrop-filter: blur(4px);
		}
	}
</style>
