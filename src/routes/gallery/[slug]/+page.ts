import type { PageLoad } from './$types';
import { getPhotoDetail, getAllPhotoSlugs } from '$lib/utils/loaders';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
	return getAllPhotoSlugs().map((slug) => ({ slug }));
}

export const load: PageLoad = ({ params }) => {
	const photo = getPhotoDetail(params.slug);
	if (!photo) {
		throw error(404, `相册「${params.slug}」不存在`);
	}
	return { photo };
};
