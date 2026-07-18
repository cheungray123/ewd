/**
 * remark-bilibili-shortcode
 *
 * 将 Markdown 中的 ::bilibili 简写语法转换为 <Bilibili /> Svelte 组件。
 *
 * 语法示例：
 *   ::bilibili BV1xx411x7xx              → <Bilibili bvid="BV1xx411x7xx" />
 *   ::bilibili bvid="BV1xx411x7xx"      → <Bilibili bvid="BV1xx411x7xx" />
 *   ::bilibili url="https://www.bilibili.com/video/BV1xx411x7xx"  → <Bilibili bvid="BV1xx411x7xx" />
 *   ::bilibili BV1xx411x7xx page=2      → <Bilibili bvid="BV1xx411x7xx" page={2} />
 *   ::bilibili BV1xx411x7xx width="80%" → <Bilibili bvid="BV1xx411x7xx" width="80%" />
 *   ::bilibili BV1xx411x7xx autoplay    → <Bilibili bvid="BV1xx411x7xx" autoplay />
 *
 * 必须独占一行（单独成段），否则不转换。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface MdastNode {
	type: string;
	[key: string]: any;
}

interface MdastParagraph extends MdastNode {
	type: 'paragraph';
	children: MdastNode[];
}

interface MdastText extends MdastNode {
	type: 'text';
	value: string;
}

interface MdastRoot extends MdastNode {
	type: 'root';
	children: MdastNode[];
}

/** 匹配 ::bilibili 后跟参数的整行 */
const BILIBILI_SHORTCODE_RE = /^::bilibili\s+(.+)$/;

/** 判断节点是否为段落 */
function isParagraph(node: MdastNode): node is MdastParagraph {
	return node.type === 'paragraph';
}

/** 判断段落是否仅包含单个文本节点 */
function isSingleTextParagraph(
	node: MdastNode
): node is MdastParagraph & { children: [MdastText] } {
	if (!isParagraph(node)) return false;
	const meaningful = node.children.filter(
		(c) =>
			!(c.type === 'text' && typeof (c as any).value === 'string' && (c as any).value.trim() === '')
	);
	return meaningful.length === 1 && meaningful[0].type === 'text';
}

/**
 * 解析属性字符串，返回键值对
 *
 * 引号支持半角（" '）和全角（" " ' '），
 * 因为 smartypants 可能在 remark 插件运行前将英文引号转为中文全角引号。
 */

/** 开引号 → 对应闭引号的映射（半角引号开闭相同，全角引号开闭不同） */
const CLOSE_QUOTE: Record<string, string> = {
	'"': '"',
	"'": "'",
	'\u201C': '\u201D', // " → "
	'\u201D': '\u201C', // " → "（容错）
	'\u2018': '\u2019', // ' → '
	'\u2019': '\u2018'  // ' → '（容错）
};

/** 所有支持的引号字符（开+闭） */
const QUOTE_CHARS = '["\'\u201C\u201D\u2018\u2019]';

/** 从被引号包裹的字符串中提取内容，返回 { value, endIndex } */
function extractQuotedValue(str: string, startIdx: number): { value: string; endIndex: number } | null {
	const openQuote = str[startIdx];
	const closeQuote = CLOSE_QUOTE[openQuote] || openQuote;
	const closeIdx = str.indexOf(closeQuote, startIdx + 1);
	if (closeIdx !== -1) {
		return { value: str.slice(startIdx + 1, closeIdx), endIndex: closeIdx + 1 };
	}
	// 未找到闭引号，取到下一个空格或字符串末尾
	const spaceIdx = str.indexOf(' ', startIdx + 1);
	const end = spaceIdx !== -1 ? spaceIdx : str.length;
	return { value: str.slice(startIdx + 1, end), endIndex: end };
}

