import type { HeroStat, Skill, Milestone } from '$lib/types';

/* ============================================================
 *  首页配置
 * ============================================================ */

/** Hero 区域文案 */
export const heroConfig = {
	eyebrow: 'PERSONAL BLOG · 个人博客',
	title: '你好，我是',
	titleAccent: '東风',
	subtitle: '写代码、记生活，偶尔拍点照片。下面是这个博客的实时账本——三种内容，一种慢慢过的日子。'
} as const;

/** 广播完整文本（用于 sr-only） */
export const tickerSrText = '新主题 Pixel Universe 已上线，大家发现不足或Bug请在评论区留言。';

/** Hero 精简统计项配置（数值在运行时填充） */
export const heroStatsConfig: HeroStat[] = [
	{ number: '—', unit: '字', label: '字数统计', sub: '' },
	{ number: '—', unit: '篇', label: '文章统计', sub: '' },
	{ number: '—', unit: '天', label: '运行天数', sub: '' }
];

/* ============================================================
 *  页面头配置
 * ============================================================ */

export const postsPageHead = {
	title: '文章',
	en: 'Posts',
	desc: '长文、教程与碎碎念。写代码、做设计、过日子，都记在这里。',
	count: '— 篇'
};

export const momentsPageHead = {
	title: '说说',
	en: 'Moments',
	desc: '零碎念头、随手拍、一时兴起。比文章轻，比朋友圈久。',
	count: '— 条'
};

export const galleryPageHead = {
	title: '相册',
	en: 'Gallery',
	desc: '路上的瞬间，按系列归档。雾、墙、窗、人——都是慢下来的证据。',
	count: '— 张 · — 个系列'
};

export const archivePageHead = {
	title: '归档',
	en: 'Archive',
	desc: '按时间倒序。陆续更新, 随心所欲',
	count: '— 篇'
};

/* ============================================================
 *  分页配置 — 修改此处调整各板块每页数量
 * ============================================================ */

/** 各板块分页设置 */
export const paginationConfig = {
	/** 文章列表每页数量 */
	posts: 12,
	/** 说说每页数量 */
	moments: 20,
	/** 相册每页数量 */
	gallery: 18
} as const;

/* ============================================================
 *  筛选项配置（动态从内容中获取，见 $lib/utils/loaders.ts）
 * ============================================================ */

/* ============================================================
 *  此刻卡片配置
 * ============================================================ */

export const nowCardConfig = {
	chips: ['南京', '夏 35°', '后摇'],
	doing: [
		{ label: '正在听', value: '《呼吸决定》' },
		{ label: '心情', value: '困 · 想睡觉' }
	]
};

/* ============================================================
 *  关于页配置
 * ============================================================ */

export const aboutHero = {
	name: '東风',
	role: 'Frontend · Photographer · 慢生活实践者',
	desc: '写代码的人，也认真记生活。这个站点 2019 年起断断续续更到现在，是我留给自己的数字自留地。不追热点，不接广告，只想把日子过慢一点、记清楚一点。'
};

export const skills: Skill[] = [
	{ label: '前端工程', value: 'React / Vue' },
	{ label: '设计系统', value: 'Tokens / CSS' },
	{ label: '动效', value: 'GSAP / CSS' },
	{ label: '摄影', value: '富士 / 35mm' },
	{ label: '写作', value: '长文 / 随笔' },
	{ label: '工具链', value: 'Node / Python' }
];

export const milestones: Milestone[] = [
	{ year: '2019', title: '开了这个博客', desc: '第一篇文章关于怎么用 Hexo 搭静态站。' },
	{ year: '2021', title: '更换为Hugo', desc: '开始认真拍照，相册从 0 攒到 300+。' },
	{ year: '2022', title: '更换为nextJs', desc: '部署在vercel，博客从 100 访问量提升到 1000。' },
	{
		year: '2024',
		title: '更换为SvelteKit',
		desc: '由于不喜欢jsx语法，所以迁移到sveltekit，部署在cloudflare'
	},
	{ year: '2026', title: '第三版主页上线', desc: '全栈框架，全面拥抱cloudflare。' }
];

export const aboutSite = {
	desc: '纯静态、Svelte 框架。设计语言统一在 app.css 一套 design token 里，首页、列表、详情、相册、说说、归档全部复用，所以你不会在这里看到「换了个设计师」的割裂感。配色是赛博绿 + 霓虹粉 + 电光蓝，暗色为主，像深夜显示器上的荧光。',
	links: [
		{ label: 'Email', href: 'mailto:7af39971a8888e6b' },
		{ label: 'GitHub', href: 'https://github.com/cheungray123' },
		{ label: 'RSS', href: '/rss.xml' }
	]
};
