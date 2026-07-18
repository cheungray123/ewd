<script lang="ts">
	import { tickerSrText } from '$lib/settings/pages';
	import { onMount } from 'svelte';

	let trackEl: HTMLDivElement;
	let tickerEl: HTMLDivElement;
	let copies = $state(2);

	onMount(() => {
		if (!trackEl || !tickerEl) return;

		// 计算单份文本宽度：先渲染 1 份测量，避免 copies>1 时除法不准
		copies = 1;
		// 等待 DOM 更新后测量
		queueMicrotask(() => {
			if (!trackEl || !tickerEl) return;
			const textWidth = trackEl.scrollWidth;
			if (textWidth <= 0) return;

			const tickerWidth = tickerEl.offsetWidth;

			// 需要至少填满 2 倍容器宽度 + 1 份文本，确保无缝
			const neededWidth = tickerWidth * 2 + textWidth;
			let needed = Math.ceil(neededWidth / textWidth);

			// 确保 copies 为偶数：动画使用 translateX(-50%)，
			// 偶数份才能保证 -50% 正好对齐到内容中点，实现无缝循环
			if (needed % 2 !== 0) needed += 1;
			// 至少 2 份
			if (needed < 2) needed = 2;

			copies = needed;
		});
	});
</script>

<div class="status" role="status" aria-label="站点广播">
	<span class="sr-only">{tickerSrText}</span>
	<span class="live"><i></i> 广播</span>
	<div class="ticker" aria-hidden="true" bind:this={tickerEl}>
		<div class="track" bind:this={trackEl}>
			{#each Array(copies), i (i)}
				<span class="text">{tickerSrText}</span>
			{/each}
		</div>
	</div>
</div>

<style>
	:global(.status) {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin: 1.4rem 0;
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		padding: 0.5rem 0.55rem 0.5rem 0.75rem;
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}
	.live {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-pixel);
		font-size: 0.4375rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--accent);
		background: var(--accent-soft);
		padding: 0.34rem 0.72rem;
		border-radius: var(--r-sm);
	}
	.live i {
		width: 7px;
		height: 7px;
		border-radius: var(--r-sm);
		background: var(--ok);
		animation: pulse 2.6s var(--ease) infinite;
	}

	.ticker {
		flex: 1 1 auto;
		overflow: hidden;
		position: relative;
		-webkit-mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
		mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
	}
	.track {
		display: flex;
		white-space: nowrap;
		animation: ticker-scroll 25s linear infinite;
		width: max-content;
	}
	.ticker:hover .track {
		animation-play-state: paused;
	}
	.text {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		color: var(--muted);
		letter-spacing: 0.04em;
		padding-right: var(--sp-xl);
	}

	@keyframes ticker-scroll {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}

	@media (max-width: 680px) {
		:global(.status) {
			margin: 1rem 0;
		}
		/* 移动端：禁用滚动动画，允许文本自然换行避免被裁剪 */
		.track {
			animation: none;
			width: 100%;
			white-space: normal;
		}
		.text {
			white-space: normal;
			padding-right: 0.5rem;
		}
		.ticker {
			-webkit-mask-image: none;
			mask-image: none;
		}
	}
</style>
