import {
	parseMarkdown,
	extractHeadings,
	extractImages,
	estimateReadTime,
	getWordCount,
	formatWordCount,
	formatDateShort,
	formatDateLong,
	formatDateTime
} from './frontmatter';
import type {
	PostCard,
	Article,
	PhotoCard,
	TimelineNote,
	YearSection,
	GalleryPhoto,
	Album,
	ArchiveYear
} from '$lib/types';

/* ============================================================
 *  共享常量
 * ============================================================ */

const PHOTO_GRADIENTS = [
	'linear-gradient(160deg,#d4dcd8 0%,#8aaa9e 30%,#4d7d68 55%,#2f5648 100%)',
	'linear-gradient(145deg,#c4b89a 0%,#9fbcab 35%,#4d7d68 65%,#2f5648 100%)',
	'linear-gradient(130deg,#f0e6d8 0%,#e0c3a4 30%,#bd8a63 60%,#8f5e3e 100%)',
	'linear-gradient(155deg,#d8e2dc 0%,#a8c4b8 35%,#5e7d72 65%,#3f5e5d 100%)',
	'linear-gradient(140deg,#c8d4ce 0%,#7a9c92 30%,#4d6b62 60%,#2f4a42 100%)',
	'linear-gradient(135deg,#eee8df 0%,#dfe7e3 40%,#9aae9f 75%,#7a9484 100%)'
];

const GALLERY_HEIGHTS = [
	'240px',
	'180px',
	'220px',
	'200px',
	'260px',
	'170px',
	'210px',
	'190px',
	'230px'
];

const MONTH_NAMES = [
	'一月',
	'二月',
	'三月',
	'四月',
	'五月',
	'六月',
	'七月',
	'八月',
	'九月',
	'十月',
	'十一月',
	'十二月'
];

const AUTHOR = {
	name: '東风',
	bio: '写代码、记生活，偶尔拍点照片。这个站点是我的数字自留地，慢更，但一直在。'
} as const;

const START_YEAR = 2019;

/* ============================================================
 *  Posts 加载器（带缓存）
 * ============================================================ */

const postRawFiles = import.meta.glob('/src/content/posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export interface RawPost {
	slug: string;
	title: string;
	date: Date;
	/** 更新日期（如有） */
	updated?: Date;
	tags: string[];
	category: string;
	description: string;
	draft: boolean;
	featured: boolean;
	pinned: boolean;
	image?: string;
	body: string;
}

/** 模块级缓存——仅在 adapter-static（单次构建）下安全；若切换到 SSR adapter 需改为请求级缓存 */
let _postsCache: RawPost[] | null = null;

function loadRawPosts(): RawPost[] {
	if (_postsCache) return _postsCache;

	const posts: RawPost[] = [];

	for (const [path, raw] of Object.entries(postRawFiles)) {
		const { metadata, body } = parseMarkdown(raw);
		const slug = path.split('/').pop()!.replace(/\.md$/, '');

		const draft = metadata.draft as boolean | undefined;
		if (draft) continue;

		posts.push({
			slug,
			title: (metadata.title as string) || slug,
			date: new Date(metadata.date as string),
			updated: metadata.updated ? new Date(metadata.updated as string) : undefined,
			tags: (metadata.tags as string[]) || [],
			category: (metadata.category as string) || '随笔',
			description: (metadata.description as string) || '',
			draft: draft ?? false,
			featured: (metadata.featured as boolean) ?? false,
			pinned: (metadata.pinned as boolean) ?? false,
			image: metadata.image as string | undefined,
			body
		});
	}

	posts.sort((a, b) => b.date.getTime() - a.date.getTime());
	_postsCache = posts;
	return posts;
}

/** 获取所有文章原始数据（含日期、描述，用于 RSS / sitemap） */
export function getRawPosts(): RawPost[] {
	return loadRawPosts();
}

/** 获取所有文章分类（动态生成过滤器） */
export function getPostCategories(): { key: string; label: string }[] {
	const posts = loadRawPosts();
	const categories = new Set(posts.map((p) => p.category).filter(Boolean));
	return [
		{ key: '全部', label: '全部' },
		...Array.from(categories).map((c) => ({ key: c, label: c }))
	];
}

/** 获取所有文章卡片数据 */
export function getPostCards(): PostCard[] {
	return loadRawPosts().map((p) => ({
		slug: p.slug,
		category: p.category,
		title: p.title,
		excerpt: p.description,
		date: formatDateShort(p.date),
		readTime: estimateReadTime(p.body),
		wordCount: formatWordCount(getWordCount(p.body)),
		featured: p.featured,
		pinned: p.pinned
	}));
}

