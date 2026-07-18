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

/** 解析属性字符串，返回键值对 */
function parseAttributes(attrStr: string): Record<string, string> | null {
	const attrs: Record<string, string> = {};
	const trimmed = attrStr.trim();

	// 尝试匹配 URL 格式
	const urlMatch = trimmed.match(/^url=["'](https?:\/\/www\.bilibili\.com\/video\/(BV[\w]+))["']/i);
	if (urlMatch) {
		attrs.bvid = urlMatch[2];
		// 解析剩余参数
		const remaining = trimmed.slice(urlMatch[0].length).trim();
		if (remaining) {
			const re = /(\w+)(?:=["']([^"']*)["'])?/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(remaining)) !== null) {
				attrs[m[1]] = m[2] ?? '';
			}
		}
		return attrs;
	}

	// 尝试匹配 bvid="xxx" 格式
	const bvidMatch = trimmed.match(/^bvid=["'](BV[\w]+)["']/i);
	if (bvidMatch) {
		attrs.bvid = bvidMatch[1];
		// 解析剩余参数
		const remaining = trimmed.slice(bvidMatch[0].length).trim();
		if (remaining) {
			const re = /(\w+)(?:=["']([^"']*)["'])?/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(remaining)) !== null) {
				attrs[m[1]] = m[2] ?? '';
			}
		}
		return attrs;
	}

	// 尝试匹配纯 BV 号格式（开头是 BVxxx）
	const bvMatch = trimmed.match(/^(BV[\w]+)(?:\s+(.+))?/i);
	if (bvMatch) {
		attrs.bvid = bvMatch[1];
		// 解析剩余参数
		if (bvMatch[2]) {
			const re = /(\w+)(?:=["']([^"']*)["'])?/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(bvMatch[2])) !== null) {
				attrs[m[1]] = m[2] ?? '';
			}
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
