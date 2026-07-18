/**
 * MiniGFM — 极简 GFM Markdown 解析器
 * 支持：段落、粗体、斜体、删除线、行内代码、代码块、引用、链接、图片、列表、水平线
 * 不依赖任何第三方库，纯函数实现
 */

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(text: string): string {
	return escapeHtml(text).replace(/"/g, '&quot;');
}

/** 处理行内格式：粗体、斜体、删除线、行内代码、链接、图片 */
function parseInline(text: string): string {
	let result = escapeHtml(text);

	// 行内代码（先处理，避免内部被其他规则匹配）
	result = result.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);

	// 图片 ![alt](src)
	result = result.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, src, title) => {
		const safeSrc = escapeAttr(src);
		const safeAlt = escapeAttr(alt || '');
		const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
		return `<img src="${safeSrc}" alt="${safeAlt}"${titleAttr}>`;
	});

	// 链接 [text](url)
	result = result.replace(
		/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
		(_, label, href, title) => {
			// 只允许 http/https 协议
			if (!/^https?:\/\//i.test(href)) return label;
			const safeHref = escapeAttr(href);
			const safeLabel = label;
			const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
			return `<a href="${safeHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
		}
	);

	// 粗体 **text** 或 __text__
	result = result.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
	result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');

	// 斜体 *text* 或 _text_（避免与粗体冲突）
	result = result.replace(/(?<!\*)\*(?!\*)([^\*]+)\*(?!\*)/g, '<em>$1</em>');
	result = result.replace(/(?<!_)_(?!_)([^_]+)_(?!_)/g, '<em>$1</em>');

	// 删除线 ~~text~~
	result = result.replace(/~~([^~]+)~~/g, '<del>$1</del>');

	return result;
}

/** 解析 GFM Markdown 为 HTML */
export function miniGFM(md: string): string {
	if (!md || !md.trim()) return '';

	const lines = md.split(/\r?\n/);
	const html: string[] = [];
	let i = 0;

	// 代码块状态
	let inCodeBlock = false;
	let codeLang = '';
	let codeLines: string[] = [];

	// 列表状态
	let listType: 'ul' | 'ol' | null = null;
	let listItems: string[] = [];

	// 引用状态
	let inBlockquote = false;
	let blockquoteLines: string[] = [];

	function flushList() {
		if (listType && listItems.length > 0) {
			const items = listItems.map((item) => `<li>${parseInline(item)}</li>`).join('');
			html.push(`<${listType}>${items}</${listType}>`);
		}
		listType = null;
		listItems = [];
	}

	function flushBlockquote() {
		if (inBlockquote && blockquoteLines.length > 0) {
			const content = blockquoteLines.map((line) => parseInline(line)).join('<br>');
			html.push(`<blockquote>${content}</blockquote>`);
		}
		inBlockquote = false;
		blockquoteLines = [];
	}

	while (i < lines.length) {
		const line = lines[i];
		const trimmed = line.trim();

		// 代码块
		const codeFence = trimmed.match(/^```(\w*)$/);
		if (codeFence) {
			if (inCodeBlock) {
				// 结束代码块
				const code = escapeHtml(codeLines.join('\n'));
				const langClass = codeLang ? ` class="language-${escapeAttr(codeLang)}"` : '';
				html.push(`<pre><code${langClass}>${code}</code></pre>`);
				inCodeBlock = false;
				codeLang = '';
				codeLines = [];
			} else {
				// 开始代码块
				flushList();
				flushBlockquote();
				inCodeBlock = true;
				codeLang = codeFence[1] || '';
			}
			i++;
			continue;
		}

		if (inCodeBlock) {
			codeLines.push(line);
			i++;
			continue;
		}

		// 空行
		if (!trimmed) {
			flushList();
			flushBlockquote();
			i++;
			continue;
		}

		// 水平线
		if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
			flushList();
			flushBlockquote();
			html.push('<hr>');
			i++;
			continue;
		}

		// 标题 h1-h6
		const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
		if (heading) {
			flushList();
			flushBlockquote();
			const level = heading[1].length;
			const text = parseInline(heading[2]);
			html.push(`<h${level}>${text}</h${level}>`);
			i++;
			continue;
		}

		// 引用 > text
		if (trimmed.startsWith('> ')) {
			flushList();
			inBlockquote = true;
			blockquoteLines.push(trimmed.slice(2));
			i++;
			continue;
		} else if (trimmed === '>') {
			flushList();
			inBlockquote = true;
			blockquoteLines.push('');
			i++;
			continue;
		}

		// 有序列表 1. text
		const olItem = trimmed.match(/^(\d+)\.\s+(.+)$/);
		if (olItem) {
			if (listType !== 'ol') flushList();
			flushBlockquote();
			listType = 'ol';
			listItems.push(olItem[2]);
			i++;
			continue;
		}

		// 无序列表 - text 或 * text
		const ulItem = trimmed.match(/^[-*]\s+(.+)$/);
		if (ulItem) {
			if (listType !== 'ul') flushList();
			flushBlockquote();
			listType = 'ul';
			listItems.push(ulItem[1]);
			i++;
			continue;
		}

		// 普通段落
		flushList();
		flushBlockquote();
		html.push(`<p>${parseInline(trimmed)}</p>`);
		i++;
	}

	// 收尾
	if (inCodeBlock) {
		const code = escapeHtml(codeLines.join('\n'));
		const langClass = codeLang ? ` class="language-${escapeAttr(codeLang)}"` : '';
		html.push(`<pre><code${langClass}>${code}</code></pre>`);
	}
	flushList();
	flushBlockquote();

	return html.join('\n');
}
