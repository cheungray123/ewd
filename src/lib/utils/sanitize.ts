function addSpaceBetweenChineseAndEnglish(text: string): string {
	let result = text.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
	result = result.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');
	return result;
}

function processTextNodes(html: string): string {
	return html.replace(/>([^<]+)</g, (match, text) => {
		const processed = addSpaceBetweenChineseAndEnglish(text);
		return `>${processed}<`;
	});
}

const ALLOWED_TAGS = new Set([
	'a',
	'b',
	'i',
	'em',
	'strong',
	'p',
	'br',
	'blockquote',
	'code',
	'pre',
	'ul',
	'ol',
	'li',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'img',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td',
	'hr',
	'del',
	'sup',
	'sub',
	'span',
	'div',
	'input'
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
	a: new Set(['href', 'title', 'target', 'rel']),
	img: new Set(['src', 'alt', 'title', 'width', 'height']),
	code: new Set(['class']),
	pre: new Set(['class']),
	input: new Set(['type', 'checked', 'disabled']),
	td: new Set(['colspan', 'rowspan']),
	th: new Set(['colspan', 'rowspan'])
};

const GLOBAL_ATTRS = new Set<string>([]);

export function sanitizeHTML(html: string): string {
	if (!html) return '';
	if (typeof document === 'undefined') return processTextNodes(html);

	const template = document.createElement('template');
	template.innerHTML = html;

	const walk = (root: ParentNode): void => {
		const dangerous = root.querySelectorAll(
			'script, style, iframe, object, embed, link, meta, base, form'
		);
		dangerous.forEach((el) => el.remove());

		root.querySelectorAll('*').forEach((el) => {
			const tag = el.tagName.toLowerCase();

			if (!ALLOWED_TAGS.has(tag)) {
				const parent = el.parentNode;
				if (parent) {
					while (el.firstChild) {
						parent.insertBefore(el.firstChild, el);
					}
					parent.removeChild(el);
				}
				return;
			}

			const attrsToRemove: string[] = [];
			for (const attr of Array.from(el.attributes)) {
				const name = attr.name.toLowerCase();
				const value = attr.value;

				if (name.startsWith('on')) {
					attrsToRemove.push(attr.name);
					continue;
				}

				if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) {
					attrsToRemove.push(attr.name);
					continue;
				}

				if (name === 'src' && /^data:/i.test(value) && !/^data:image\//i.test(value)) {
					attrsToRemove.push(attr.name);
					continue;
				}

				const tagAttrs = ALLOWED_ATTRS[tag] as Set<string> | undefined;
				if (!tagAttrs?.has(name) && !GLOBAL_ATTRS.has(name)) {
					attrsToRemove.push(attr.name);
				}
			}
			attrsToRemove.forEach((name) => el.removeAttribute(name));

			if (tag === 'a') {
				const href = el.getAttribute('href');
				if (href && /^https?:\/\//i.test(href)) {
					el.setAttribute('target', '_blank');
					el.setAttribute('rel', 'noopener noreferrer');
				}
			}

			if (tag === 'input') {
				el.setAttribute('type', 'checkbox');
				el.setAttribute('disabled', 'disabled');
			}
		});
	};

	walk(template.content as ParentNode);

	let result = template.innerHTML;
	result = processTextNodes(result);

	return result;
}

export function sanitizeURL(url: string): string {
	if (!url) return '';
	if (!/^(https?:|mailto:|\/|#)/i.test(url)) {
		return '';
	}
	return url;
}
