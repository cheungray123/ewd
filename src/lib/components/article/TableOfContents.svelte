<script lang="ts">
	import { browser } from '$app/environment';
	import TerminalHeader from '$lib/components/shared/TerminalHeader.svelte';

	interface Props {
		items: { id: string; label: string; level: number }[];
	}
	let { items }: Props = $props();

	let activeId = $state<string>('');

	function updateActive() {
		if (!browser || items.length === 0) return;
		// 判定线：视口顶部往下 20% 的位置
		const offset = window.innerHeight * 0.2;
		let current = '';

		for (const item of items) {
			const el = document.getElementById(item.id);
			if (!el) continue;
			if (el.getBoundingClientRect().top <= offset) {
				current = item.id;
			} else {
				break; // 标题按文档顺序排列，后续不可能越过判定线
			}
		}

		// 如果没有任何标题越过判定线，不激活任何项
		// （原来是强制激活第一个，导致滚动到所有标题上方时第一个仍高亮）
		activeId = current;
	}

	let rafId: number | undefined;

	function onScroll() {
		if (rafId !== undefined) return;
		rafId = requestAnimationFrame(() => {
			updateActive();
			rafId = undefined;
		});
	}

	$effect(() => {
		if (!browser) return;
		updateActive();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (rafId !== undefined) cancelAnimationFrame(rafId);
		};
	});

	// 点击目录项时平滑滚动到对应标题
	function handleTocClick(e: MouseEvent, id: string) {
		e.preventDefault();
		const el = document.getElementById(id);
		if (!el) return;
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const offset = window.innerHeight * 0.2;
		const top = el.getBoundingClientRect().top + window.scrollY - offset;
		window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
		// 更新 URL hash 但不触发默认跳转
		history.replaceState(null, '', `#${id}`);
		activeId = id;
	}
</script>

<aside class="toc" aria-label="文章目录">
	<div class="toc-inner">
		<TerminalHeader title="toc.exe" />
		<div class="toc-content">
			<ol>
				{#each items as item (item.id)}
					<li class="lv-{item.level}" class:active={activeId === item.id}>
						<a
							href="#{item.id}"
							aria-current={activeId === item.id ? 'true' : undefined}
							onclick={(e) => handleTocClick(e, item.id)}>{item.label}</a
						>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</aside>

<style>
	.toc {
		position: sticky;
		top: 1.4rem;
		align-self: start;
	}
	.toc :global(.toc-inner) {
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}
	.toc-content {
		padding: 1.2rem;
	}
	ol {
		list-style: none;
		counter-reset: t;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	li {
		counter-increment: t;
		font-size: 12px;
		color: var(--muted);
		padding: 0.25rem 0.5rem;
		border-left: 2px solid transparent;
		margin-left: -0.5rem;
		transition:
			color 0.2s var(--ease),
			border-color 0.2s var(--ease);
	}
	li::before {
		content: counter(t, decimal-leading-zero);
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--muted);
		margin-right: 0.5rem;
	}
	/* h3 子标题缩进，隐藏序号 */
	li.lv-3 {
		padding-left: 1.8rem;
	}
	li.lv-3::before {
		content: '·';
		font-size: 1rem;
	}
	li.active {
		color: var(--accent);
		border-left-color: var(--accent);
	}
	li.active::before {
		color: var(--accent);
	}
	a {
		transition: color 0.2s var(--ease);
	}
	a:hover {
		color: var(--accent);
	}

	@media (max-width: 900px) {
		.toc {
			display: none;
			position: static;
			margin-bottom: 1.6rem;
		}
	}
</style>
