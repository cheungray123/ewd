/** 友链配置 — 博客互换链接 */

export interface FriendLink {
	name: string;
	url: string;
	desc: string;
	avatar: string;
	tags: string[];
}

/** 本站信息（供他人添加友链时引用） */
export const siteInfo = {
	name: '東风',
	url: 'https://ewd.cc',
	desc: '写代码、记生活，偶尔拍点照片。',
	avatar: 'https://weavatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e?s=80&d=initials'
} as const;

/** 友链列表 */
export const friendLinks: FriendLink[] = [
	{
		name: '東风',
		url: 'https://ewd.cc',
		desc: '写代码、记生活，偶尔拍点照片。',
		avatar: 'https://weavatar.com/avatar/d41d8cd98f00b204e9800998ecf8427e?s=80&d=initials',
		tags: ['老蹬', '逗比']
	}
];

/** 友链申请说明 */
export const linkApplyInfo = {
	rules: [
		'原创博客，内容健康，无违法及广告信息',
		'站点稳定运行至少 3 个月以上',
		'已添加本站链接，并在友链页可正常访问',
		'定期更新，长期维护的独立博客优先'
	],
	howToApply: [
		'将本站信息添加至你的友链页',
		'通过邮件或评论区留言告知你的站点信息',
		'包含：站点名称、地址、简介、头像链接',
		'我会在 3 个工作日内添加并回复'
	]
};
