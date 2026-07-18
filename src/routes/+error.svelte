<script lang="ts">
	import { page } from '$app/state';
	import { site } from '$lib/settings/site';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? '未知错误');

	const is404 = $derived(status === 404);
</script>

<svelte:head>
	<title>{status} · {site.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main id="main" class="page" tabindex="-1">
	<div class="err-card">
		<div class="code" class:big={is404}>{status}</div>
		<div class="msg">
			{#if is404}
				<h1>页面走丢了</h1>
				<p>你访问的路径不存在，可能文章已删除或链接有误。</p>
			{:else}
				<h1>出了一点问题</h1>
				<p>{message}</p>
			{/if}
		</div>
		<div class="acts">
			<a class="btn primary" href="/">← 回到首页</a>
			<a class="btn" href="/posts">浏览文章</a>
			<a class="btn" href="/archive">查看归档</a>
		</div>
		{#if is404}
			<div class="hint">
				<span>尝试从这些入口找到你要的内容：</span>
				<div class="links">
					<a href="/posts">文章</a>
					<a href="/moments">说说</a>
					<a href="/gallery">相册</a>
					<a href="/about">关于</a>
				</div>
			</div>
		{/if}
	</div>
</main>

<style>
	.page {
		margin: var(--sp-lg) 0 var(--sp-xl);
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 50vh;
	}
	.err-card {
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		padding: 3rem 2.5rem;
		box-shadow: var(--shadow-md);
		text-align: center;
		max-width: 440px;
		width: 100%;
	}
	.code {
		font-family: var(--font-pixel);
		font-size: 5rem;
		font-weight: 900;
		line-height: 1;
		color: var(--accent);
		letter-spacing: -0.04em;
		margin-bottom: 0.5rem;
	}
	.code.big {
		font-size: 7rem;
	}
	.msg h1 {
		font-family: var(--font-body);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--fg);
		margin-bottom: 0.5rem;
	}
	.msg p {
		font-size: 13px;
		color: var(--dim);
		line-height: 1.7;
	}
	.acts {
		display: flex;
		gap: 0.6rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 1.8rem;
	}
	.hint {
		margin-top: 1.8rem;
		padding-top: 1.4rem;
		border-top: 1px dashed var(--border-l);
	}
	.hint > span {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--muted);
	}
	.links {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 0.7rem;
	}
	.links a {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--accent);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s var(--ease);
	}
	.links a:hover {
		border-bottom-color: var(--accent);
	}
	@media (max-width: 680px) {
		.err-card {
			padding: 2rem 1.3rem;
		}
		.code.big {
			font-size: 5rem;
		}
	}
</style>
