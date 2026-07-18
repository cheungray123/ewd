import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { mdsvexConfig } from './plugins/mdsvex.config';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ pages: 'dist' }),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			preprocess: [mdsvexConfig as any],
			extensions: ['.svelte', '.svx', '.md'],
			prerender: {
				entries: ['*', '/robots.txt', '/rss.xml', '/sitemap.xml', '/feed.json', '/manifest.json'],
				handleMissingId: 'warn',
				handleUnseenRoutes: 'warn'
			}
		})
	]
});
