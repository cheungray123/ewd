/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mdsvex } from 'mdsvex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import { createHighlighter } from 'shiki';
import remarkImageGrid from './remark-image-grid';
import remarkMusicShortcode from './remark-music-shortcode';
import remarkPostShortcode from './remark-post-shortcode';
import remarkBilibiliShortcode from './remark-bilibili-shortcode';

/**
 * Shiki highlighter 单例
 * highlighter 创建开销较大，只创建一次并在多次构建中复用。
 */
let _highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

async function getHighlighter() {
	if (!_highlighterPromise) {
		_highlighterPromise = createHighlighter({
			themes: ['github-light', 'github-dark'],
			langs: [
				'bash',
				'shell',
				'json',
				'yaml',
				'typescript',
				'javascript',
				'tsx',
				'jsx',
				'python',
				'html',
				'css',
				'scss',
				'svelte',
				'vue',
				'go',
				'rust',
				'sql',
				'markdown',
				'diff',
				'dockerfile'
			]
		});
	}
	return _highlighterPromise;
}

/**
 * mdsvex 代码高亮函数（Shiki 双主题）
 * 构建时静态生成高亮 HTML，零运行时开销。
 * CSS 变量 --shiki-light / --shiki-dark 跟随 data-theme 切换。
 */
async function shikiHighlighter(code: string, lang: string | null | undefined): Promise<string> {
	const highlighter = await getHighlighter();
	const language = lang && highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';

	const html = highlighter.codeToHtml(code, {
		lang: language,
		themes: {
			light: 'github-light',
			dark: 'github-dark'
		},
		defaultColor: false
	});

	// 用 {@html} 包裹，防止代码中的 { } 被 Svelte 模板引擎解析
	return `{@html ${JSON.stringify(html)}}`;
}

/**
 * mdsvex 预处理配置（统一管理 Markdown → Svelte 组件的编译管线）
 *
 * 功能：
 * - 代码高亮：Shiki（双主题 light/dark，跟随站点 data-theme 切换）
 * - GFM：表格、删除线、任务列表、自动链接（remark-gfm）
 * - 标题锚点：rehype-slug 生成 id，rehype-autolink-headings 添加链接
 * - 外部链接：外链自动加 target=_blank rel=noopener（rehype-external-links）
 * - 目录生成：从标题自动生成 TOC，在 Markdown 中写 ## 目录 即可（remark-toc）
		- 音乐九宫格：连续图片自动分组为 .image-grid 容器（remark-image-grid）
	 * - 音乐短代码：::music 语法转为 <MusicPlayer /> 组件（remark-music-shortcode）
	 * - 文章引用短代码：::post 语法转为 <PostReference /> 组件（remark-post-shortcode）
	 * - B站视频短代码：::bilibili 语法转为 <Bilibili /> 组件（remark-bilibili-shortcode）
 * - Layout：注入 MDSVEXLayout，提供代码复制、图片懒加载等增强功能
 */
export const mdsvexConfig = mdsvex({
	extensions: ['.svx', '.md'],
	layout: path.resolve(
		path.dirname(fileURLToPath(import.meta.url)),
		'../src/lib/layouts/MDSVEXLayout.svelte'
	),
	highlight: {
		highlighter: shikiHighlighter
	},
	remarkPlugins: [
		remarkGfm as any,
		[remarkToc as any, { maxDepth: 3, tight: true }],
		[remarkImageGrid as any, { minImages: 2 }],
		remarkMusicShortcode as any,
		remarkPostShortcode as any,
		remarkBilibiliShortcode as any
	],
	rehypePlugins: [
		rehypeSlug as any,
		[
			rehypeAutolinkHeadings as any,
			{
				behavior: 'append',
				properties: {
					className: ['heading-anchor'],
					ariaLabel: '锚点链接'
				}
			}
		],
		[
			rehypeExternalLinks as any,
			{
				target: '_blank',
				rel: ['noopener', 'noreferrer']
			}
		]
	]
});
