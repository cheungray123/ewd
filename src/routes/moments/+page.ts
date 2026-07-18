import type { PageLoad } from './$types';
import { getNoteYearSections, getContentStats } from '$lib/utils/loaders';

export const load: PageLoad = () => {
	const sections = getNoteYearSections();
	const stats = getContentStats();

	const yearNavItems = sections.map((s, i) => ({
		year: s.year,
		count: s.count,
		href: `#y${s.year}`,
		active: i === 0
	}));

	return {
		sections,
		yearNavItems,
		count: `${stats.momentCount} 条`
	};
};