/** 根据 slug 获取单篇文章卡片数据（用于文章内引用组件） */
export function getPostCard(slug: string): PostCard | null {
	const posts = loadRawPosts();
	const post = posts.find((p) => p.slug === slug);
	if (!post) return null;
	return {
		slug: post.slug,
		category: post.category,
		title: post.title,
		excerpt: post.description,
		date: formatDateShort(post.date),
		readTime: estimateReadTime(post.body),
		wordCount: formatWordCount(getWordCount(post.body)),
		featured: post.featured,
		pinned: post.pinned
	};
}

/** 获取首页精选文章（最新 5 篇，置顶优先） */
export function getFeaturedPosts(): PostCard[] {
	return loadRawPosts()
		.sort((a, b) => {
			if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
			return b.date.getTime() - a.date.getTime();
		})
		.slice(0, 5)
		.map((p) => ({
			slug: p.slug,
			category: p.category,
			title: p.title,
			excerpt: p.description,
			date: formatDateShort(p.date),
			readTime: estimateReadTime(p.body),
			wordCount: formatWordCount(getWordCount(p.body)),
			featured: p.featured,
			pinned: p.pinned
		}));
}

/** 获取单篇文章元数据（不含渲染组件） */
export function getArticle(slug: string): Article | null {
	const posts = loadRawPosts();
	const idx = posts.findIndex((p) => p.slug === slug);
	if (idx === -1) return null;

	const post = posts[idx];
	const toc = extractHeadings(post.body);

	const prev =
		idx < posts.length - 1 ? { slug: posts[idx + 1].slug, title: posts[idx + 1].title } : undefined;
	const next = idx > 0 ? { slug: posts[idx - 1].slug, title: posts[idx - 1].title } : undefined;

	const tags = post.tags.map((label, i) => ({
		label,
		type: (i < 2 ? 'acc' : 'line') as 'acc' | 'line'
	}));

	return {
		slug: post.slug,
		title: post.title,
		category: post.category,
		date: formatDateLong(post.date),
		updated: post.updated ? formatDateLong(post.updated) : undefined,
		datePublished: post.date.toISOString(),
		readTime: estimateReadTime(post.body),
		wordCount: formatWordCount(getWordCount(post.body)),
		views: '—',
		image: post.image,
		tags,
		author: { ...AUTHOR },
		prev,
		next,
		toc,
		comments: []
	};
}

/** 获取所有文章的 slug 列表（用于 entries） */
export function getAllPostSlugs(): string[] {
	return loadRawPosts().map((p) => p.slug);
}

/** 获取所有标签及每篇文章数（用于标签页） */
export function getAllTags(): { tag: string; count: number }[] {
	const posts = loadRawPosts();
	const tagMap = new Map<string, number>();
	for (const p of posts) {
		for (const t of p.tags) {
			tagMap.set(t, (tagMap.get(t) || 0) + 1);
		}
	}
	return Array.from(tagMap.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);
}

/** 获取所有标签名列表（用于 entries） */
export function getAllTagSlugs(): string[] {
	return getAllTags().map((t) => t.tag);
}

/** 按标签获取文章卡片列表 */
export function getPostsByTag(tag: string): PostCard[] {
	return loadRawPosts()
		.filter((p) => p.tags.includes(tag))
		.map((p) => ({
			slug: p.slug,
			category: p.category,
			title: p.title,
			excerpt: p.description,
			date: formatDateShort(p.date),
			readTime: estimateReadTime(p.body),
			wordCount: formatWordCount(getWordCount(p.body)),
			featured: p.featured,
			pinned: p.pinned
		}));
}

/** 获取相关文章（按标签重叠度匹配，排除自身） */
export function getRelatedPosts(slug: string, limit = 3): PostCard[] {
	const posts = loadRawPosts();
	const current = posts.find((p) => p.slug === slug);
	if (!current) return [];

	const currentTags = new Set(current.tags);
	const currentCat = current.category;

	return posts
		.filter((p) => p.slug !== slug)
		.map((p) => {
			let score = 0;
			// 标签重叠加分
			for (const t of p.tags) {
				if (currentTags.has(t)) score += 2;
			}
			// 同分类加分
			if (p.category === currentCat) score += 1;
			return { post: p, score };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			return b.post.date.getTime() - a.post.date.getTime();
		})
		.slice(0, limit)
		.map((item) => ({
			slug: item.post.slug,
			category: item.post.category,
			title: item.post.title,
			excerpt: item.post.description,
			date: formatDateShort(item.post.date),
			readTime: estimateReadTime(item.post.body),
			wordCount: formatWordCount(getWordCount(item.post.body)),
			featured: item.post.featured,
			pinned: item.post.pinned
		}));
}

