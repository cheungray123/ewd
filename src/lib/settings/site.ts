import type { NavItem } from '$lib/types';

/** 站点起始年份（用于版权区间计算） */
const START_YEAR = 2019;
const CURRENT_YEAR = new Date().getFullYear();
const yearRange = CURRENT_YEAR > START_YEAR ? `${START_YEAR}-${CURRENT_YEAR}` : `${START_YEAR}`;

/** 站点全局配置 */
export const site = {
	name: '東风',
	brand: { prefix: '東', accent: '风' },
	title: '東风 · 博客',
	description: '写代码、记生活，偶尔拍点照片。',
	url: 'https://ewd.cc',
	avatar: '/avatar.jpg',
	copyright: `© ${yearRange} 東风 · 写代码的人也记生活`,
	established: `EWD. ${START_YEAR}`,
	startYear: START_YEAR,
	themeKey: 'df-theme',
	searchPlaceholder: '搜索文章、说说、相册…'
} as const;

/** 评论系统 API 地址 */
export const commentApi = 'https://admin.ewd.cc/api';

/** 网易云音乐 API 地址（Cloudflare Workers 部署） */
export const musicApi = 'https://m.easte.cc';

/** 导航菜单 */
export const navItems: NavItem[] = [
	{ label: '主页', href: '/' },
	{ label: '文章', href: '/posts' },
	{ label: '说说', href: '/moments' },
	{ label: '相册', href: '/gallery' },
	{ label: '友链', href: '/links' },
	{ label: '归档', href: '/archive' },
	{ label: '关于', href: '/about' }
];

/** 页脚链接（每页可定制，此处为默认） */
export const footerLinks = {
	default: [
		{ label: '关于', href: '/about' },
		{ label: '友链', href: '/links' },
		{ label: '归档', href: '/archive' },
		{ label: '标签', href: '/tags' },
		{ label: 'RSS', href: '/rss.xml' },
		{ label: 'JSON Feed', href: '/feed.json' }
	],
	article: [
		{ label: '关于', href: '/about' },
		{ label: '归档', href: '/archive' },
		{ label: '标签', href: '/tags' },
		{ label: '← 文章列表', href: '/posts' }
	],
	photo: [
		{ label: '关于', href: '/about' },
		{ label: '归档', href: '/archive' },
		{ label: '相册', href: '/gallery' }
	]
} as const;
