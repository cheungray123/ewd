import type { PageLoad } from './$types';
import { getArchiveYears, getContentStats } from '$lib/utils/loaders';
import { archivePageHead } from '$lib/settings/pages';

export const load: PageLoad = () => {
	const years = getArchiveYears();
	const stats = getContentStats();

	const archiveNavItems = years.map((y, i) => ({
		year: y.year,
		href: `#y${y.year}`,
		active: i === 0
	}));

	const pageHead = {
		...archivePageHead,
		count: `${stats.postCount} 篇 · 2019–2026`
	};

	return {
		years,
		archiveNavItems,
		pageHead
	};
};
