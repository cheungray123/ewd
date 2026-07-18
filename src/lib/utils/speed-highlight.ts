/**
 * speed-highlight-js 集成 — 按需加载，评论代码高亮
 */
import { highlightText, type ShjLanguage } from '@speed-highlight/core';

let cssLoaded = false;

async function ensureCSS() {
	if (cssLoaded) return;
	cssLoaded = true;
	await import('@speed-highlight/core/themes/default.css');
}

/**
 * 高亮评论区域内的所有代码块
 * 查找 pre code 元素，按 language-xxx 类名识别语言
 */
export async function highlightComments(container?: HTMLElement): Promise<void> {
	if (typeof document === 'undefined') return;
	await ensureCSS();

	const root = container ?? document.querySelector('.comments') ?? document;
	const codeBlocks = root.querySelectorAll('pre code[class*="language-"]');

	for (const block of codeBlocks) {
		const codeEl = block as HTMLElement;
		if (codeEl.dataset.highlighted === '1') continue;

		const cls = codeEl.className || '';
		const langMatch = cls.match(/language-(\w+)/);
		// 映射常见语言名到 speed-highlight 支持的格式
		const langMap: Record<string, string> = {
			javascript: 'js',
			typescript: 'ts',
			python: 'py',
			rust: 'rs',
			markdown: 'md',
			shell: 'bash',
			sh: 'bash',
			html: 'html',
			xml: 'xml',
			yaml: 'yaml',
			json: 'json',
			go: 'go',
			sql: 'sql',
			java: 'java',
			c: 'c',
			docker: 'docker',
			diff: 'diff',
			regex: 'regex'
		};
		const rawLang = langMatch ? langMatch[1] : 'plain';
		const lang = (langMap[rawLang] || rawLang) as ShjLanguage;

		const rawCode = codeEl.textContent || '';
		try {
			const html = await highlightText(rawCode, lang);
			codeEl.innerHTML = html;
			codeEl.dataset.highlighted = '1';
			const pre = codeEl.closest('pre');
			if (pre) pre.classList.add('shiki');
		} catch {
			codeEl.dataset.highlighted = '1';
		}
	}
}
