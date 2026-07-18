<script lang="ts">
	import { page } from '$app/state';
	import { Search, Sun, Moon } from 'svelte-lucide';
	import { navItems, site } from '$lib/settings/site';
	import { theme } from '$lib/stores/theme.svelte';
	import { scrollLock } from '$lib/stores/scrollLock.svelte';
	import SearchPanel from './SearchPanel.svelte';

	let menuOpen = $state(false);
	let searchOpen = $state(false);

	function handleMenuToggle() {
		menuOpen = !menuOpen;
		if (menuOpen) {
			searchOpen = false;
			scrollLock.lock();
		} else {
			scrollLock.unlock();
		}
	}

	function handleSearchToggle(e: MouseEvent) {
		e.stopPropagation();
		if (!searchOpen) {
			menuOpen = false;
			scrollLock.lock();
		} else {
			scrollLock.unlock();
		}
		searchOpen = !searchOpen;
	}

	function handleNavClick() {
		menuOpen = false;
		searchOpen = false;
		scrollLock.reset();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (searchOpen || menuOpen) {
				searchOpen = false;
				menuOpen = false;
				scrollLock.reset();
			}
		}
		// 快捷键 Ctrl/Cmd + K 打开搜索
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			searchOpen = true;
			scrollLock.lock();
		}
	}

	// 缓存当前激活路径，避免每次 render 重复计算
	let currentPath = $derived(page.url.pathname);
	function isActive(href: string): boolean {
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<nav class="nav">
	<a class="brand" href="/">{site.brand.prefix}<b>{site.brand.accent}</b></a>

	<div class="nav-menu" class:open={menuOpen} id="nav-menu">
		{#each navItems as item (item.href)}
			<a href={item.href} class:active={isActive(item.href)} onclick={handleNavClick}>
				{item.label}
			</a>
		{/each}
	</div>

	<div class="nav-right">
		<button
			class="search-toggle"
			type="button"
			aria-label={searchOpen ? '收起搜索' : '搜索'}
			aria-expanded={searchOpen}
			aria-controls="search-panel"
			onclick={handleSearchToggle}
		>
			<Search size="18" strokeWidth="2" />
		</button>

		<button
			class="theme-toggle"
			type="button"
			aria-label={theme.current === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
			onclick={() => theme.toggle()}
		>
			{#if theme.current === 'dark'}
				<Moon size="17" strokeWidth="1.6" aria-hidden="true" />
			{:else}
				<Sun size="17" strokeWidth="1.6" aria-hidden="true" />
			{/if}
		</button>

		<button
			class="nav-toggle"
			type="button"
			aria-label={menuOpen ? '收起菜单' : '展开菜单'}
			aria-expanded={menuOpen}
			aria-controls="nav-menu"
			onclick={handleMenuToggle}
		>
			<span></span><span></span><span></span>
		</button>
	</div>

	<SearchPanel open={searchOpen} onNavigate={handleNavClick} />
</nav>

<style>
	.nav {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 0.6rem 1rem;
		height: var(--nav-h);
		padding: 0;
		border-bottom: 1px solid var(--border-l);
		position: relative;
		z-index: var(--z-nav);
		flex-wrap: nowrap;
	}
	.brand {
		font-family: var(--font-pixel);
		font-weight: 900;
		font-size: var(--text-xl);
		letter-spacing: 0.05em;
		flex: 0 0 auto;
		color: var(--accent);
		text-shadow: var(--nav-brand-glow);
		text-transform: uppercase;
	}
	.brand b {
		color: var(--accent-2);
	}
	.nav-menu {
		display: flex;
		gap: 1.4rem;
		font-family: var(--font-pixel);
		font-size: var(--text-2xs);
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.nav-menu a {
		position: relative;
		color: var(--dim);
		font-size: var(--text-sm);
		transition: color 0.2s var(--ease);
	}
	.nav-menu a:hover,
	.nav-menu a.active {
		color: var(--accent);
	}
	.nav-menu a::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -4px;
		height: 2px;
		background: var(--accent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.3s var(--ease);
	}
	.nav-menu a:hover::after,
	.nav-menu a.active::after {
		transform: scaleX(1);
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 0 0 auto;
		margin-left: auto;
	}

	.search-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: var(--r-sm);
		border: var(--pixel-border);
		background: var(--surface);
		color: var(--dim);
		cursor: pointer;
		transition:
			color 0.2s var(--ease),
			border-color 0.2s var(--ease),
			background 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.search-toggle:hover {
		color: var(--accent);
		border-color: var(--accent);
		background: var(--accent-soft);
		box-shadow: var(--pixel-shadow);
	}
	.search-toggle:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.search-toggle[aria-expanded='true'] {
		color: var(--accent);
		background: var(--accent-soft);
	}

	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: var(--r-sm);
		border: var(--pixel-border);
		background: var(--surface);
		color: var(--dim);
		cursor: pointer;
		transition:
			color 0.2s var(--ease),
			border-color 0.2s var(--ease),
			background 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.theme-toggle:hover {
		color: var(--accent);
		border-color: var(--accent);
		background: var(--accent-soft);
		box-shadow: var(--pixel-shadow);
	}
	.theme-toggle:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.nav-toggle {
		display: none;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 5px;
		width: 34px;
		height: 34px;
		padding: 0;
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		background: var(--surface);
		color: var(--dim);
		cursor: pointer;
		transition:
			background 0.2s var(--ease),
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.nav-toggle:hover {
		background: var(--accent-soft);
		border-color: var(--accent);
		box-shadow: var(--pixel-shadow);
	}
	.nav-toggle:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	.nav-toggle span {
		display: block;
		width: 18px;
		height: 2px;
		background: var(--fg);
		border-radius: 0;
		transition:
			transform 0.25s var(--ease),
			opacity 0.2s var(--ease);
	}
	.nav-toggle[aria-expanded='true'] span:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}
	.nav-toggle[aria-expanded='true'] span:nth-child(2) {
		opacity: 0;
	}
	.nav-toggle[aria-expanded='true'] span:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	/* 响应式 */
	@media (max-width: 680px) {
		.nav-toggle {
			display: flex;
		}
		.nav-menu {
			position: absolute;
			top: calc(100% + 0.5rem);
			left: 0;
			right: 0;
			flex-direction: column;
			align-items: stretch;
			gap: 0.1rem;
			margin-left: 0;
			background: var(--surface);
			border: var(--pixel-border);
			border-radius: var(--r-md);
			padding: 0.55rem;
			box-shadow: var(--shadow-md);
			z-index: 50;
			opacity: 0;
			transform: translateY(-8px);
			pointer-events: none;
			transition:
				opacity 0.2s var(--ease),
				transform 0.2s var(--ease);
		}
		.nav-menu.open {
			opacity: 1;
			transform: none;
			pointer-events: auto;
		}
		.nav-menu a {
			padding: 0.7rem 0.7rem;
			border-radius: var(--r-sm);
			font-size: 0.625rem;
		}
		.nav-menu a::after {
			display: none;
		}
		.nav-menu a:hover,
		.nav-menu a.active {
			background: var(--accent-soft);
			color: var(--accent);
		}
	}
</style>