/* ============================================================
 *  Photos 加载器（带缓存）
 * ============================================================ */

const photoRawFiles = import.meta.glob('/src/content/photos/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export interface RawPhoto {
	slug: string;
	title: string;
	description: string;
	date: Date;
	location: string;
	category: string;
	body: string;
	images: string[];
}

/** 模块级缓存——仅在 adapter-static（单次构建）下安全；若切换到 SSR adapter 需改为请求级缓存 */
let _photosCache: RawPhoto[] | null = null;

function loadRawPhotos(): RawPhoto[] {
	if (_photosCache) return _photosCache;

	const photos: RawPhoto[] = [];

	for (const [path, raw] of Object.entries(photoRawFiles)) {
		const { metadata, body } = parseMarkdown(raw);
		const slug = path.split('/').pop()!.replace(/\.md$/, '');

		photos.push({
			slug,
			title: (metadata.title as string) || slug,
			description: (metadata.description as string) || '',
			date: new Date(metadata.date as string),
			location: (metadata.location as string) || '',
			category: (metadata.category as string) || '风景',
			body,
			images: extractImages(body)
		});
	}

	photos.sort((a, b) => b.date.getTime() - a.date.getTime());
	_photosCache = photos;
	return photos;
}

/** 获取所有相册分类（动态生成过滤器） */
export function getPhotoCategories(): { key: string; label: string }[] {
	const photos = loadRawPhotos();
	const categories = new Set(photos.map((p) => p.category).filter(Boolean));
	return [
		{ key: '全部', label: '全部' },
		...Array.from(categories).map((c) => ({ key: c, label: c }))
	];
}

/** 格式化照片的位置行 */
function formatPhotoLocation(date: Date, location: string): string {
	return `${String(date.getMonth() + 1).padStart(2, '0')} / ${date.getFullYear()} · ${location}`;
}

/** 首页精选照片 */
export function getFeaturedPhotos(): PhotoCard[] {
	return loadRawPhotos()
		.slice(0, 3)
		.map((p, i) => ({
			slug: p.slug,
			title: p.title,
			location: formatPhotoLocation(p.date, p.location),
			gradient: PHOTO_GRADIENTS[i % PHOTO_GRADIENTS.length],
			img: p.images[0] || '',
			alt: p.title
		}));
}

/** 相册列表 */
export function getAlbums(): Album[] {
	return loadRawPhotos().map((p, i) => ({
		slug: p.slug,
		title: p.title,
		count: `${p.images.length} 张`,
		year: String(p.date.getFullYear()),
		category: p.category,
		gradient: PHOTO_GRADIENTS[i % PHOTO_GRADIENTS.length],
		img: p.images[0] || '',
		alt: p.title
	}));
}

/** 获取单张照片详情 */
export function getPhotoDetail(slug: string) {
	const photos = loadRawPhotos();
	const idx = photos.findIndex((p) => p.slug === slug);
	if (idx === -1) return null;

	const photo = photos[idx];
	const imageCount = photo.images.length;

	const thumbs = photo.images.slice(0, 8).map((img, i) => ({
		gradient: PHOTO_GRADIENTS[i % PHOTO_GRADIENTS.length],
		img,
		alt: `${photo.title} ${i + 1}`
	}));

	const lightboxPhotos = photo.images.map((img, i) => ({
		img,
		grad: PHOTO_GRADIENTS[i % PHOTO_GRADIENTS.length],
		cap: `${photo.title} · ${i + 1}`
	}));

	return {
		title: photo.title,
		subtitle: `${photo.title} · ${photo.location}`,
		desc: photo.description,
		date: `${String(photo.date.getMonth() + 1).padStart(2, '0')} / ${photo.date.getFullYear()}`,
		location: photo.location,
		count: `${imageCount} 张`,
		currentIndex: `1 / ${imageCount}`,
		mainGradient: PHOTO_GRADIENTS[0],
		mainImg: photo.images[0] || '',
		mainAlt: photo.title,
		meta: [
			{ label: '地点', value: photo.location },
			{ label: '分类', value: photo.category },
			{ label: '日期', value: formatDateLong(photo.date) },
			{ label: '张数', value: `${imageCount} 张` }
		],
		thumbs,
		lightboxPhotos
	};
}

