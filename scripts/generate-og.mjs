#!/usr/bin/env node
/**
 * OG 图生成脚本 —— 构建时批量生成社交分享图
 *
 * 原理：satori（JSX → SVG）+ @resvg/resvg-js（SVG → PNG）
 * 字体：Google Fonts Noto Sans SC 变量字体 TTF（首次运行自动下载）
 *
 * 用法：node scripts/generate-og.mjs
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SCRIPT_DIR = __dirname;
const FONT_CACHE_DIR = join(SCRIPT_DIR, 'fonts');

// ── 配置 ──
const W = 1200;
const H = 630;

// ── 字体获取：缓存 → 系统字体 → 在线下载 ──
const FONT_PATH = join(FONT_CACHE_DIR, 'NotoSansSC.ttf');
const FONT_URLS = [
	// Google Fonts 变量字体 TTF（URL 编码 [wght]）
	'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf',
	'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf',
	// 静态字重备用（非变量字体）
	'https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf'
];
// 多平台系统字体路径
const SYS_FONTS = [
	// Windows
	'C:\\Windows\\Fonts\\simhei.ttf',
	'C:\\Windows\\Fonts\\msyh.ttc',
	// Linux（Debian/Ubuntu 常见路径）
	'/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
	'/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
	'/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc',
	'/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',
	// macOS
	'/System/Library/Fonts/PingFang.ttc',
	'/System/Library/Fonts/STHeiti Medium.ttc'
];

function ensureFont() {
	mkdirSync(FONT_CACHE_DIR, { recursive: true });

	// 1. 已下载缓存
	if (existsSync(FONT_PATH)) {
		return readFileSync(FONT_PATH);
	}

	// 2. 系统字体
	for (const p of SYS_FONTS) {
		if (existsSync(p)) {
			const name = p.split(/[\\/]/).pop() || 'system-font';
			console.log(`  使用系统字体: ${name}`);
			return readFileSync(p);
		}
	}

	// 3. 在线下载（需要在调用处 await）
	return null;
}

async function downloadFont() {
	console.log('  ⬇ 下载中文字体（~10MB，仅首次）...');
	for (const url of FONT_URLS) {
		try {
			// 超时 30 秒，防止 CI 挂起
			const ctrl = new AbortController();
			const timer = setTimeout(() => ctrl.abort(), 30000);
			const res = await fetch(url, { redirect: 'follow', signal: ctrl.signal });
			clearTimeout(timer);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const buf = Buffer.from(await res.arrayBuffer());
			if (buf.length < 100000) throw new Error('文件太小，可能是错误页面');
			writeFileSync(FONT_PATH, buf);
			console.log(`  ✓ 字体已缓存 (${(buf.length / 1024 / 1024).toFixed(1)}MB)`);
			return buf;
		} catch (e) {
			console.log(`  ✗ ${url.split('/').pop()}: ${e.message}`);
		}
	}
	return null;
}

let fontData = ensureFont();
if (!fontData) {
	fontData = await downloadFont();
}
if (!fontData) {
	console.error('⚠⚠⚠ 无法获取中文字体，OG 图生成中止（不影响构建）');
	process.exit(0);
}

const fonts = [
	{ name: 'NotoSansSC', data: fontData, weight: 400, style: 'normal' },
	{ name: 'NotoSansSC', data: fontData, weight: 700, style: 'normal' }
];

// ── Frontmatter 解析 ──
function parseFrontmatter(raw) {
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) return null;
	const meta = {};
	for (const line of m[1].split('\n')) {
		const kv = line.match(/^(\w+):\s*(.*)$/);
		if (!kv) continue;
		let [, key, val] = kv;
		val = val.trim();
		if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
			val = val.slice(1, -1);
		} else if (val.startsWith('[') && val.endsWith(']')) {
			val = val
				.slice(1, -1)
				.split(',')
				.map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
		} else if (val === 'true') {
			val = true;
		} else if (val === 'false') {
			val = false;
		}
		meta[key] = val;
	}
	return meta;
}

// ── Satori 元素构造器（替代 JSX）──
function el(tag, props = {}, ...children) {
	const flat = children
		.flat(Infinity)
		.filter((c) => c !== false && c !== null && c !== undefined && c !== '');
	return {
		type: tag,
		props: {
			...props,
			children: flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat
		}
	};
}

// ── 设计令牌（与 app.css 对齐）──
// 赛博绿 + 霓虹粉 + 电光蓝 配色方案
const C = {
	// 背景色
	bg: '#0a0a1a',
	surface: '#12121e',
	// 文字色
	text: '#d0d0e0',
	title: '#f5f3ee',
	dim: '#7070a0',
	muted: '#505070',
	// 强调色 - 赛博绿
	accent: '#00ff88',
	accentSoft: 'rgba(0, 255, 136, 0.15)',
	// 强调色 - 霓虹粉
	accent2: '#ff6ec7',
	accent2Soft: 'rgba(255, 110, 199, 0.15)',
	// 强调色 - 电光蓝
	accent3: '#4488ff',
	accent3Soft: 'rgba(68, 136, 255, 0.15)',
	// 边框
	border: 'rgba(255, 255, 255, 0.08)',
	borderL: 'rgba(255, 255, 255, 0.04)'
};

// ── 文章 OG 图 ──
function postOG(meta) {
	const date = meta.date ? String(meta.date).split(' ')[0] : '';
	const tags = Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [];
	const category = meta.category || '';
	const desc = meta.description || '';

	// 根据分类选择强调色
	let accentColor = C.accent;
	let accentSoft = C.accentSoft;
	if (category === '折腾' || category === '随笔') {
		accentColor = C.accent2;
		accentSoft = C.accent2Soft;
	} else if (category === '技术') {
		accentColor = C.accent3;
		accentSoft = C.accent3Soft;
	}

	return el(
		'div',
		{
			style: {
				width: `${W}px`,
				height: `${H}px`,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '72px 80px',
				fontFamily: 'NotoSansSC',
				background: C.bg,
				color: C.text,
				position: 'relative',
				overflow: 'hidden'
			}
		},
		// 装饰性渐变背景
		el('div', {
			style: {
				position: 'absolute',
				top: '-50%',
				right: '-20%',
				width: '600px',
				height: '600px',
				background: `radial-gradient(circle, ${accentSoft} 0%, transparent 70%)`,
				pointerEvents: 'none'
			}
		}),
		el('div', {
			style: {
				position: 'absolute',
				bottom: '-30%',
				left: '-10%',
				width: '400px',
				height: '400px',
				background: `radial-gradient(circle, ${C.accent3Soft} 0%, transparent 70%)`,
				pointerEvents: 'none'
			}
		}),
		// 顶部：站点品牌
		el(
			'div',
			{
				style: {
					display: 'flex',
					alignItems: 'center',
					gap: '4px',
					position: 'relative',
					zIndex: 1
				}
			},
			el('span', { style: { fontSize: '32px', fontWeight: 700, color: C.accent } }, '東'),
			el('span', { style: { fontSize: '32px', fontWeight: 700, color: C.title } }, '风'),
			el(
				'span',
				{
					style: {
						fontSize: '15px',
						color: C.dim,
						marginLeft: '16px',
						fontWeight: 400,
						fontFamily: 'NotoSansSC'
					}
				},
				'写代码 · 记生活 · 拍照片'
			)
		),
		// 中间：标题 + 描述
		el(
			'div',
			{
				style: {
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					gap: '20px',
					position: 'relative',
					zIndex: 1
				}
			},
			el(
				'div',
				{
					style: {
						fontSize: '54px',
						fontWeight: 700,
						lineHeight: 1.3,
						color: C.title,
						maxWidth: '1000px',
						letterSpacing: '-0.01em'
					}
				},
				meta.title
			),
			desc &&
				el(
					'div',
					{
						style: {
							fontSize: '22px',
							color: C.dim,
							lineHeight: 1.6,
							maxWidth: '860px',
							fontWeight: 400
						}
					},
					desc
				)
		),
		// 底部：日期 + 分类 + 标签
		el(
			'div',
			{
				style: {
					display: 'flex',
					alignItems: 'center',
					gap: '16px',
					fontSize: '18px',
					color: C.dim,
					paddingTop: '24px',
					borderTop: `2px dashed ${C.border}`,
					position: 'relative',
					zIndex: 1
				}
			},
			date && el('span', { style: { fontFamily: 'NotoSansSC', fontSize: '17px' } }, date),
			category &&
				el(
					'span',
					{
						style: {
							color: accentColor,
							background: accentSoft,
							padding: '4px 14px',
							borderRadius: '6px',
							fontSize: '15px',
							fontWeight: 600,
							border: `1px solid ${accentColor}`,
							fontFamily: 'NotoSansSC'
						}
					},
					category
				),
			...tags
				.slice(0, 3)
				.map((t) =>
					el(
						'span',
						{ style: { fontSize: '16px', color: C.muted, fontFamily: 'NotoSansSC' } },
						`#${t}`
					)
				)
		)
	);
}

// ── 默认 OG 图 ──
function defaultOG() {
	return el(
		'div',
		{
			style: {
				width: `${W}px`,
				height: `${H}px`,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '80px',
				fontFamily: 'NotoSansSC',
				background: C.bg,
				color: C.text,
				position: 'relative',
				overflow: 'hidden'
			}
		},
		// 装饰性渐变背景 - 三色渐变
		el('div', {
			style: {
				position: 'absolute',
				top: '-30%',
				left: '-10%',
				width: '500px',
				height: '500px',
				background: `radial-gradient(circle, ${C.accentSoft} 0%, transparent 70%)`,
				pointerEvents: 'none'
			}
		}),
		el('div', {
			style: {
				position: 'absolute',
				top: '-20%',
				right: '-15%',
				width: '400px',
				height: '400px',
				background: `radial-gradient(circle, ${C.accent2Soft} 0%, transparent 70%)`,
				pointerEvents: 'none'
			}
		}),
		el('div', {
			style: {
				position: 'absolute',
				bottom: '-25%',
				left: '20%',
				width: '450px',
				height: '450px',
				background: `radial-gradient(circle, ${C.accent3Soft} 0%, transparent 70%)`,
				pointerEvents: 'none'
			}
		}),
		// 像素网格装饰线
		el('div', {
			style: {
				position: 'absolute',
				top: '60px',
				left: '80px',
				right: '80px',
				height: '3px',
				background: `repeating-linear-gradient(90deg, ${C.accent} 0px, ${C.accent} 12px, transparent 12px, transparent 24px, ${C.accent2} 24px, ${C.accent2} 36px, transparent 36px, transparent 48px, ${C.accent3} 48px, ${C.accent3} 60px, transparent 60px, transparent 72px)`,
				opacity: 0.6,
				pointerEvents: 'none'
			}
		}),
		// 主内容
		el(
			'div',
			{
				style: {
					display: 'flex',
					alignItems: 'center',
					gap: '6px',
					position: 'relative',
					zIndex: 1
				}
			},
			el('span', { style: { fontSize: '96px', fontWeight: 700, color: C.accent } }, '東'),
			el('span', { style: { fontSize: '96px', fontWeight: 700, color: C.title } }, '风')
		),
		el(
			'div',
			{
				style: {
					fontSize: '26px',
					color: C.dim,
					marginTop: '32px',
					fontWeight: 400,
					position: 'relative',
					zIndex: 1,
					letterSpacing: '0.05em'
				}
			},
			'写代码 · 记生活 · 拍照片'
		),
		// 底部装饰
		el(
			'div',
			{
				style: {
					position: 'absolute',
					bottom: '50px',
					display: 'flex',
					gap: '12px',
					alignItems: 'center'
				}
			},
			el(
				'span',
				{ style: { width: '10px', height: '10px', background: C.accent, borderRadius: '2px' } },
				''
			),
			el(
				'span',
				{ style: { width: '10px', height: '10px', background: C.accent2, borderRadius: '2px' } },
				''
			),
			el(
				'span',
				{ style: { width: '10px', height: '10px', background: C.accent3, borderRadius: '2px' } },
				''
			)
		)
	);
}

// ── 渲染为 PNG ──
async function render(element, outPath) {
	const svg = await satori(element, { width: W, height: H, fonts });
	const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: W } });
	const png = resvg.render().asPng();
	writeFileSync(outPath, png);
}

// ── 主流程 ──
async function main() {
	console.log('🎨 开始生成 OG 图...\n');

	const postsDir = join(ROOT, 'src/content/posts');
	const ogDir = join(ROOT, 'static/og');
	mkdirSync(ogDir, { recursive: true });

	const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'));
	let generated = 0;
	let skipped = 0;

	for (const file of files) {
		const raw = readFileSync(join(postsDir, file), 'utf-8');
		const meta = parseFrontmatter(raw);
		if (!meta) {
			skipped++;
			continue;
		}
		if (meta.draft === true) {
			skipped++;
			continue;
		}

		const slug = file.replace(/\.md$/, '');

		try {
			await render(postOG(meta), join(ogDir, `${slug}.png`));
			console.log(`  ✓ ${slug}`);
			generated++;
		} catch (e) {
			console.error(`  ✗ ${slug}: ${e.message}`);
		}
	}

	// 默认 OG 图
	try {
		await render(defaultOG(), join(ROOT, 'static/og-default.png'));
		console.log('  ✓ og-default.png');
		generated++;
	} catch (e) {
		console.error(`  ✗ og-default.png: ${e.message}`);
	}

	console.log(`\n✅ 完成: 生成 ${generated} 张, 跳过 ${skipped} 篇`);
}

main().catch((e) => {
	console.error('⚠ OG 图生成失败:', e.message);
	console.error('  构建将继续，OG 图将使用回退默认图');
	// 不阻断构建——退出码 0
	process.exit(0);
});
