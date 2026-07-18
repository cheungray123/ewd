<script lang="ts">
	/**
	 * Bilibili 视频嵌入组件
	 *
	 * 在 Markdown 中使用：
	 * ```md
	 * <Bilibili bvid="BV1xx411x7xx" />
	 * <Bilibili bvid="BV1xx411x7xx" page={2} />
	 * <Bilibili bvid="BV1xx411x7xx" width="80%" />
	 * ```
	 *
	 * 也可以用短链接格式：
	 * <Bilibili url="https://www.bilibili.com/video/BV1xx411x7xx" />
	 */

	interface Props {
		bvid?: string;
		url?: string;
		page?: number;
		width?: string;
		autoplay?: boolean;
	}

	let { bvid, url, page = 1, width = '100%', autoplay = false }: Props = $props();

	// 从 url 中提取 bvid
	const resolvedBvid = $derived.by(() => {
		if (bvid) return bvid;
		if (url) {
			const match = url.match(/\/video\/(BV[\w]+)/i);
			return match?.[1] || '';
		}
		return '';
	});

	const embedSrc = $derived(
		`https://player.bilibili.com/player.html?bvid=${resolvedBvid}&page=${page}&high_quality=1&as_wide=1&autoplay=${autoplay ? 1 : 0}&danmaku=0`
	);
</script>

{#if resolvedBvid}
	<div class="bili-embed" style={`width:${width}`}>
		<div class="bili-aspect">
			<iframe
				src={embedSrc}
				title={`Bilibili 视频 ${resolvedBvid}${page > 1 ? ` 第 ${page} 页` : ''}`}
				scrolling="no"
				allowfullscreen
				loading="lazy"
			></iframe>
		</div>
		<a
			class="bili-link"
			href={`https://www.bilibili.com/video/${resolvedBvid}`}
			target="_blank"
			rel="noopener noreferrer"
		>
			在 Bilibili 中打开 →
		</a>
	</div>
{:else}
	<div class="bili-error">Bilibili 视频参数缺失：请提供 bvid 或 url</div>
{/if}

<style>
	.bili-embed {
		margin: 1.4rem 0;
	}

	.bili-aspect {
		position: relative;
		width: 100%;
		padding-top: 56.25%; /* 16:9 */
		border-radius: var(--r-md);
		overflow: hidden;
		border: var(--pixel-border);
		box-shadow: var(--shadow-sm);
	}

	.bili-aspect iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: none;
	}

	.bili-link {
		display: inline-block;
		margin-top: 0.5rem;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.04em;
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.bili-link:hover {
		opacity: 0.8;
	}

	.bili-error {
		padding: 1rem;
		background: var(--accent-soft);
		border-radius: var(--r-sm);
		color: var(--accent);
		font-size: 12px;
		margin: 1.4rem 0;
	}
</style>
