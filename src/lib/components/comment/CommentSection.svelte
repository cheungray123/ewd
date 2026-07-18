<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy, tick } from 'svelte';
	import CommentItem from './CommentItem.svelte';
	import CommentForm from './CommentForm.svelte';
	import CommentHeader from './CommentHeader.svelte';
	import CommentLoading from './CommentLoading.svelte';
	import {
		getComments,
		getConfig,
		loadUser,
		type CommentData,
		type CommentConfig,
		type CommentUser
	} from '$lib/utils/comment';

	interface Props {
		url: string;
		title?: string;
	}

	let { url, title = '' }: Props = $props();

	const defaultConfig: CommentConfig = {
		VERSION: '1.0.0',
		IS_ADMIN: false,
		SITE_NAME: '博客',
		SITE_URL: '',
		MASTER_TAG: '作者',
		BLOGGER_NAME: '',
		GRAVATAR_CDN: 'weavatar.com',
		DEFAULT_GRAVATAR: 'initials',
		SHOW_IMAGE: 'true',
		SHOW_EMOTION: 'true',
		SHOW_UA: 'true',
		SHOW_REGION: 'true',
		SHOW_ORDER: 'true',
		LIGHTBOX: 'true',
		HIGHLIGHT: 'true',
		HIGHLIGHT_THEME: '',
		DISPLAYED_FIELDS: ['nick', 'mail', 'link'],
		REQUIRED_FIELDS: ['nick', 'mail'],
		COMMENT_PLACEHOLDER: '说点什么吧…',
		COMMENT_PAGE_SIZE: '8',
		LIMIT_LENGTH: { nick: 30, mail: 100, link: 255, comment: 5000 },
		TURNSTILE_SITE_KEY: '',
		GEETEST_CAPTCHA_ID: '',
		CAPTCHA_PROVIDER: '',
		IMAGE_CDN: '',
		COMMENT_BG_IMG: '',
		SHOW_LOCAL_UPLOAD: 'true'
	};

	let comments = $state<CommentData[]>([]);
	let config = $state<CommentConfig>(defaultConfig);
	let user = $state<CommentUser | null>(null);
	let loading = $state(true);
	let page = $state(1);
	let count = $state(0);
	let error = $state<string | null>(null);
	let requestVersion = 0;
	let configLoaded = $state(false);
	let sortOrder = $state<'latest' | 'earliest'>('latest');
	let activeReplyId = $state<string | null>(null);

	const activeConfig = $derived(config || defaultConfig);
	const pageSize = $derived(parseInt(activeConfig.COMMENT_PAGE_SIZE) || 10);
	const totalPages = $derived(count > 0 ? Math.ceil(count / pageSize) : 1);
	const replyCount = $derived(comments.reduce((sum, c) => sum + (c.replies?.length || 0), 0));
	const ANIMATION_DELAY_MS = 50;

	const sortedComments = $derived.by(() => {
		if (activeConfig.SHOW_ORDER === 'false') return comments;
		return comments.toSorted((a: CommentData, b: CommentData) => {
			if (a.pending !== b.pending) return a.pending ? -1 : 1;
			return sortOrder === 'latest' ? b.created - a.created : a.created - b.created;
		});
	});

	let highlightLoaded = false;
	let highlightTimer: ReturnType<typeof setTimeout> | undefined;

	async function highlightCode() {
		if (typeof window === 'undefined') return;
		if (!highlightLoaded) highlightLoaded = true;
		try {
			const { highlightComments } = await import('$lib/utils/speed-highlight');
			await highlightComments();
		} catch {
			/* ignore */
		}
	}

	onMount(async () => {
		user = loadUser();
		try {
			const serverConfig = await getConfig();
			if (serverConfig) {
				config = serverConfig;
				if (serverConfig.IS_ADMIN === true || serverConfig.IS_ADMIN === 'true') {
					user = { nick: '', mail: '', link: '' };
				}
			}
		} catch (e) {
			console.warn('[CommentSection] 加载配置失败，使用默认配置', e);
		}
		configLoaded = true;
		await loadComments();
		if (activeConfig.HIGHLIGHT !== 'false') highlightCode();

		if (browser && location.hash) {
			const id = location.hash.slice(1);
			await tick();
			const scrollAndHighlight = (retry = 0) => {
				const el = document.getElementById(id);
				if (el) {
					el.scrollIntoView({ behavior: 'smooth', block: 'center' });
					el.classList.add('cm-highlight');
					setTimeout(() => el.classList.remove('cm-highlight'), 3000);
				} else if (retry < 5) {
					setTimeout(() => scrollAndHighlight(retry + 1), 200);
				}
			};
			requestAnimationFrame(() => scrollAndHighlight());
		}
	});

	let prevUrl = $state('');

	onDestroy(() => {
		clearTimeout(highlightTimer);
	});

	$effect(() => {
		const currentUrl = url;
		if (!browser) return;
		if (prevUrl === '') {
			prevUrl = currentUrl;
			return;
		}
		if (currentUrl !== prevUrl) {
			prevUrl = currentUrl;
			page = 1;
			comments = [];
			count = 0;
			loadComments(1);
		}
	});

	async function loadComments(p?: number) {
		loading = true;
		error = null;
		const thisVersion = ++requestVersion;
		try {
			const pNum = p ?? page;
			const result = await getComments(url, pNum, pageSize, user?.mail);
			if (thisVersion !== requestVersion) return;
			if (result) {
				comments = result.data;
				count = result.count;
				page = pNum;
			}
		} catch {
			error = '评论加载失败';
		} finally {
			loading = false;
			if (activeConfig.HIGHLIGHT !== 'false') {
				clearTimeout(highlightTimer);
				highlightTimer = setTimeout(() => highlightCode(), 100);
			}
		}
	}

	async function goToPage(p: number) {
		if (p < 1 || p > totalPages || p === page) return;
		await loadComments(p);
		if (browser) {
			document.querySelector('.comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function handleSubmitted() {
		if (config.IS_ADMIN === true || config.IS_ADMIN === 'true') {
			user = { nick: '', mail: '', link: '' };
		} else {
			user = loadUser();
		}
		page = 1;
		loadComments();
	}

	function handleLikeUpdated(id: string, liked: boolean, likeCount: number) {
		comments = updateLike(comments, id, liked, likeCount);
	}
	function updateLike(
		list: CommentData[],
		id: string,
		liked: boolean,
		likeCount: number
	): CommentData[] {
		return list.map((c) => {
			if (c.id === id) return { ...c, liked, like: likeCount };
			if (c.replies) return { ...c, replies: updateLike(c.replies, id, liked, likeCount) };
			return c;
		});
	}
</script>

<section class="comments" id="comments" aria-label="评论区">
	<CommentHeader
		{count}
		{replyCount}
		{sortOrder}
		showSort={activeConfig.SHOW_ORDER !== 'false' && comments.length > 0}
		onSortChange={(order) => {
			sortOrder = order;
			page = 1;
		}}
	/>

	{#if configLoaded}
		<CommentForm
			{url}
			{title}
			config={activeConfig}
			userInfo={user}
			onSubmitted={handleSubmitted}
		/>
	{/if}

	{#if loading && comments.length === 0}
		<CommentLoading type="loading" />
	{:else if error}
		<CommentLoading type="error" />
	{:else if comments.length === 0}
		<CommentLoading type="empty" />
	{:else}
		<div class="c-list">
			{#each sortedComments as comment, i (comment.id)}
				<div class="c-wrapper" style="--delay: {i * ANIMATION_DELAY_MS}ms">
					<CommentItem
						{comment}
						{url}
						{title}
						config={activeConfig}
						userInfo={user}
						{activeReplyId}
						onReplyToggle={(id) => (activeReplyId = activeReplyId === id ? null : id)}
						onRefresh={loadComments}
						onLikeUpdated={handleLikeUpdated}
					/>
				</div>
			{/each}
		</div>

		{#if totalPages > 1}
			<div class="pager">
				{#each Array.from({ length: totalPages }, (_, idx) => idx) as i (i)}
					<button class:cur={i + 1 === page} onclick={() => goToPage(i + 1)}>{i + 1}</button>
				{/each}
			</div>
		{/if}
	{/if}
</section>

<style>
	.comments {
		margin-top: 2.6rem;
		border-top: 1px solid var(--border-l);
		padding-top: 2rem;
	}
	.c-list {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	.c-wrapper {
		animation: c-fade-slide 0.35s var(--ease) backwards;
		animation-delay: var(--delay);
	}
	@keyframes c-fade-slide {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}
	.pager {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2.4rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--muted);
	}
	.pager button {
		min-width: 38px;
		height: 38px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--r-sm);
		border: var(--pixel-border);
		background: var(--surface);
		color: var(--muted);
		cursor: pointer;
		transition:
			color 0.22s var(--ease),
			border-color 0.22s var(--ease);
		font-family: var(--font-mono);
		font-size: var(--text-xs-2);
	}
	.pager button:hover {
		color: var(--accent);
		border-color: var(--accent);
	}
	.pager button.cur {
		background: var(--accent);
		color: var(--on-accent);
		border-color: var(--accent);
	}
	:global([data-theme='dark']) .pager button.cur {
		color: var(--on-accent);
	}
	:global(.cm-highlight) {
		animation: cm-highlight 3s var(--ease);
	}
	@keyframes cm-highlight {
		0% {
			background-color: var(--accent-soft);
			box-shadow: 0 0 0 4px var(--accent-soft);
		}
		100% {
			background-color: transparent;
			box-shadow: none;
		}
	}
</style>