export function getAllPhotoSlugs(): string[] {
	return loadRawPhotos().map((p) => p.slug);
}

/* ============================================================
 *  Moments (说说) 加载器（带缓存）
 * ============================================================ */

const momentRawFiles = import.meta.glob('/src/content/moments/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export interface RawMoment {
	slug: string;
	id: string;
	title: string;
	date: Date;
	body: string;
	images: string[];
}

/** 模块级缓存——仅在 adapter-static（单次构建）下安全；若切换到 SSR adapter 需改为请求级缓存 */
let _momentsCache: RawMoment[] | null = null;

function loadRawMoments(): RawMoment[] {
	if (_momentsCache) return _momentsCache;

	const moments: RawMoment[] = [];

	for (const [path, raw] of Object.entries(momentRawFiles)) {
		const { metadata, body } = parseMarkdown(raw);
		const slug = path.split('/').pop()!.replace(/\.md$/, '');

		// 去掉图片标记，保留纯文本
		const text = body.replace(/!\[[^\]]*\]\([^)]*\)/g, '').trim();

		moments.push({
			slug,
			id: (metadata.id as string) || slug,
			title: (metadata.title as string) || '',
			date: new Date(metadata.date as string),
			body: text,
			images: extractImages(body)
		});
	}

	moments.sort((a, b) => b.date.getTime() - a.date.getTime());
	_momentsCache = moments;
	return moments;
}

/** 说说时间线（按年份分组） */
export function getNoteYearSections(): YearSection[] {
	const moments = loadRawMoments();
	const yearMap = new Map<string, TimelineNote[]>();

	for (const m of moments) {
		const year = String(m.date.getFullYear());
		if (!yearMap.has(year)) yearMap.set(year, []);

		yearMap.get(year)!.push({
			id: m.id,
			time: formatDateTime(m.date),
			text: m.body,
			likes: 0,
			comments: 0,
			imgClass: m.images.length > 0 ? 'cool' : undefined,
			images: m.images.length > 0 ? m.images : undefined
		});
	}

	const sections: YearSection[] = [];
	for (const [year, notes] of yearMap) {
		sections.push({ year, count: notes.length, notes });
	}

	return sections;
}

/* ============================================================
 *  Archive 加载器
 * ============================================================ */

export function getArchiveYears(): ArchiveYear[] {
	const posts = loadRawPosts();
	const yearMap = new Map<string, Map<string, ArchiveYear['months'][0]['items']>>();

	for (const post of posts) {
		const year = String(post.date.getFullYear());
		const monthLabel = MONTH_NAMES[post.date.getMonth()];

		if (!yearMap.has(year)) yearMap.set(year, new Map());
		const monthMap = yearMap.get(year)!;
		if (!monthMap.has(monthLabel)) monthMap.set(monthLabel, []);

		monthMap.get(monthLabel)!.push({
			date: formatDateShort(post.date),
			slug: post.slug,
			title: post.title,
			category: post.category
		});
	}

	const years: ArchiveYear[] = [];
	for (const [year, monthMap] of yearMap) {
		const months = Array.from(monthMap.entries()).map(([label, items]) => ({ label, items }));
		const count = months.reduce((sum, m) => sum + m.items.length, 0);
		years.push({ year, count: `${count} 篇`, months });
	}

	return years;
}

/* ============================================================
 *  统计数据（复用缓存）
 * ============================================================ */

export function getContentStats() {
	const posts = loadRawPosts();
	const photos = loadRawPhotos();
	const moments = loadRawMoments();
	const currentYear = new Date().getFullYear();

	// 全站文章总字数
	const totalWords = posts.reduce((sum, p) => sum + getWordCount(p.body), 0);

	// 分类和标签统计
	const categories = new Set(posts.map((p) => p.category));
	const tags = new Set(posts.flatMap((p) => p.tags));

	// 运行天数（从 START_YEAR-01-01 算起）
	const startDate = new Date(`${START_YEAR}-01-01`);
	const runningDays = Math.floor(
		(new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
	);

	return {
		postCount: posts.length,
		photoCount: photos.length,
		momentCount: moments.length,
		categoryCount: categories.size,
		tagCount: tags.size,
		years: currentYear - START_YEAR,
		totalWords,
		runningDays
	};
}

/** 获取最新一条说说（用于首页 Hero） */
export function getLatestMoment(): { text: string; time: string } | null {
	const moments = loadRawMoments();
	if (moments.length === 0) return null;
	const latest = moments[0];
	return {
		text: latest.body,
		time: formatDateTime(latest.date)
	};
}
