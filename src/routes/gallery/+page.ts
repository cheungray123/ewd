import type { PageLoad } from './$types';
import { getAlbums, getContentStats, getPhotoCategories } from '$lib/utils/loaders';

export const load: PageLoad = () => {
	const stats = getContentStats();
	const albums = getAlbums();
	const categories = getPhotoCategories();
	return {
		albums,
		count: `${stats.photoCount} 张 · ${albums.length} 个系列`,
		categories
	};
};
