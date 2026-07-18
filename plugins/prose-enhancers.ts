/**
 * prose-enhancers
 *
 * 从 MDSVEXLayout.svelte 中抽离的 DOM 增强逻辑。
 * 每个函数返回一个 cleanup 函数（或 void），供 $effect 清理使用。
 */

import { lightbox } from '$lib/stores/lightbox.svelte';
import type { LightboxItem } from '$lib/stores/lightbox.svelte';

/** 代码块增强：复制按钮 + 语言标签 + 长代码折叠/展开 + 行号 */
export function enhanceCodeBlocks(): void {
	const codeBlocks = document.querySelectorAll('.prose pre:has(code)');
	if (codeBlocks.length === 0) return;

	codeBlocks.forEach((pre) => {
		if (pre.querySelector('.code-copy-btn')) return;

		const code = pre.querySelector('code');
		if (!code) return;

		const preEl = pre as HTMLElement;

		// 语言标签
		const classMatch = code.className.match(/language-(\w+)/);
		const lang = classMatch?.[1] || '';
		if (lang) pre.setAttribute('data-lang', lang);

		// 行号
		const lines = (code.textContent || '').split('\n');
		// 如果 Shiki 已渲染（有 span），用更温和的方式添加行号
		if (lines.length > 1 && !code.querySelector('.code-line-numbers')) {
			const lineNumbersDiv = document.createElement('div');
			lineNumbersDiv.className = 'code-line-numbers';
			lineNumbersDiv.setAttribute('aria-hidden', 'true');
			for (let i = 1; i <= lines.length; i++) {
				const span = document.createElement('span');
				span.textContent = String(i);
				lineNumbersDiv.appendChild(span);
			}
			preEl.style.position = 'relative';
			preEl.style.paddingLeft = '3.2rem';
			pre.appendChild(lineNumbersDiv);
		}

		// 复制按钮
		const btn = document.createElement('button');
		btn.className = 'code-copy-btn';
		btn.textContent = '复制';
		btn.setAttribute('aria-label', '复制代码');
		preEl.style.position = 'relative';
		pre.appendChild(btn);

		btn.addEventListener('click', async (e: Event) => {
			e.preventDefault();
			try {
				await navigator.clipboard.writeText(code.textContent || '');
				btn.textContent = '已复制';
				btn.classList.add('copied');
				setTimeout(() => {
					btn.textContent = '复制';
					btn.classList.remove('copied');
				}, 1500);
			} catch {
				btn.textContent = '失败';
				setTimeout(() => (btn.textContent = '复制'), 1500);
			}
		});

		// 折叠按钮（仅对超长代码块）
		requestAnimationFrame(() => {
			if (pre.scrollHeight <= pre.clientHeight + 2) return;
			const expandBtn = document.createElement('button');
			expandBtn.className = 'code-expand-btn';
			expandBtn.textContent = '展开';
			expandBtn.setAttribute('aria-label', '展开代码');
			pre.appendChild(expandBtn);
			expandBtn.addEventListener('click', (e: Event) => {
				e.preventDefault();
				const expanded = pre.classList.toggle('code-expanded');
				expandBtn.textContent = expanded ? '收起' : '展开';
				expandBtn.setAttribute('aria-label', expanded ? '收起代码' : '展开代码');
			});
		});
	});
}

/** 图片懒加载：自动给 prose 内 img 添加 loading="lazy" */
export function lazyLoadImages(): void {
	document.querySelectorAll('.prose img:not([loading])').forEach((img) => {
		img.setAttribute('loading', 'lazy');
	});
}

/** 正文图片 Lightbox：点击放大查看 */
export function enhanceProseImages(): void {
	const images = document.querySelectorAll<HTMLImageElement>('.prose img:not(.image-grid img)');
	if (images.length === 0) return;

	const items: LightboxItem[] = [];
	const imgElements: HTMLImageElement[] = [];

	images.forEach((img) => {
		if (img.dataset.lightboxEnhanced) return;
		img.dataset.lightboxEnhanced = 'true';
		img.style.cursor = 'zoom-in';
		items.push({
			img: img.src,
			alt: img.alt || '',
			caption: img.alt || ''
		});
		imgElements.push(img);

		img.addEventListener('click', (e: Event) => {
			e.preventDefault();
			const idx = imgElements.indexOf(img);
			lightbox.show(items, idx);
		});
	});
}

/** Mermaid 图表渲染（按需动态加载 mermaid 包） */
export function renderMermaid(): () => void {
	const mermaidElements = document.querySelectorAll('.mermaid');
	if (mermaidElements.length === 0) return () => {};

	let disposed = false;
	const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

	(async () => {
		try {
			const mermaid = (await import(/* @vite-ignore */ 'mermaid')).default;
			if (disposed) return;
			await mermaid.initialize({
				startOnLoad: false,
				theme: 'base',
				themeVariables: isDark
					? {
							primaryColor: '#1c1917',
							primaryTextColor: '#f5f5f4',
							lineColor: '#a8a29e',
							background: '#1c1917',
							mainBkg: '#292524'
						}
					: {
							primaryColor: '#faf8f5',
							primaryTextColor: '#1c1917',
							lineColor: '#78716c',
							background: '#fff'
						}
			});
			if (!disposed) mermaid.run({ querySelector: '.mermaid' });
		} catch {
			/* mermaid not installed */
		}
	})();

	return () => {
		disposed = true;
	};
}

/** 锚点平滑滚动 */
export function smoothAnchorScroll(): () => void {
	const handler = (e: Event) => {
		const target = e.target as HTMLElement;
		const anchor = target.closest('a[href^="#"]');
		if (!anchor) return;
		const id = anchor.getAttribute('href')?.slice(1);
		if (!id) return;
		const el = document.getElementById(id);
		if (el) {
			e.preventDefault();
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			history.replaceState(null, '', `#${id}`);
		}
	};
	document.addEventListener('click', handler);
	return () => document.removeEventListener('click', handler);
}
