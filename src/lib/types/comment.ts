export interface ApiResponse<T = unknown> {
	code: number;
	message: string;
	data?: T;
}

export interface CommentGetResponse {
	data: CommentData[];
	more: boolean;
	count: number;
}

export interface CommentSubmitParams {
	url: string;
	title?: string;
	content: string;
	comment?: string;
	nick: string;
	mail: string;
	link?: string;
	parentId?: string;
	replyId?: string;
	href?: string;
	ua?: string;
	pid?: string;
	rid?: string;
	turnstileToken?: string;
}

export interface CommentConfig {
	VERSION: string;
	IS_ADMIN: boolean | string;
	SITE_NAME: string;
	SITE_URL: string;
	MASTER_TAG: string;
	BLOGGER_NAME: string;
	GRAVATAR_CDN: string;
	DEFAULT_GRAVATAR: string;
	SHOW_IMAGE: string;
	SHOW_EMOTION: string;
	SHOW_UA: string;
	SHOW_REGION: string;
	SHOW_ORDER: string;
	LIGHTBOX: string;
	HIGHLIGHT: string;
	HIGHLIGHT_THEME: string;
	DISPLAYED_FIELDS: string[];
	REQUIRED_FIELDS: string[];
	LIMIT_LENGTH: string | Record<string, number>;
	TURNSTILE_SITE_KEY: string;
	GEETEST_CAPTCHA_ID: string;
	CAPTCHA_PROVIDER: string;
	IMAGE_CDN: string;
	COMMENT_PLACEHOLDER: string;
	COMMENT_PAGE_SIZE: string;
	COMMENT_BG_IMG: string;
	SHOW_LOCAL_UPLOAD: string;
	avatar?: string;
	enable?: boolean;
	audit?: boolean;
}

export interface CommentUser {
	nick: string;
	mail: string;
	link?: string;
	mailMd5?: string;
}

export interface CommentData {
	id: string;
	url: string;
	title?: string;
	nick: string;
	mail?: string;
	uid?: string;
	mailMd5: string;
	ip?: string;
	ipRegion?: string;
	ua?: string;
	os?: string;
	browser?: string;
	content: string;
	created: number;
	like: number;
	liked?: boolean;
	pending?: boolean;
	rid?: string;
	replies?: CommentData[];
	link?: string;
	master?: boolean;
	top?: number;
	replyUser?: { nick?: string; mailMd5?: string };
	comment?: string;
	parentId?: string;
	replyId?: string;
	isAuthor?: boolean;
	avatar?: string;
	commentCount?: number;
	isSpam?: number;
}
