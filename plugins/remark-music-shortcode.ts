/**
 * remark-music-shortcode
 *
 * 将 Markdown 中的 ::music 简写语法转换为 <MusicPlayer /> Svelte 组件。
 *
 * 语法示例：
 *   ::music id="255020"            → <MusicPlayer id="255020" />
 *   ::music songs="1,2,3"          → <MusicPlayer songs="1,2,3" />
 *   ::music playlist="7044354223"  → <MusicPlayer playlist="7044354223" />
 *   ::music recommend              → <MusicPlayer recommend />
 *   ::music recommend compact      → <MusicPlayer recommend compact />
 *   ::music id="255020" compact    → <MusicPlayer id="255020" compact />
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

/** 匹配 ::music 后跟可选参数的整行 */
const MUSIC_SHORTCODE_RE = /^::music\s*(.*)$/;

/** 解析属性字符串，返回键值对（布尔属性值为空字符串） */
function parseAttributes(attrStr: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	// 匹配 key="value" 或 key='value' 或单独的 key（布尔属性）
	const re = /(\w+)(?:=["']([^"']*)["'])?/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(attrStr)) !== null) {
		attrs[m[1]] = m[2] ?? '';
	}
	return attrs;
}

/** 构建 <MusicPlayer ... /> 标签字符串 */
function buildComponentTag(attrs: Record<string, string>): string {
	const parts: string[] = [];
	for (const [key, val] of Object.entries(attrs)) {
		if (val === '') {
			// 布尔属性：recommend, compact, autoplay
			parts.push(key);
		} else {
			parts.push(`${key}="${val}"`);
		}
	}
	return `<MusicPlayer ${parts.join(' ')} />`;
}

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

/** remark 插件：::music 短代码 → <MusicPlayer /> 组件 */
function remarkMusicShortcode() {
	return (tree: MdastRoot) => {
		const newChildren: MdastNode[] = [];

		for (const node of tree.children) {
			if (isSingleTextParagraph(node)) {
				const textNode = node.children.find((c) => c.type === 'text') as MdastText;
				const text = (textNode.value || '').trim();
				const match = text.match(MUSIC_SHORTCODE_RE);

				if (match) {
					const attrStr = match[1].trim();
					const attrs = parseAttributes(attrStr);

					// 至少需要一个属性才转换
					if (Object.keys(attrs).length > 0) {
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

export default remarkMusicShortcode;
