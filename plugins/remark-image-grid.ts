/**
 * remark-image-grid
 *
 * 将 Markdown 中连续的图片（各自独占一行段落）自动分组为九宫格容器。
 *
 * 输入示例：
 *   ![](a.jpg)
 *   ![](b.jpg)
 *   ![](c.jpg)
 *
 * 输出 HTML：
 *   <div class="image-grid" data-count="3">
 *     <p><img src="a.jpg" /></p>
 *     <p><img src="b.jpg" /></p>
 *     <p><img src="c.jpg" /></p>
 *   </div>
 *
 * 单张图片不分组，保持原样输出。
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** mdast 节点的最小类型定义（避免依赖 @types/mdast） */
interface MdastNode {
	type: string;
	[key: string]: any;
}

interface MdastImage extends MdastNode {
	type: 'image';
	url: string;
	alt?: string;
}

interface MdastParagraph extends MdastNode {
	type: 'paragraph';
	children: MdastNode[];
}

interface MdastRoot extends MdastNode {
	type: 'root';
	children: MdastNode[];
}

interface ImageGridOptions {
	/** 最少几张连续图片才分组，默认 2 */
	minImages?: number;
	/** 容器 CSS 类名 */
	className?: string;
}

/** 判断节点是否为段落 */
function isParagraph(node: MdastNode): node is MdastParagraph {
	return node.type === 'paragraph';
}

/** 判断段落是否仅包含图片（可能有空白文本） */
function isImageOnlyParagraph(node: MdastNode): node is MdastParagraph {
	if (!isParagraph(node)) return false;
	const children = node.children;
	if (!children || children.length === 0) return false;
	// 过滤空白文本节点
	const meaningful = children.filter(
		(c) =>
			!(c.type === 'text' && typeof (c as any).value === 'string' && (c as any).value.trim() === '')
	);
	// 必须全部是图片节点
	return meaningful.length > 0 && meaningful.every((c) => c.type === 'image');
}

/** 从段落中提取所有图片 */
function extractImages(para: MdastParagraph): MdastImage[] {
	return para.children.filter((c): c is MdastImage => c.type === 'image');
}

/** remark 插件：连续图片分组为九宫格 */
function remarkImageGrid(options: ImageGridOptions = {}) {
	const minImages = options.minImages ?? 2;
	const className = options.className ?? 'image-grid';

	return (tree: MdastRoot) => {
		const newChildren: MdastNode[] = [];
		let i = 0;

		while (i < tree.children.length) {
			const node = tree.children[i];

			if (isImageOnlyParagraph(node)) {
				// 收集连续的纯图片段落
				const images: MdastImage[] = [];
				const startIndex = i;

				while (i < tree.children.length && isImageOnlyParagraph(tree.children[i])) {
					const para = tree.children[i] as MdastParagraph;
					images.push(...extractImages(para));
					i++;
				}

				if (images.length >= minImages) {
					// 多张图片 → 分组为 grid 容器
					newChildren.push({
						type: 'html',
						value: `<div class="${className}" data-count="${images.length}">`
					});

					for (const img of images) {
						newChildren.push({
							type: 'paragraph',
							children: [img]
						});
					}

					newChildren.push({
						type: 'html',
						value: '</div>'
					});
				} else {
					// 单张图片，保持原样
					for (let j = startIndex; j < i; j++) {
						newChildren.push(tree.children[j]);
					}
				}
			} else {
				newChildren.push(node);
				i++;
			}
		}

		tree.children = newChildren;
	};
}

export default remarkImageGrid;
