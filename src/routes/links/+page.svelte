<script lang="ts">
	import PageHead from '$lib/components/shared/PageHead.svelte';
	import Seo from '$lib/components/shared/Seo.svelte';
	import TerminalHeader from '$lib/components/shared/TerminalHeader.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let copied = $state(false);

	function copySiteInfo() {
		const text = `${data.siteInfo.name}\n${data.siteInfo.url}\n${data.siteInfo.desc}`;
		navigator.clipboard.writeText(text).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}
</script>

<Seo title="友链" description="東风博客的友链页面，交换链接请联系博主" type="website" />

<main id="main" class="page" tabindex="-1">
	<PageHead
		title="友链"
		en="Friends"
		desc="互相链接的独立博客们。如果你也有一个，欢迎申请。"
		count=""
		variant="tertiary"
	/>
	<section class="apply-section">
		<div class="apply-card">
			<TerminalHeader title="apply.exe" />
			<div class="apply-card-content">
				<h2>申请友链</h2>
				<p class="sub">按照以下步骤交换链接</p>

				<div class="apply-grid">
					<div class="apply-block">
						<h3>本站信息</h3>
						<div class="site-info-block">
							<div class="si-row">
								<span class="si-label">名称</span><span class="si-val">{data.siteInfo.name}</span>
							</div>
							<div class="si-row">
								<span class="si-label">地址</span><span class="si-val">{data.siteInfo.url}</span>
							</div>
							<div class="si-row">
								<span class="si-label">简介</span><span class="si-val">{data.siteInfo.desc}</span>
							</div>
						</div>
						<button class="btn copy" onclick={copySiteInfo}>
							{#if copied}✓ 已复制{:else}复制本站信息{/if}
						</button>
					</div>

					<div class="apply-block">
						<h3>申请条件</h3>
						<ul class="rule-list">
							{#each data.applyInfo.rules as rule, i (i)}
								<li>{rule}</li>
							{/each}
						</ul>
					</div>

					<div class="apply-block">
						<h3>申请流程</h3>
						<ol class="step-list">
							{#each data.applyInfo.howToApply as step, i (i)}
								<li>{step}</li>
							{/each}
						</ol>
						<a class="btn primary" href="/about#comments">前往评论区留言 →</a>
					</div>
				</div>
			</div>
		</div>
	</section>
	<section class="links-grid" aria-label="友链列表">
		{#each data.links as link (link.url)}
			<a class="link-card" href={link.url} target="_blank" rel="noopener noreferrer">
				<img class="avatar" src={link.avatar} alt={link.name} loading="lazy" />
				<div class="info">
					<div class="name-row">
						<span class="name">{link.name}</span>
						<span class="ext">↗</span>
					</div>
					<p class="link-desc">{link.desc}</p>
					<div class="tags">
						{#each link.tags as tag (tag)}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				</div>
			</a>
		{/each}
	</section>
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
	}

	/* ── 友链卡片网格 ── */
	.links-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}
	.link-card {
		display: flex;
		gap: 0.9rem;
		background: var(--surface);
		border: var(--pixel-border);
		padding: var(--sp-sm);
		box-shadow: var(--pixel-shadow);
		text-decoration: none;
		transition:
			transform 0.2s var(--ease),
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.link-card:hover {
		transform: translate(-2px, -2px);
		border-color: var(--accent);
		box-shadow: var(--pixel-shadow-hover);
	}
	.avatar {
		width: 48px;
		height: 48px;
		border-radius: var(--r-sm);
		flex-shrink: 0;
		object-fit: cover;
		background: var(--border);
	}
	.info {
		min-width: 0;
		flex: 1;
	}
	.name-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.name {
		font-weight: 600;
		font-size: 13px;
		color: var(--fg);
		transition: color 0.2s var(--ease);
	}
	.link-card:hover .name {
		color: var(--accent);
	}
	.ext {
		font-size: 11px;
		color: var(--muted);
		transition: color 0.2s var(--ease);
	}
	.link-card:hover .ext {
		color: var(--accent);
	}
	.link-desc {
		font-size: 12px;
		color: var(--dim);
		line-height: 1.6;
		margin-top: 0.25rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.tags {
		display: flex;
		gap: 0.3rem;
		margin-top: 0.5rem;
		flex-wrap: wrap;
	}
	.tag {
		font-family: var(--font-mono);
		font-size: 9px;
		letter-spacing: 0.04em;
		color: var(--accent-3);
		background: color-mix(in oklch, var(--accent-3) 8%, transparent);
		padding: 0.1rem 0.4rem;
		border-radius: var(--r-sm);
		transition: all 0.2s var(--ease);
	}
	.link-card:hover .tag {
		background: var(--accent-3);
		color: var(--on-accent);
	}

	/* ── 申请区 ── */
	.apply-section {
		margin-top: 1rem;
		margin-bottom: 2.8rem;
	}
	.apply-card {
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}
	.apply-card-content {
		padding: 2rem;
	}
	.apply-card h2 {
		font-family: var(--font-body);
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--fg);
	}
	.apply-card .sub {
		font-size: 12px;
		color: var(--muted);
		margin-top: 0.25rem;
		margin-bottom: 1.4rem;
	}
	.apply-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.4rem;
	}
	.apply-block h3 {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent);
		margin-bottom: 0.8rem;
	}
	.site-info-block {
		background: var(--bg);
		border-radius: var(--r-sm);
		padding: 0.8rem;
		margin-bottom: 0.7rem;
	}
	.si-row {
		display: flex;
		gap: 0.6rem;
		padding: 0.25rem 0;
		font-size: 12px;
		line-height: 1.5;
	}
	.si-row + .si-row {
		border-top: 1px dashed var(--border-l);
	}
	.si-label {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--muted);
		flex-shrink: 0;
		width: 2.5rem;
	}
	.si-val {
		color: var(--fg);
		word-break: break-all;
	}
	.rule-list,
	.step-list {
		font-size: 12px;
		color: var(--dim);
		line-height: 1.8;
		padding-left: 1.1rem;
		margin-bottom: 0.9rem;
	}
	.rule-list li,
	.step-list li {
		margin-bottom: 0.35rem;
	}

	.btn.copy {
		width: 100%;
		justify-content: center;
	}

	@media (max-width: 900px) {
		.links-grid {
			grid-template-columns: 1fr;
		}
		.apply-grid {
			grid-template-columns: 1fr;
		}
		.apply-card-content {
			padding: 1.3rem;
		}
	}
</style>
