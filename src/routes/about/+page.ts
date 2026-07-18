import type { PageLoad } from './$types';
import { aboutHero, skills, milestones, aboutSite } from '$lib/settings/pages';

export const load: PageLoad = () => {
	return {
		aboutHero,
		skills,
		milestones,
		aboutSite
	};
};
