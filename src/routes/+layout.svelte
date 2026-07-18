<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import Nav from '$lib/components/layout/Nav.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Ambient from '$lib/components/layout/Ambient.svelte';
	import Lightbox from '$lib/components/base/Lightbox.svelte';
	import { onNavigate } from '$app/navigation';
	import { footerLinks, site } from '$lib/settings/site';
	import { theme } from '$lib/stores/theme.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// 主题初始化在客户端 hydration 后执行（防闪烁，store 内部有 browser 守卫）
	$effect(() => {
		theme.init();
	});

	// SvelteKit View Transitions — 浏览器不支持时自动降级为无动画
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	// 计算当前页面的 footer 链接
	let footerLinkList = $derived.by(() => {
		const path = page.url.pathname;
		if (path.startsWith('/posts/') && path !== '/posts/') {
			return [...footerLinks.article];
		}
		if (path.startsWith('/gallery/') && path !== '/gallery/') {
			return [...footerLinks.photo];
		}
		return [...footerLinks.default];
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="alternate" type="application/rss+xml" title={site.title} href="/rss.xml" />
	<link rel="alternate" type="application/feed+json" title={site.title} href="/feed.json" />
	<link rel="sitemap" type="application/xml" href="/sitemap.xml" />
</svelte:head>

<a class="skip-link" href="#main">跳到主内容</a>
<Ambient />
<div class="wrap">
	<Nav />
	<div class="page-content">{@render children()}</div>
	<Footer links={footerLinkList} />
</div>

<Lightbox />
