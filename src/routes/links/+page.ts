import type { PageLoad } from './$types';
import { friendLinks, siteInfo, linkApplyInfo } from '$lib/settings/links';

export const prerender = true;

export const load: PageLoad = () => {
	return {
		links: friendLinks,
		siteInfo,
		applyInfo: linkApplyInfo
	};
};
