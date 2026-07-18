<script lang="ts">
	import { slide } from 'svelte/transition';
	import CommentSection from '$lib/components/comment/CommentSection.svelte';
	import ThumbnailRow from '$lib/components/shared/ThumbnailRow.svelte';
	import RevealItem from '$lib/components/shared/RevealItem.svelte';
	import { easeOut } from '$lib/utils/motion';
	import { Heart, MessageCircle } from 'svelte-lucide';
	import type { TimelineNote } from '$lib/types';

	interface CommentSummaryItem {
		count: number;
		commenters: { avatarUrl: string }[];
	}

	interface Props {
		note: TimelineNote;
		liked?: boolean;
		likes?: number;
		liking?: boolean;
		onLike?: () => void;
		commentSummary?: CommentSummaryItem;
	}

	let {
		note,
		liked = false,
		likes = 0,
		liking = false,
		onLike = () => {},
		commentSummary = undefined
	}: Props = $props();

	let showComments = $state(false);

	const avatars = $derived(commentSummary?.commenters?.slice(0, 10) ?? []);
	const displayCount = $derived(commentSummary?.count ?? 0);
	const hasComments = $derived(displayCount > 0);
</script>

<RevealItem variant="up" class="tl-item">
	<div class="time">{note.time}</div>
	<div class="tl-card" role="article">
		<p>{note.text}</p>
		{#if note.images && note.images.length > 0}
			<ThumbnailRow images={note.images} />
		{/if}
		<div class="acts">
			<button class="act like-btn" class:liked onclick={onLike} disabled={liking} aria-label="点赞">
				<Heart size="11" strokeWidth="1.6" fill={liked ? 'currentColor' : 'none'} />
				{likes > 0 ? likes : '0'} 赞
			</button>
			<button
				class="act comment-btn"
				onclick={() => (showComments = !showComments)}
				aria-label="评论"
			>
				{#if hasComments}
					<div class="cm-avatars">
						{#each avatars as av, i (i)}
							<img
								src={av.avatarUrl}
								alt=""
								class="cm-ava"
								loading="lazy"
								style="z-index: {10 - i}; margin-left: {i > 0 ? '-10px' : '0'}"
							/>
						{/each}
					</div>
				{:else}
					<MessageCircle size="11" strokeWidth="1.6" />
				{/if}
				{displayCount > 0 ? displayCount : ''} 评论
			</button>
		</div>
	</div>
</RevealItem>

{#if showComments}
	<div class="tl-comments" transition:slide={{ duration: 350, easing: easeOut }}>
		<CommentSection url={`/moments/${note.id}`} title={note.text} />
	</div>
{/if}

<style>
	:global {
		.tl-item {
			position: relative;
			margin-bottom: 1.2rem;
		}
		.tl-item::before {
			content: '';
			position: absolute;
			left: -1.6rem;
			top: 0.55rem;
			width: 12px;
			height: 12px;
			border-radius: var(--r-sm);
			background: var(--surface);
			border: 2px solid var(--accent);
		}
		.time {
			font-family: var(--font-mono);
			font-size: 0.625rem;
			color: var(--accent);
			letter-spacing: 0.04em;
		}
		.tl-card {
			background: var(--surface);
			border: var(--pixel-border);
			padding: var(--sp-sm);
			box-shadow: var(--pixel-shadow);
			margin-top: 0.45rem;
			position: relative;
			transition:
				border-color 0.2s var(--ease),
				transform 0.2s var(--ease),
				box-shadow 0.2s var(--ease);
		}
		.tl-card:hover {
			transform: translate(-2px, -2px);
			border-color: var(--accent);
			box-shadow: var(--pixel-shadow-hover);
		}
		.tl-card:focus-within {
			outline: 2px solid var(--accent);
			outline-offset: 3px;
		}
		p {
			font-size: var(--text-sm-2);
			line-height: 1.72;
			color: var(--fg);
		}

		/* ── 操作按钮 ── */
		.acts {
			display: flex;
			gap: 1.1rem;
			margin-top: 0.7rem;
		}
		.act {
			display: inline-flex;
			align-items: center;
			gap: 0.3rem;
			font-family: var(--font-mono);
			font-size: 0.625rem;
			color: var(--muted);
			background: none;
			border: none;
			cursor: pointer;
			padding: 0.2rem 0.4rem;
			border-radius: var(--r-sm);
			letter-spacing: 0.04em;
			transition:
				color 0.2s var(--ease),
				background 0.2s var(--ease);
		}
		.like-btn:hover {
			color: var(--accent);
			background: var(--accent-soft);
		}
		.like-btn.liked {
			color: var(--accent);
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
		.comment-btn:hover {
			color: var(--accent-3);
			background: color-mix(in oklch, var(--accent-3) 8%, transparent);
		}

		/* ── 评论头像叠加 ── */
		.cm-avatars {
			display: flex;
			align-items: center;
		}
		.cm-ava {
			width: 16px;
			height: 16px;
			border-radius: var(--r-sm);
			border: 1.5px solid var(--surface);
			object-fit: cover;
			flex-shrink: 0;
		}

		/* ── 评论展开区 ── */
		:global(.tl-comments) {
			overflow: hidden;
			margin: 1.2rem 0;
			padding-left: 0.1rem;
		}
		:global(.tl-comments .comments) {
			margin: 0;
			padding-left: 0.1rem;
		}
		@media (max-width: 680px) {
			.tl-card {
				padding: 0.9rem 1rem;
			}
			.tl-card p {
				font-size: 0.75rem;
			}
		}
	}
</style>
