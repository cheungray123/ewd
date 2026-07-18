/**
 * remark-post-shortcode
 *
 * 将 Markdown 中的 ::post 简写语法转换为 <PostReference /> Svelte 组件。
 *
 * 语法示例：
 *   ::post my-article              → <PostReference slug="my-article" />
 *   ::post slug="my-article"       → <PostReference slug="my-article" />
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

/** 匹配 ::post 后跟参数的整行 */
const POST_SHORTCODE_RE = /^::post\s+(.+)$/;

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

/** 从参数字符串中提取 slug */
function extractSlug(attrStr: string): string | null {
	const trimmed = attrStr.trim();

	// 形式1: slug="my-article" 或 slug='my-article'
	const kvMatch = trimmed.match(/^slug=["']([^"']+)["']$/);
	if (kvMatch) return kvMatch[1];

	// 形式2: 纯 slug（不含空格和引号，不是 key=value 格式）
	if (!trimmed.includes('=') && !trimmed.includes(' ') && trimmed.length > 0) {
		return trimmed;
	}

	return null;
}

/** remark 插件：::post 短代码 → <PostReference /> 组件 */
function remarkPostShortcode() {
	return (tree: MdastRoot) => {
		const newChildren: MdastNode[] = [];

		for (const node of tree.children) {
			if (isSingleTextParagraph(node)) {
				const textNode = node.children.find((c) => c.type === 'text') as MdastText;
				const text = (textNode.value || '').trim();
				const match = text.match(POST_SHORTCODE_RE);

				if (match) {
					const slug = extractSlug(match[1]);
					if (slug) {
						newChildren.push({
							type: 'html',
							value: `<PostReference slug="${slug}" />`
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

export default remarkPostShortcode;
