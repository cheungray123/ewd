/* ===== 全站类型定义 ===== */

/** 导航菜单项 */
export interface NavItem {
	label: string;
	href: string;
}

/** 统计卡片数据（首页 Hero） */
export interface StatItem {
	tag: string;
	number: string;
	unit: string;
	label: string;
	sparkColor: string;
	sparkFillOpacity: string;
	points: string;
	fillPoints: string;
	gradientId: string;
}

/** 首页 Hero 精简统计项 */
export interface HeroStat {
	/** 数值 */
	number: string;
	/** 单位 */
	unit: string;
	/** 标签 */
	label: string;
	/** 补充说明（如 "20 篇 · 12 组"） */
	sub?: string;
}

/** 首页 Hero 最新说说 */
export interface LatestMoment {
	text: string;
	time: string;
}

/** 广播滚动条目 */
export interface TickerItem {
	text: string;
	value?: string;
	clock?: boolean;
}

/** 文章卡片 */
export interface PostCard {
	slug: string;
	category: string;
	title: string;
	excerpt: string;
	date: string;
	readTime: string;
	wordCount?: string;
	featured?: boolean;
	pinned?: boolean;
}

/** 文章详情 */
export interface Article {
	slug: string;
	title: string;
	category: string;
	date: string;
	/** 更新日期（如有） */
	updated?: string;
	readTime: string;
	wordCount?: string;
	views: string;
	/** 缩略图地址（frontmatter image 字段），无则不渲染 post-hero */
	image?: string;
	tags: { label: string; type: 'acc' | 'line' }[];
	author: {
		name: string;
		bio: string;
	};
	prev?: { slug: string; title: string };
	next?: { slug: string; title: string };
	toc: { id: string; label: string; level: number }[];
	comments: Comment[];
	/** 原始发布日期（ISO 格式，用于 SEO） */
	datePublished?: string;
}

/** 评论 */
export interface Comment {
	id: string;
	name: string;
	isAuthor?: boolean;
	time: string;
	text: string;
	likes: number;
	avatarVariant?: 'a' | 'b' | 'c';
	replies?: Comment[];
}

/** 相册卡片（首页 / 相册列表） */
export interface PhotoCard {
	slug: string;
	title: string;
	location: string;
	gradient: string;
	img: string;
	alt: string;
}

/** 相册系列 */
export interface Album {
	slug: string;
	title: string;
	count: string;
	year: string;
	category: string;
	gradient: string;
	img: string;
	alt: string;
}

/** 画廊照片项 */
export interface GalleryPhoto {
	slug: string;
	title: string;
	location: string;
	gradient: string;
	height: string;
	img: string;
	alt: string;
	category: string;
}

/** 照片详情 */
export interface PhotoDetail {
	title: string;
	subtitle: string;
	desc: string;
	date: string;
	location: string;
	count: string;
	currentIndex: string;
	mainGradient: string;
	mainImg: string;
	mainAlt: string;
	meta: { label: string; value: string }[];
	thumbs: { gradient: string; img: string; alt: string }[];
}

/** 说说时间线条目 */
export interface TimelineNote {
	id: string;
	time: string;
	text: string;
	likes: number;
	comments: number;
	imgClass?: 'cool' | 'warm';
	images?: string[];
}

/** 年份分区（说说页） */
export interface YearSection {
	year: string;
	count: number;
	notes: TimelineNote[];
}

/** 此刻卡片数据 */
export interface NowCard {
	clock: string;
	chips: string[];
	doing: { label: string; value: string }[];
}

/** 技能项（关于页） */
export interface Skill {
	label: string;
	value: string;
}

/** 里程碑（关于页） */
export interface Milestone {
	year: string;
	title: string;
	desc: string;
}

/** 归档条目 */
export interface ArchiveItem {
	date: string;
	slug: string;
	title: string;
	category: string;
}

/** 归档月份 */
export interface ArchiveMonth {
	label: string;
	items: ArchiveItem[];
}

/** 归档年份 */
export interface ArchiveYear {
	year: string;
	count: string;
	months: ArchiveMonth[];
}

/** 筛选项 */
export interface FilterOption {
	key: string;
	label: string;
}

/** 分页项 */
export interface PagerItem {
	label: string;
	href?: string;
	current?: boolean;
	dots?: boolean;
}