/** 解析剩余属性参数（key="value" / key=value / 布尔 key），引号支持半角和全角 */
function parseRemainingAttrs(str: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	// 先匹配 key= 或单独的 key（布尔属性）
	const re = new RegExp(`(\\w+)(=)?`, 'g');
	let m: RegExpExecArray | null;
	while ((m = re.exec(str)) !== null) {
		const key = m[1];
		const hasEqual = m[2];
		if (hasEqual) {
			// 有等号，检查下一个字符是否为引号
			const afterEqual = m.index + m[0].length;
			const nextChar = str[afterEqual];
			if (nextChar && new RegExp(QUOTE_CHARS).test(nextChar)) {
				// 引号包裹的值
				const result = extractQuotedValue(str, afterEqual);
				if (result) {
					attrs[key] = result.value;
					re.lastIndex = result.endIndex;
				} else {
					attrs[key] = '';
				}
			} else {
				// 无引号的值（取到下一个空格或字符串末尾）
				const spaceIdx = str.indexOf(' ', afterEqual);
				const end = spaceIdx !== -1 ? spaceIdx : str.length;
				attrs[key] = str.slice(afterEqual, end);
				re.lastIndex = end;
			}
		} else {
			// 布尔属性
			attrs[key] = '';
		}
	}
	return attrs;
}

function parseAttributes(attrStr: string): Record<string, string> | null {
	const attrs: Record<string, string> = {};
	const trimmed = attrStr.trim();

	// 尝试匹配 URL 格式：url="https://www.bilibili.com/video/BVxxx"
	const urlMatch = trimmed.match(new RegExp(`^url=(${QUOTE_CHARS})`, 'i'));
	if (urlMatch) {
		const quoteResult = extractQuotedValue(trimmed, urlMatch[0].length - 1);
		if (quoteResult) {
			const url = quoteResult.value;
			const bvidMatch = url.match(/BV[\w]+/i);
			if (bvidMatch) {
				attrs.bvid = bvidMatch[0];
				const remaining = trimmed.slice(quoteResult.endIndex).trim();
				if (remaining) {
					Object.assign(attrs, parseRemainingAttrs(remaining));
				}
				return attrs;
			}
		}
	}

	// 尝试匹配 bvid="xxx" 格式
	const bvidMatch = trimmed.match(new RegExp(`^bvid=(${QUOTE_CHARS})`, 'i'));
	if (bvidMatch) {
		const quoteResult = extractQuotedValue(trimmed, bvidMatch[0].length - 1);
		if (quoteResult) {
			attrs.bvid = quoteResult.value;
			const remaining = trimmed.slice(quoteResult.endIndex).trim();
			if (remaining) {
				Object.assign(attrs, parseRemainingAttrs(remaining));
			}
			return attrs;
		}
	}

	// 尝试匹配纯 BV 号格式（开头是 BVxxx）
	const bvMatch = trimmed.match(/^(BV[\w]+)(?:\s+(.+))?/i);
	if (bvMatch) {
		attrs.bvid = bvMatch[1];
		// 解析剩余参数
		if (bvMatch[2]) {
			Object.assign(attrs, parseRemainingAttrs(bvMatch[2]));
		}
		return attrs;
	}

	return null;
}

/** 构建 <Bilibili ... /> 标签字符串 */
function buildComponentTag(attrs: Record<string, string>): string {
	const parts: string[] = [];
	for (const [key, val] of Object.entries(attrs)) {
		if (val === '') {
			// 布尔属性：autoplay
			parts.push(key);
		} else if (/^\d+$/.test(val) && key !== 'width') {
			// 数字属性（page）
			parts.push(`${key}={${val}}`);
		} else {
			// 字符串属性
			parts.push(`${key}="${val}"`);
		}
	}
	return `<Bilibili ${parts.join(' ')} />`;
}

/** remark 插件：::bilibili 短代码 → <Bilibili /> 组件 */
function remarkBilibiliShortcode() {
	return (tree: MdastRoot) => {
		const newChildren: MdastNode[] = [];

		for (const node of tree.children) {
			if (isSingleTextParagraph(node)) {
				const textNode = node.children.find((c) => c.type === 'text') as MdastText;
				const text = (textNode.value || '').trim();
				const match = text.match(BILIBILI_SHORTCODE_RE);

				if (match) {
					const attrs = parseAttributes(match[1]);
					if (attrs && attrs.bvid) {
						newChildren.push({
							type: 'html',
							value: buildComponentTag(attrs)
						});
						continue;
					}
				}
			}

			newChildren.push(node);
		}

		tree.children = newChildren;
	};
}

export default remarkBilibiliShortcode;
