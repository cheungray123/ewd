<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import PageHead from '$lib/components/shared/PageHead.svelte';
	import Pager from '$lib/components/shared/Pager.svelte';
	import NowCard from '$lib/components/notes/NowCard.svelte';
	import YearNav from '$lib/components/notes/YearNav.svelte';
	import TimelineCard from '$lib/components/notes/TimelineCard.svelte';
	import RevealItem from '$lib/components/shared/RevealItem.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import { momentsPageHead, nowCardConfig, paginationConfig } from '$lib/settings/pages';
	import { buildPagerItems } from '$lib/utils/pager';
	import { likeStore } from '$lib/stores/like.svelte';
	import { getCommentSummaries, type CommentSummary } from '$lib/utils/comment';
	import type { TimelineNote, YearSection } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let pageHead = $derived({
		...momentsPageHead,
		count: data.count
	});

	let commentSummaries = $state<Record<string, CommentSummary>>({});

	// 从 URL 读取页码（预渲染时 page.url.searchParams 不可用）
	let currentPage = $derived.by(() => {
		try {
			return Math.max(1, parseInt(page.url.searchParams.get('page') ?? '1', 10) || 1);
		} catch {
			return 1;
		}
	});

	// 将所有年份段展开为扁平列表以便分页
	let allNotes = $derived.by<{ note: TimelineNote; year: string }[]>(() => {
		const flat: { note: TimelineNote; year: string }[] = [];
		for (const sec of data.sections) {
			for (const note of sec.notes) {
				flat.push({ note, year: sec.year });
			}
		}
		return flat;
	});

	// 分页切片后重新按年份分组
	let pageSize = paginationConfig.moments;
	let pagedSections = $derived.by<YearSection[]>(() => {
		const start = (currentPage - 1) * pageSize;
		const sliced = allNotes.slice(start, start + pageSize);

		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const yearMap = new Map<string, TimelineNote[]>();
		for (const { note, year } of sliced) {
			if (!yearMap.has(year)) yearMap.set(year, []);
			yearMap.get(year)!.push(note);
		}

		const sections: YearSection[] = [];
		for (const [year, notes] of yearMap) {
			sections.push({ year, count: notes.length, notes });
		}
		return sections;
	});

	let pagerItems = $derived(buildPagerItems(allNotes.length, pageSize, currentPage, '/moments'));

	// 收集当前页说说的 id
	let pagedIds = $derived(pagedSections.flatMap((s) => s.notes.map((n) => n.id)));

	onMount(() => {
		likeStore.init();
	});

	// 页码或数据变化时重新加载点赞和评论
	$effect(() => {
		const ids = pagedIds;
		if (ids.length === 0) return;

		likeStore.loadAll(ids);

		let cancelled = false;
		getCommentSummaries(ids, '/moments/')
			.then((result) => {
				if (!cancelled) commentSummaries = result;
			})
			.catch((e) => console.error('加载评论摘要失败:', e));

		return () => {
			cancelled = true;
		};
	});
</script>

<Seo title="说说" description="東风博客的说说页面，记录日常思考和生活点滴" type="website" />

<svelte:head>
	<title>说说 · 東风</title>
</svelte:head>

<main id="main" class="page" tabindex="-1">
	<RevealItem variant="up">
		<PageHead
			title={pageHead.title}
			en={pageHead.en}
			desc={pageHead.desc}
			count={pageHead.count}
			variant="tertiary"
		/>
	</RevealItem>

	<div class="notes-grid">
		<aside class="side">
			<RevealItem variant="left" delay={0.1}>
				<NowCard chips={nowCardConfig.chips} doing={nowCardConfig.doing} />
			</RevealItem>
			<RevealItem variant="left" delay={0.18}>
				<YearNav items={data.yearNavItems} />
			</RevealItem>
		</aside>

		<div class="timeline-col">
			<div class="timeline">
				{#each pagedSections as section (section.year)}
					<section class="yr-sec" id="y{section.year}">
						<RevealItem variant="up" class="yr-label">{section.year}</RevealItem>
						{#each section.notes as note, i (section.year + '-' + i)}
							<TimelineCard
								{note}
								liked={likeStore.isLiked(note.id)}
								likes={likeStore.getLikes(note.id)}
								liking={likeStore.isLiking(note.id)}
								onLike={() => likeStore.toggle(note.id)}
								commentSummary={commentSummaries[note.id]}
							/>
						{/each}
					</section>
				{/each}
			</div>

			<Pager items={pagerItems} />
		</div>
	</div>
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
	}
	.notes-grid {
		display: grid;
		grid-template-columns: 296px 1fr;
		gap: 2.4rem;
		align-items: start;
		margin-top: 1.8rem;
	}
	.side {
		position: sticky;
		top: 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	.timeline {
		position: relative;
		padding-left: 1.6rem;
	}
	.timeline::before {
		content: '';
		position: absolute;
		left: 7px;
		top: 0.4rem;
		bottom: 0.4rem;
		width: 2px;
		background: repeating-linear-gradient(
			180deg,
			var(--border) 0,
			var(--border) 8px,
			transparent 0px,
			transparent 16px
		);
	}
	.yr-sec {
		position: relative;
	}
	:global(.yr-label) {
		font-family: var(--font-pixel);
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--fg);
		margin: 0.3rem 0 1.3rem;
		padding-left: 0.2rem;
	}
	:global(.yr-sec:not(:first-child) .yr-label) {
		margin-top: 2.4rem;
	}

	@media (max-width: 900px) {
		.notes-grid {
			grid-template-columns: 1fr;
			gap: 1.3rem;
		}
		.side {
			position: static;
		}
	}
	@media (max-width: 680px) {
		:global(.yr-label) {
			font-size: 1.3rem;
		}
	}
</style>
