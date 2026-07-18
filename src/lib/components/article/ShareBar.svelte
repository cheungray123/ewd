<script lang="ts">
	/**
	 * ShareBar — 文章底部标签 + 点赞 + 分享栏
	 *
	 * 布局：[标签列表 ......... 点赞 | 分享按钮]
	 * - 点赞按钮：复用 likeStore（说说点赞逻辑）+ 评论点赞动画
	 * - 分享按钮：点击弹出浮动面板（二维码在上，复制链接在下），点击外部自动关闭
	 */

	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Heart, Share2, Copy, Check } from 'svelte-lucide';
	import { site } from '$lib/settings/site';
	import { page } from '$app/state';
	import { likeStore } from '$lib/stores/like.svelte';
	import { easeOut } from '$lib/utils/motion';

	interface TagItem {
		label: string;
		type: 'acc' | 'line';
	}

	interface ShareBarProps {
		title: string;
		slug: string;
		tags: TagItem[];
		path?: string;
	}

	let { title, slug, tags, path }: ShareBarProps = $props();

	// 点赞
	let likeId = $derived(`/posts/${slug}`);
	let liked = $derived(likeStore.isLiked(likeId));
	let likes = $derived(likeStore.getLikes(likeId));
	let liking = $derived(likeStore.isLiking(likeId));

	onMount(() => {
		likeStore.init();
		likeStore.loadAll([likeId]);
	});

	function handleLike(e: Event) {
		const btn = e.currentTarget as HTMLElement;
		btn.classList.add('pop');
		likeStore.toggle(likeId);
		setTimeout(() => btn.classList.remove('pop'), 350);
	}

	// 分享面板
	let showShare = $state(false);
	let shareWrap: HTMLElement | undefined = $state();

	let shareUrl = $derived(`${site.url}${path || page.url.pathname}`);
	let qrUrl = $derived(
		`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`
	);

	// 点击外部关闭
	function handleWindowClick(e: MouseEvent) {
		if (!showShare) return;
		if (shareWrap && !shareWrap.contains(e.target as Node)) {
			showShare = false;
		}
	}
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') showShare = false;
	}

	// 复制链接
	let copied = $state(false);
	let copyFailed = $state(false);
	async function copyLink() {
		copyFailed = false;
		// 优先使用 Clipboard API（仅在 HTTPS 或 localhost 下可用）
		if (navigator.clipboard && window.isSecureContext) {
			try {
				await navigator.clipboard.writeText(shareUrl);
				copied = true;
				setTimeout(() => (copied = false), 2000);
				return;
			} catch {
				/* 回退到 execCommand */
			}
		}
		// 回退方案：使用 textarea + execCommand
		try {
			const textarea = document.createElement('textarea');
			textarea.value = shareUrl;
			textarea.style.position = 'fixed';
			textarea.style.left = '-9999px';
			textarea.style.top = '0';
			textarea.setAttribute('readonly', '');
			document.body.appendChild(textarea);
			textarea.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(textarea);
			if (ok) {
				copied = true;
				setTimeout(() => (copied = false), 2000);
			} else {
				copyFailed = true;
			}
		} catch {
			copyFailed = true;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<div class="share-bar">
	<!-- 左侧：标签 -->
	<div class="tags-left">
		{#each tags as tag (tag.label)}
			<a class="tag-pill {tag.type}" href="/tags/{encodeURIComponent(tag.label)}">
				#{tag.label}
			</a>
		{/each}
	</div>

	<!-- 右侧：点赞 + 分享 -->
	<div class="actions-right" bind:this={shareWrap}>
		<!-- 点赞按钮 -->
		<button
			class="like-btn"
			class:liked
			onclick={handleLike}
			disabled={liking}
			aria-label="点赞文章"
			aria-pressed={liked}
		>
			<Heart size="15" strokeWidth="1.6" fill={liked ? 'currentColor' : 'none'} />
			{#if likes > 0}
				<span class="like-count">{likes}</span>
			{/if}
		</button>

		<!-- 分享按钮 -->
		<button
			class="share-btn"
			class:active={showShare}
			onclick={() => (showShare = !showShare)}
			aria-label="分享文章"
			aria-expanded={showShare}
		>
			<Share2 size="15" strokeWidth="1.6" />
			<span>分享</span>
		</button>

		<!-- 浮动分享面板（向上弹出） -->
		{#if showShare}
			<div class="share-panel" transition:fly={{ y: 8, duration: 200, easing: easeOut }}>
				<!-- 二维码 -->
				<div class="qr-section">
					<img src={qrUrl} alt="扫码分享文章" width="140" height="140" loading="lazy" />
			<span class="qr-tip">微信扫码分享</span>
			</div>
				<!-- 复制链接 -->
				<button class="copy-btn" onclick={copyLink}>
					{#if copied}
						<Check size="15" strokeWidth="1.6" />
						<span>已复制</span>
					{:else if copyFailed}
						<Copy size="15" strokeWidth="1.6" />
						<span>复制失败，请手动复制</span>
					{:else}
						<Copy size="15" strokeWidth="1.6" />
						<span>复制链接</span>
					{/if}
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.share-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin: 2rem 0;
		flex-wrap: wrap;
	}

	/* 标签 */
	.tags-left {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.tag-pill {
		text-decoration: none;
		font-family: var(--font-mono);
		font-size: 11px;
		padding: 0.3rem 0.7rem;
		border-radius: var(--r-sm);
		border: var(--pixel-border);
		color: var(--dim);
		transition:
			border-color 0.25s var(--ease),
			color 0.25s var(--ease),
			transform 0.25s var(--ease);
	}
	.tag-pill.acc {
		background: var(--accent-soft);
		color: var(--accent);
		border-color: transparent;
	}
	.tag-pill:hover {
		border-color: var(--accent);
		color: var(--accent);
		transform: translateY(-1px);
	}

	/* 操作区 */
	.actions-right {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-shrink: 0;
		position: relative;
	}

	/* 点赞按钮 */
	.like-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 36px;
		padding: 0 0.75rem;
		border-radius: var(--r-sm);
		border: var(--pixel-border);
		background: var(--surface);
		color: var(--dim);
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 11px;
		transition:
			border-color 0.25s var(--ease),
			color 0.25s var(--ease),
			background 0.25s var(--ease);
	}
	.like-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}
	.like-btn.liked {
		color: var(--accent);
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.like-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.like-btn :global(svg) {
		transition: transform 0.2s var(--ease);
	}
	.like-btn:active :global(svg) {
		transform: scale(1.4);
	}
	.like-count {
		font-variant-numeric: tabular-nums;
	}
	@keyframes like-pop {
		0% {
			transform: scale(1);
		}
		40% {
			transform: scale(1.35);
		}
		70% {
			transform: scale(0.9);
		}
		100% {
			transform: scale(1);
		}
	}
	:global(.like-btn.pop svg) {
		animation: like-pop 0.35s var(--ease);
	}

	/* 分享按钮 */
	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 36px;
		padding: 0 0.9rem;
		border-radius: var(--r-sm);
		border: var(--pixel-border);
		background: var(--surface);
		color: var(--dim);
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 11px;
		transition:
			border-color 0.25s var(--ease),
			color 0.25s var(--ease),
			background 0.25s var(--ease);
	}
	.share-btn:hover,
	.share-btn.active {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}

	/* 浮动面板（向上弹出） */
	.share-panel {
		position: absolute;
		bottom: calc(100% + 0.6rem);
		right: 0;
		z-index: 100;
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-md);
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
		min-width: 180px;
	}

	/* 小三角箭头（向下） */
	.share-panel::before {
		content: '';
		position: absolute;
		bottom: -6px;
		right: 1.5rem;
		width: 10px;
		height: 10px;
		background: var(--surface);
		border-right: 1px solid var(--border-l);
		border-bottom: 1px solid var(--border-l);
		transform: rotate(45deg);
	}

	/* 二维码 */
	.qr-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}
	.qr-section img {
		border-radius: var(--r-sm);
		display: block;
	}
	.qr-tip {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--muted);
	}

	/* 复制按钮 */
	.copy-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		width: 100%;
		height: 36px;
		border-radius: var(--r-sm);
		border: var(--pixel-border);
		background: var(--bg);
		color: var(--dim);
		cursor: pointer;
		font-family: var(--font-mono);
		font-size: 11px;
		transition:
			border-color 0.25s var(--ease),
			color 0.25s var(--ease),
			background 0.25s var(--ease);
	}
	.copy-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-soft);
	}

	@media (max-width: 680px) {
		.share-bar {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.8rem;
		}
		.actions-right {
			align-self: flex-end;
		}
	}
</style>
