<script lang="ts">
	import { browser } from '$app/environment';
	import { slide } from 'svelte/transition';
	import { Heart, ChevronUp, ChevronRight } from 'svelte-lucide';
	import { sanitizeHTML } from '$lib/utils/sanitize';
	import { easeOut } from '$lib/utils/motion';
	import CommentForm from './CommentForm.svelte';
	import CommentItem from './CommentItem.svelte';
	import {
		likeComment,
		getGravatarUrl,
		type CommentData,
		type CommentConfig,
		type CommentUser
	} from '$lib/utils/comment';
	import { getRelativeTime } from '$lib/utils/frontmatter';
	import { openLightbox } from '$lib/stores/lightbox.svelte';
	import { getRank, getNextRank } from '$lib/utils/rank';

	// 验证 URL 只允许 https? 协议，防止 javascript: 等危险链接
	function sanitizeLink(url: string | null | undefined): string {
		if (!url) return '';
		try {
			const parsed = new URL(url);
			if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
				return url;
			}
		} catch {
			// 无效 URL 返回空
		}
		return '';
	}

	interface Props {
		comment: CommentData;
		url: string;
		title: string;
		config: CommentConfig;
		userInfo?: CommentUser | null;
		activeReplyId?: string | null;
		onReplyToggle?: (id: string) => void;
		onRefresh?: () => void;
		onLikeUpdated?: (id: string, liked: boolean, count: number) => void;
		nested?: boolean;
	}

	let {
		comment,
		url,
		title,
		config,
		userInfo,
		activeReplyId = null,
		onReplyToggle,
		onRefresh,
		onLikeUpdated,
		nested = false
	}: Props = $props();

	let isLiking = $state(false);
	let showReplies = $state(true);
	let showReplyForm = $derived(activeReplyId === comment.id);

	// ---- Rank hover card ----
	let showRankCard = $state(false);
	let cardLeaving = $state(false);
	let cardLeft = $state(0);
	let cardTop = $state(0);
	let avatarEl: HTMLElement | undefined = $state();
	let cardEl: HTMLElement | undefined = $state();
	let cardTimer: ReturnType<typeof setTimeout> | undefined;
	let hideCardTimer: ReturnType<typeof setTimeout> | undefined;
	let cardLeavingTimer: ReturnType<typeof setTimeout> | undefined;
	let isHoveringCard = $state(false);

	const avatarUrl = $derived(
		comment.avatar || getGravatarUrl(comment.mailMd5, config?.GRAVATAR_CDN || 'weavatar.com')
	);
	const effectiveCommentCount = $derived(comment.commentCount ?? (comment.master ? -1 : 0));
	const rank = $derived(getRank(effectiveCommentCount));
	const nextRank = $derived(getNextRank(effectiveCommentCount));
	const rankProgressPct = $derived(
		nextRank
			? Math.round(
					Math.min(
						(effectiveCommentCount - nextRank.currentMin) / (nextRank.min - nextRank.currentMin),
						1
					) * 100
				)
			: 100
	);
	const rankBorderStyle = $derived(
		rank.level > 0 ? `box-shadow: 0 0 0 2px ${rank.color}, 0 0 6px 1px ${rank.color}40` : ''
	);
	const displayTime = $derived(getRelativeTime(comment.created));
	// 博主评论统一显示站点名（兼容历史数据中 nick 存为「博主」/身份标签的情况）
	const displayNick = $derived(
		comment.master
			? config.SITE_NAME || config.BLOGGER_NAME || comment.nick || '博主'
			: comment.nick || '匿名'
	);
	function getReplyDisplayNick(
		replyUser: { nick?: string; mailMd5?: string } | string | undefined
	): string {
		if (!replyUser) return '';
		// 兼容后端两种返回格式：字符串（直接是昵称）或对象 { nick, mailMd5 }
		const nick = typeof replyUser === 'string' ? replyUser : replyUser.nick;
		if (!nick) return '';
		// 兼容历史数据：博主被 @ 时 replyUser.nick 可能存的是「博主」或 MASTER_TAG
		if (config.SITE_NAME && (nick === '博主' || nick === config.MASTER_TAG)) {
			return config.SITE_NAME;
		}
		return nick;
	}
	const uaInfo = $derived(
		comment.os || comment.browser
			? { os: comment.os ?? '', browser: comment.browser ?? '' }
			: comment.ua
				? parseUA(comment.ua)
				: null
	);

	function parseUA(ua: string): { os: string; browser: string } | null {
		let os = '';
		let browser = '';
		if (/Windows/i.test(ua)) os = /Windows NT 10/.test(ua) ? 'Windows 10/11' : 'Windows';
		else if (/Mac OS X|macOS/i.test(ua)) os = 'macOS';
		else if (/Android/i.test(ua)) os = 'Android';
		else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS';
		else if (/Linux/i.test(ua)) os = 'Linux';
		if (/Edg\//i.test(ua)) browser = 'Edge';
		else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
		else if (/Firefox\//i.test(ua)) browser = 'Firefox';
		else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
		return os || browser ? { os, browser } : null;
	}

	function processImageCdn(html: string): string {
		const imageCdn = config?.IMAGE_CDN;
		if (!imageCdn || !html) return html;
		const allowedDomains = imageCdn.split(',').map((d) => d.trim());
		return html.replace(
			/<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi,
			(match: string, before: string, src: string, after: string) => {
				try {
					const u = new URL(src);
					const isAllowed = allowedDomains.some(
						(d) => u.hostname === d || u.hostname.endsWith('.' + d)
					);
					if (!isAllowed) {
						const cdnUrl = src.replace(u.origin, allowedDomains[0]);
						return `<img${before}src="${cdnUrl}"${after}>`;
					}
				} catch {
					/* ignore */
				}
				return match;
			}
		);
	}

	const processedComment = $derived(sanitizeHTML(processImageCdn(comment.comment ?? '')));

	function positionAndShowCard() {
		if (avatarEl) {
			const rect = avatarEl.getBoundingClientRect();
			const gap = 8;
			const cardWidth = 200;
			// 卡片高度根据视口高度自适应，避免小屏幕溢出
			const maxCardHeight = Math.min(nested ? 90 : 160, window.innerHeight - gap * 2);
			const cardHeight = maxCardHeight;
			let left = Math.max(gap, Math.min(rect.left, window.innerWidth - cardWidth - gap));
			const belowRoom = window.innerHeight - rect.bottom - gap;
			if (belowRoom >= cardHeight) {
				cardTop = rect.bottom + gap;
			} else {
				cardTop = rect.top - gap - cardHeight;
				// 如果上方也不够，则顶部对齐
				if (cardTop < gap) cardTop = gap;
			}
			cardLeft = Math.round(left);
			cardLeaving = false;
			showRankCard = true;
		}
	}
	function cancelHide() {
		clearTimeout(cardTimer);
		clearTimeout(hideCardTimer);
		clearTimeout(cardLeavingTimer);
	}
	function scheduleHide() {
		if (!showRankCard) return;
		clearTimeout(cardLeavingTimer);
		hideCardTimer = setTimeout(() => {
			if (!isHoveringCard) {
				cardLeaving = true;
				cardLeavingTimer = setTimeout(() => {
					if (!isHoveringCard) {
						showRankCard = false;
						cardLeaving = false;
					}
				}, 120);
			}
		}, 80);
	}
	function handleRankCardEnter() {
		if (rank.level <= 0) return;
		cancelHide();
		isHoveringCard = false;
		if (showRankCard) {
			cardLeaving = false;
			positionAndShowCard();
			return;
		}
		cardTimer = setTimeout(positionAndShowCard, 200);
	}
	function handleRankCardLeave() {
		clearTimeout(cardTimer);
		scheduleHide();
	}
	function handleCardEnter() {
		isHoveringCard = true;
		cardLeaving = false;
		cancelHide();
	}
	function handleCardLeave() {
		isHoveringCard = false;
		scheduleHide();
	}

	// 滚动时隐藏等级卡片。使用 effect 自动管理监听器生命周期，避免累积。
	$effect(() => {
		if (!showRankCard) return;
		const onScroll = () => {
			if (!isHoveringCard) {
				showRankCard = false;
				cardLeaving = false;
			}
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	// 等级卡片使用 position:fixed + z-index，无需 teleport 到 body

	let likeError = $state(false);

	async function handleLike(e: Event) {
		if (isLiking || !browser) return;
		const btn = e.currentTarget as HTMLElement;
		btn.classList.add('pop');
		isLiking = true;
		likeError = false;

		// 乐观更新
		const wasLiked = comment.liked ?? false;
		const newLiked = !wasLiked;
		const newCount = newLiked ? comment.like + 1 : Math.max(0, comment.like - 1);
		onLikeUpdated?.(comment.id, newLiked, newCount);

		try {
			const success = await likeComment(comment.id);
			if (!success) {
				// API 返回失败，回滚
				onLikeUpdated?.(comment.id, wasLiked, comment.like);
				likeError = true;
			}
		} catch {
			// 网络异常，回滚
			onLikeUpdated?.(comment.id, wasLiked, comment.like);
			likeError = true;
		} finally {
			isLiking = false;
		}
		setTimeout(() => btn.classList.remove('pop'), 350);
	}
	function toggleReplies() {
		showReplies = !showReplies;
	}
	function handleReplySubmitted() {
		onReplyToggle?.(comment.id);
		onRefresh?.();
	}
	function handleContentClick(e: MouseEvent | KeyboardEvent) {
		if (config.LIGHTBOX !== 'true') return;
		const target = e.target as HTMLElement;
		if (target.tagName === 'IMG') {
			const img = target as HTMLImageElement;
			openLightbox(img.src, img.alt);
		}
	}
</script>

<div
	class="comment"
	id={comment.id}
	class:nested
	class:top={comment.top === 1}
	class:pending={comment.pending}
>
	<div
		class="ava-wrap"
		role="img"
		aria-label="头像"
		bind:this={avatarEl}
		onmouseenter={handleRankCardEnter}
		onmouseleave={handleRankCardLeave}
	>
		{#if comment.link}
			{@const safeLink = sanitizeLink(comment.link)}
			{#if safeLink}
				<a
					href={safeLink}
					target="_blank"
					rel="noopener noreferrer"
					class="ava-link"
					aria-label={`${displayNick}的个人链接`}
				>
					<span
						class="ava"
						style={`background-image:url(${avatarUrl});background-size:cover;${rankBorderStyle}`}
					></span>
				</a>
			{:else}
				<span
					class="ava"
					style={`background-image:url(${avatarUrl});background-size:cover;${rankBorderStyle}`}
				></span>
			{/if}
		{:else}
			<span
				class="ava"
				style={`background-image:url(${avatarUrl});background-size:cover;${rankBorderStyle}`}
			></span>
		{/if}
	</div>

	<div class="content">
		<div class="bubble">
			<div class="who">
				<span class="name">
					{#if comment.link}
						{@const safeLink = sanitizeLink(comment.link)}
						{#if safeLink}
							<a href={safeLink} target="_blank" rel="noopener noreferrer">{displayNick}</a>
						{:else}
							{displayNick}
						{/if}
					{:else}
						{displayNick}
					{/if}
				</span>
				{#if comment.master}
					<span class="badge-op">{config.MASTER_TAG || '作者'}</span>
				{/if}
				{#if comment.top === 1}
					<span class="badge-top">置顶</span>
				{/if}
				{#if comment.pending}
					<span class="badge-pending">待审核</span>
				{/if}
				<span class="time">{displayTime}</span>
			</div>
			{#if config.LIGHTBOX === 'true'}
				<div
					role="button"
					class="text text-clickable"
					aria-label="评论内容，点击查看图片"
					onclick={handleContentClick}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') handleContentClick(e);
					}}
					tabindex="0"
				>
					{#if comment.replyUser}<span class="reply-to"
							>@{getReplyDisplayNick(comment.replyUser)}</span
						>{/if}
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html processedComment}
				</div>
			{:else}
				<div class="text">
					{#if comment.replyUser}<span class="reply-to"
							>@{getReplyDisplayNick(comment.replyUser)}</span
						>{/if}
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html processedComment}
				</div>
			{/if}
			{#if !comment.pending}
				<div class="ops">
					<button
						class="like"
						class:liked={comment.liked}
						class:err={likeError}
						onclick={handleLike}
						disabled={isLiking}
					>
						<Heart size="12" fill={comment.liked ? 'currentColor' : 'none'} strokeWidth="1.6" />
						{#if comment.like > 0}<span class="cnt">{comment.like}</span>{/if}
					</button>
					<button class="reply-btn" onclick={() => onReplyToggle?.(comment.id)}>回复</button>
					{#if likeError}<span class="like-err">点赞失败</span>{/if}
					{#if uaInfo || (comment.ipRegion && config.SHOW_REGION !== 'false')}
						<span class="meta-tags">
							{#if uaInfo && config.SHOW_UA !== 'false'}
								{#if uaInfo.os}<span>{uaInfo.os}</span>{/if}
								{#if uaInfo.browser}<span>{uaInfo.browser}</span>{/if}
							{/if}
							{#if comment.ipRegion && config.SHOW_REGION !== 'false'}
								<span>{comment.ipRegion}</span>
							{/if}
						</span>
					{/if}
				</div>
			{/if}
		</div>

		{#if showReplyForm && !comment.pending}
			<CommentForm
				{url}
				{title}
				parentId={comment.id}
				rootId={comment.rid || comment.id}
				{config}
				{userInfo}
				compact
				onSubmitted={handleReplySubmitted}
				onCancel={() => onReplyToggle?.(comment.id)}
			/>
		{/if}

		{#if comment.replies && comment.replies.length > 0 && !comment.pending}
			<div class="replies-wrap">
				<button class="replies-toggle" onclick={toggleReplies}>
					{#if showReplies}<ChevronUp size="13" strokeWidth="1.6" />{:else}<ChevronRight
							size="13"
							strokeWidth="1.6"
						/>{/if}
					<span
						>{#if showReplies}收起 {comment.replies.length} 条回复{:else}展开 {comment.replies
								.length} 条回复{/if}</span
					>
				</button>
				{#if showReplies}
					<div class="replies" transition:slide={{ duration: 350, easing: easeOut }}>
						{#each comment.replies as reply (reply.id)}
							<CommentItem
								comment={reply}
								{url}
								{title}
								{config}
								{userInfo}
								{activeReplyId}
								{onReplyToggle}
								{onRefresh}
								{onLikeUpdated}
								nested
							/>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

{#if showRankCard && rank.level > 0}
	<div
		bind:this={cardEl}
		class="rank-card"
		class:leaving={cardLeaving}
		role="tooltip"
		aria-label="{displayNick} 的等级信息"
		style="left: {cardLeft}px; top: {cardTop}px; --rank-color: {rank.color}"
		onmouseenter={handleCardEnter}
		onmouseleave={handleCardLeave}
	>
		<div class="rank-card-accent"></div>
		<div class="rank-card-inner">
			<div class="rank-card-header">
				<div class="rank-card-avatar">
					<img src={avatarUrl} alt={displayNick} loading="lazy" />
				</div>
				<div class="rank-card-header-text">
					<div class="rank-card-office">{rank.label}</div>
					{#if rank.level === 99}
						<span class="rank-card-grade">博主</span>
					{:else if rank.grade}
						<span class="rank-card-grade">{rank.grade}</span>
					{/if}
				</div>
			</div>
			<div class="rank-card-divider"></div>
			{#if rank.level === 99}
				<div class="rank-card-stats">
					<div class="rank-card-stat">
						<div class="rank-card-stat-label">等级</div>
						<div class="rank-card-stat-value">至高无上</div>
					</div>
				</div>
			{:else if effectiveCommentCount >= 0}
				<div class="rank-card-stats">
					<div class="rank-card-stat">
						<div class="rank-card-stat-label">累计评论</div>
						<div class="rank-card-stat-value">{effectiveCommentCount}</div>
					</div>
					{#if nextRank}
						<div class="rank-card-stat">
							<div class="rank-card-stat-label">下一级</div>
							<div class="rank-card-stat-value">{nextRank.min}<span class="unit"> 条</span></div>
						</div>
					{:else if effectiveCommentCount >= 2000}
						<div class="rank-card-stat">
							<div class="rank-card-stat-label">下一级</div>
							<div class="rank-card-stat-value" style="color: var(--muted);">已满级</div>
						</div>
					{/if}
				</div>
				{#if nextRank}
					<div class="rank-card-progress">
						<div
							class="rank-card-progress-bar"
							role="progressbar"
							aria-label="距离下一等级的进度"
							aria-valuenow={effectiveCommentCount}
							aria-valuemin={nextRank.currentMin}
							aria-valuemax={nextRank.min}
						>
							<div class="fill" style="transform: scaleX({rankProgressPct / 100})"></div>
						</div>
						<div class="rank-card-progress-text">
							<span>当前 {effectiveCommentCount}</span>
							<span style="font-weight: 600; color: var(--rank-color);">{rankProgressPct}%</span>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.comment {
		display: flex;
		gap: 0.85rem;
	}
	.ava-wrap {
		position: relative;
		flex-shrink: 0;
		cursor: default;
		align-self: flex-start;
		width: 40px;
		height: 40px;
	}
	.ava-wrap .ava {
		width: 40px;
		height: 40px;
		border-radius: var(--r-sm);
		display: block;
		background: var(--grad-ava-2);
	}
	.ava-link .ava {
		margin-block-start: 2px;
		cursor: pointer;
		transition: filter 0.2s var(--ease);
	}
	.ava-link:hover .ava {
		filter: brightness(1.1);
	}
	.comment .content {
		flex: 1;
		min-width: 0;
	}
	.comment .bubble {
		background: var(--surface);
		border: var(--pixel-border);
		/* 左上无圆角，模拟对话气泡指向 */
		border-radius: 0 var(--r-md) var(--r-md) var(--r-md);
		padding: 0.85rem 1.05rem;
		box-shadow: var(--shadow-sm);
	}
	.comment.top .bubble {
		border-color: var(--accent);
		background: var(--accent-soft);
	}
	.comment.pending .bubble {
		border-style: dashed;
		opacity: 0.7;
	}
	.comment .who {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.comment .who .name {
		font-weight: 600;
		font-size: var(--text-sm-2);
		color: var(--fg);
	}
	.comment .who .name a {
		color: var(--fg);
		font-weight: 600;
		font-size: var(--text-sm-2);
		transition: color 0.2s var(--ease);
	}
	.comment .who .name a:hover {
		color: var(--accent);
	}
	.badge-op {
		font-family: var(--font-mono);
		font-size: 9px;
		letter-spacing: 0.08em;
		color: var(--on-accent);
		background: var(--accent-3);
		padding: 0.12rem 0.4rem;
		border-radius: var(--r-sm);
		text-transform: uppercase;
	}
	:global([data-theme='dark']) .badge-op {
		color: var(--on-accent);
	}
	.badge-top {
		font-family: var(--font-mono);
		font-size: 9px;
		color: var(--on-accent);
		background: var(--ok);
		padding: 0.12rem 0.4rem;
		border-radius: var(--r-sm);
	}
	.badge-pending {
		font-family: var(--font-mono);
		font-size: 9px;
		color: var(--on-accent);
		background: var(--muted);
		padding: 0.12rem 0.4rem;
		border-radius: var(--r-sm);
	}
	.comment .who .time {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--muted);
	}
	.comment .text {
		font-size: var(--text-sm-2);
		color: var(--dim);
		line-height: 1.72;
		margin-top: 0.45rem;
		word-break: break-word;
	}
	.comment .text :global(a) {
		color: var(--accent);
	}
	.comment .text :global(img) {
		max-width: 100px;
		border-radius: var(--r-sm);
		margin-top: 0.3rem;
		transition: transform 0.2s var(--ease);
	}
	.comment .text-clickable {
		cursor: default;
		background: none;
		border: none;
		font: inherit;
		text-align: left;
		padding: 0;
		width: 100%;
		color: var(--dim);
	}
	.comment .text-clickable :global(img) {
		cursor: zoom-in;
	}
	.comment .text-clickable :global(img:hover) {
		transform: scale(1.02);
	}
	.reply-to {
		color: var(--accent);
		font-weight: 500;
		margin-right: 0.2rem;
	}
	.comment .ops {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 0.5rem;
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--muted);
	}
	.comment .ops .meta-tags {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	.comment .ops .meta-tags span {
		font-family: var(--font-mono);
		font-size: 9px;
		color: var(--muted);
		background: var(--bg);
		border: var(--pixel-border);
		padding: 0 4px;
		border-radius: var(--r-sm);
	}
	.comment .ops button {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--muted);
		font-family: var(--font-mono);
		font-size: 10px;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		transition: color 0.2s var(--ease);
	}
	.comment .ops button:hover {
		color: var(--accent);
	}
	.comment .ops .liked {
		color: var(--accent);
	}
	.comment .ops .like.err {
		color: var(--warn);
		animation: c-shake 0.4s var(--ease);
	}
	.comment .ops .like-err {
		font-size: 9px;
		color: var(--warn);
		opacity: 0.8;
	}
	.comment .ops .like .cnt {
		font-variant-numeric: tabular-nums;
	}
	:global(.like svg) {
		transition: transform 0.2s var(--ease);
	}
	:global(.like:active svg) {
		transform: scale(1.4);
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
	:global(.like.pop svg) {
		animation: like-pop 0.35s var(--ease);
	}

	.replies-wrap {
		margin-top: 0.5rem;
	}
	.replies-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-family: var(--font-mono);
		font-size: 9px;
		color: var(--muted);
		cursor: pointer;
		transition: color 0.2s var(--ease);
		border: none;
		background: none;
	}
	.replies-toggle:hover {
		color: var(--accent);
	}
	:global(.replies) {
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-left: 1.1rem;
		/* 顶部留出空间，避免 slide 动画期间裁剪嵌套头像的 box-shadow 等级边框 */
		padding-top: 0.2rem;
		border-left: 2px solid var(--border-l);
		/* 不设 overflow:hidden，由 transition:slide 在动画期间临时处理；
		   永久 hidden 会裁剪嵌套表单的表情/图片面板 */
	}
	:global(.replies .ava-wrap) {
		width: 32px;
		height: 32px;
	}
	:global(.replies .ava-wrap .ava) {
		width: 32px;
		height: 32px;
	}
	:global(.replies .bubble) {
		padding: 0.65rem 0.9rem;
	}

	/* ---- Rank hover card ---- */
	.rank-card {
		position: fixed;
		z-index: 10000;
		min-width: 200px;
		background: var(--bg);
		border-radius: 0;
		box-shadow: var(--shadow-lg);
		animation: rank-card-in 0.15s var(--ease) forwards;
		overflow: hidden;
		will-change: transform, opacity;
	}
	.rank-card.leaving {
		animation: rank-card-out 0.12s var(--ease) forwards;
	}
	@keyframes rank-card-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes rank-card-out {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(4px);
		}
	}
	.rank-card-accent {
		height: 0.1875rem;
		background: var(--rank-color);
	}
	.rank-card-inner {
		padding: 0.875rem 1rem;
	}
	.rank-card-header {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		margin-bottom: 0.625rem;
	}
	.rank-card-avatar {
		width: 2rem;
		height: 2rem;
		border-radius: 0;
		overflow: hidden;
		flex-shrink: 0;
		box-shadow: 0 0 0 0.0938rem var(--rank-color);
	}
	.rank-card-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.rank-card-header-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.rank-card-office {
		font-size: var(--text-sm-2);
		font-weight: 700;
		color: var(--fg);
		line-height: 1.3;
	}
	.rank-card-grade {
		font-size: 10px;
		font-weight: 700;
		color: var(--rank-color);
		background: color-mix(in srgb, var(--rank-color) 12%, transparent);
		padding: 0.0625rem 0.375rem;
		border-radius: 0;
		display: inline-block;
		width: fit-content;
	}
	.rank-card-divider {
		height: 0.0625rem;
		background: var(--border-l);
		margin: 0 -1rem 0.625rem;
	}
	.rank-card-stats {
		display: flex;
		gap: 1rem;
	}
	.rank-card-stat {
		flex: 1;
	}
	.rank-card-stat-label {
		font-size: 10px;
		color: var(--muted);
		margin-bottom: 0.125rem;
	}
	.rank-card-stat-value {
		font-size: var(--text-sm-2);
		font-weight: 700;
		color: var(--fg);
	}
	.rank-card-stat-value .unit {
		font-size: 10px;
		font-weight: 400;
		color: var(--muted);
	}
	.rank-card-progress {
		margin-top: 0.625rem;
	}
	.rank-card-progress-bar {
		height: 0.25rem;
		border-radius: 0;
		background: var(--bg);
		overflow: hidden;
	}
	.rank-card-progress-bar .fill {
		height: 100%;
		width: 100%;
		border-radius: 0;
		background: var(--rank-color);
		transform-origin: left center;
		transition: transform 0.3s var(--ease);
	}
	.rank-card-progress-text {
		display: flex;
		justify-content: space-between;
		font-size: 10px;
		color: var(--muted);
		margin-top: 0.1875rem;
	}

	@media (max-width: 900px) {
		.comment .bubble {
			/* 移动端无左侧缩进，不需要气泡指向，恢复四角圆角 */
			border-radius: var(--r-md);
		}
		:global(.replies) {
			padding-left: 0;
			border-left: none;
			position: relative;
			margin-left: calc(-40px - 0.85rem);
		}
		:global(.replies::before) {
			content: '';
			position: absolute;
			left: 20px;
			top: -40%;
			height: 100%;
			width: 2px;
			background: var(--border-l);
			z-index: -1;
		}
	}

	@media (max-width: 680px) {
		.comment .ops {
			flex-wrap: wrap;
			gap: 0.5rem;
		}
		.comment .ops .meta-tags {
			margin-left: 0;
			width: 100%;
			justify-content: flex-start;
			order: 3;
		}
	}
</style>
