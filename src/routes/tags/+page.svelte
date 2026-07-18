<script lang="ts">
	import Seo from '$lib/components/shared/Seo.svelte';
	import PageHead from '$lib/components/shared/PageHead.svelte';
	import RevealItem from '$lib/components/shared/RevealItem.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function fontSize(count: number, max: number): string {
		const min = 0.8;
		const maxR = 1.8;
		const ratio = max > 0 ? count / max : 0;
		return `${(min + (maxR - min) * ratio).toFixed(2)}rem`;
	}

	let maxCount = $derived(Math.max(...data.tags.map((t) => t.count), 1));
</script>

<Seo
	title="标签"
	description={`全部标签，共 ${data.tags.length} 个标签，${data.totalCount}篇文章。`}
/>

<main id="main" class="page" tabindex="-1">
	<RevealItem variant="up">
		<PageHead
			title="全部标签"
			en="Tags"
			desc="按使用频率排列的标签云。"
			count={`${data.tags.length} 个标签`}
			variant="secondary"
		/>
	</RevealItem>

	<RevealItem variant="fade" delay={0.08}>
		<div class="tag-cloud">
			{#each data.tags as tag (tag.tag)}
				<a
					class="tag-item"
					href="/tags/{encodeURIComponent(tag.tag)}"
					style="font-size: {fontSize(tag.count, maxCount)}"
				>
					<span class="tag-name">#{tag.tag}</span>
					<span class="tag-num">{tag.count}</span>
				</a>
			{/each}
		</div>
	</RevealItem>
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
	}

	.tag-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem 1rem;
		align-items: center;
		padding: 1rem 0;
	}
	.tag-item {
		display: inline-flex;
		align-items: baseline;
		gap: 0.3rem;
		font-family: var(--font-pixel);
		font-weight: 600;
		color: var(--dim);
		text-decoration: none;
		transition:
			color 0.25s var(--ease),
			transform 0.25s var(--ease);
	}
	.tag-item:hover {
		color: var(--accent);
		transform: translate(-2px, -2px);
	}
	.tag-name {
		line-height: 1;
	}
	.tag-num {
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 400;
		color: var(--muted);
		letter-spacing: 0.04em;
	}
	.tag-item:hover .tag-num {
		color: var(--accent);
	}
</style>
