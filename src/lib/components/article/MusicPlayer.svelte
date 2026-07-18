<script lang="ts">
	/**
	 * MusicPlayer — 网易云音乐播放器组件
	 *
	 * 短代码写法（推荐，更简洁）：
	 * ```md
	 * ::music id="255020"
	 * ::music songs="255020,255021"
	 * ::music playlist="7044354223"
	 * ::music recommend
	 * ::music recommend compact
	 * ::music playlist="7044354223" openList
	 * ```
	 *
	 * 也可以直接用 Svelte 组件语法：
	 * ```md
	 * <MusicPlayer id="255020" />
	 * <MusicPlayer songs="255020,255021" />
	 * <MusicPlayer playlist="7044354223" />
	 * <MusicPlayer recommend compact />
	 * ```
	 */

	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import {
		Play,
		Pause,
		SkipBack,
		SkipForward,
		Volume2,
		VolumeX,
		ListMusic,
		X,
		Loader,
		Music
	} from 'svelte-lucide';
	import {
		getSongDetail,
		getSongUrl,
		getLyric,
		getPlaylistTracks,
		getPlaylistInfo,
		getRecommendSongs,
		type SongInfo,
		type LyricLine
	} from '$lib/utils/music';

	interface Props {
		/** 单曲 ID */
		id?: string | number;
		/** 多首歌曲 ID（逗号分隔） */
		songs?: string;
		/** 歌单 ID */
		playlist?: string | number;
		/** 每日推荐歌曲 */
		recommend?: boolean;
		/** 精简模式：隐藏歌词面板 */
		compact?: boolean;
		/** 自动播放（默认 false，浏览器策略通常不允许） */
		autoplay?: boolean;
		/** 播放列表默认展开（默认 false） */
		openList?: boolean;
	}

	let {
		id,
		songs,
		playlist,
		recommend = false,
		compact = false,
		autoplay = false,
		openList = false
	}: Props = $props();

	// ── 状态 ──
	let trackList = $state<SongInfo[]>([]);
	let currentIndex = $state(0);
	let isPlaying = $state(false);
	let isLoading = $state(true);
	let isLoadingUrl = $state(false);
	let error = $state<string | null>(null);

	// 播放进度
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(0.7);
	let isMuted = $state(false);

	// 歌词
	let lyrics = $state<LyricLine[]>([]);
	let currentLyricIndex = $state(-1);
	let showLyrics = $state(false);

	// 播放列表展开
	let _playlistExpanded = $state(false);
	let showPlaylist = $derived(openList || _playlistExpanded);

	// 歌单信息
	let playlistName = $state<string>('');

	// ── DOM 引用 ──
	let audioEl = $state<HTMLAudioElement | null>(null);
	let progressBar = $state<HTMLDivElement | null>(null);
	let lyricContainer = $state<HTMLDivElement | null>(null);

	// ── 计算属性 ──
	let currentTrack = $derived(trackList[currentIndex] || null);
	let progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

	// ── 生命周期 ──
	onMount(async () => {
		try {
			if (recommend) {
				// 每日推荐模式
				playlistName = '每日推荐';
				trackList = await getRecommendSongs();
			} else if (playlist) {
				// 歌单模式
				const info = await getPlaylistInfo(playlist);
				if (info) playlistName = info.name;
				trackList = await getPlaylistTracks(playlist, 100);
			} else if (songs) {
				// 多曲模式
				const ids = songs
					.split(',')
					.map((s) => s.trim())
					.filter(Boolean);
				trackList = await getSongDetail(ids);
			} else if (id) {
				// 单曲模式
				trackList = await getSongDetail(id);
			} else {
				error = '请提供 id、songs、playlist 或 recommend 参数';
				isLoading = false;
				return;
			}

			if (trackList.length === 0) {
				error = '未找到歌曲信息';
			} else if (autoplay) {
				await playTrack(0);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : '加载失败';
		} finally {
			isLoading = false;
		}
	});

	onDestroy(() => {
		if (audioEl) {
			// 等待未完成的 play() Promise，避免 pause() 中断时抛出 AbortError
			if (playPromise) {
				try {
					playPromise.catch(() => {});
				} catch {
					/* ignore */
				}
			}
			try {
				audioEl.pause();
			} catch {
				/* pause 在某些状态下可能抛错，忽略 */
			}
			audioEl.src = '';
			playPromise = null;
		}
	});

	// 跟踪当前 play() Promise，防止 pause() 中断未完成的 play()
	let playPromise: Promise<void> | null = null;

	// ── 播放控制 ──
	async function playTrack(index: number) {
		if (index < 0 || index >= trackList.length) return;
		currentIndex = index;
		isLoadingUrl = true;
		error = null;

		try {
			const track = trackList[index];
			const url = await getSongUrl(track.id);

			if (!url) {
				error = `「${track.name}」暂无播放源（可能因版权限制）`;
				isLoadingUrl = false;
				return;
			}

			if (audioEl) {
				// 等待前一次 play() 完成后再切换 src，避免 AbortError
				if (playPromise) {
					try {
						await playPromise;
					} catch {
						/* AbortError 可忽略 */
					}
				}

				audioEl.src = url;
				audioEl.volume = isMuted ? 0 : volume;
				playPromise = audioEl.play();
				try {
					await playPromise;
				} catch (e) {
					// AbortError: play() 被新的 pause()/load() 中断，属正常行为
					if (e instanceof DOMException && e.name === 'AbortError') return;
					throw e;
				} finally {
					playPromise = null;
				}
			}

			// 异步加载歌词
			if (!compact) {
				getLyric(track.id).then((l) => {
					lyrics = l;
					currentLyricIndex = -1;
				});
			}
		} catch (e) {
			error = e instanceof Error ? e.message : '播放失败';
		} finally {
			isLoadingUrl = false;
		}
	}

	function togglePlay() {
		if (!audioEl || !currentTrack) return;
		if (isPlaying) {
			audioEl.pause();
			// isPlaying 由 onpause 事件设为 false
		} else if (!audioEl.src) {
			// 首次播放：尚未加载音频源，先加载当前曲目
			playTrack(currentIndex);
		} else {
			// 已有源，直接播放
			playPromise = audioEl.play();
			playPromise.catch((e) => {
				if (e instanceof DOMException && e.name === 'AbortError') return;
				error = e instanceof Error ? e.message : '播放失败';
			});
			// isPlaying 由 onplay 事件设为 true
		}
	}

	function next() {
		if (trackList.length <= 1) return;
		playTrack((currentIndex + 1) % trackList.length);
	}

	function prev() {
		if (trackList.length <= 1) return;
		playTrack((currentIndex - 1 + trackList.length) % trackList.length);
	}

	// ── 进度条交互 ──
	function onProgressClick(e: MouseEvent) {
		if (!progressBar || !audioEl || !duration) return;
		const rect = progressBar.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		audioEl.currentTime = ratio * duration;
		currentTime = audioEl.currentTime;
		// 手动触发歌词更新
		updateLyricScroll();
	}

	// ── 音量控制 ──
	function toggleMute() {
		isMuted = !isMuted;
		if (audioEl) audioEl.volume = isMuted ? 0 : volume;
	}

	function onVolumeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const parsed = parseFloat(target.value);
		// 防止 NaN 导致后续逻辑异常
		if (isNaN(parsed)) return;
		volume = parsed;
		isMuted = volume === 0;
		if (audioEl) audioEl.volume = volume;
	}

	// ── 音频事件 ──
	function onTimeUpdate() {
		if (!audioEl) return;
		currentTime = audioEl.currentTime;
		updateLyricScroll();
	}

	/** 更新歌词高亮和滚动 */
	function updateLyricScroll() {
		if (lyrics.length === 0) return;
		const idx = findLyricIndex(currentTime);
		if (idx !== currentLyricIndex) {
			currentLyricIndex = idx;
		}
		// 滚动歌词——仅滚动容器内部，不影响浏览器滚动条
		if (lyricContainer && currentLyricIndex >= 0) {
			const el = lyricContainer.querySelector(
				`[data-lyric-idx="${currentLyricIndex}"]`
			) as HTMLElement;
			if (el) {
				const containerRect = lyricContainer.getBoundingClientRect();
				const elRect = el.getBoundingClientRect();
				// 计算元素相对于容器中心的偏移
				const elCenterY = elRect.top + elRect.height / 2;
				const containerCenterY = containerRect.top + containerRect.height / 2;
				const scrollOffset = elCenterY - containerCenterY;
				const targetScrollTop = lyricContainer.scrollTop + scrollOffset;
				lyricContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
			}
		}
	}

	/** 二分查找当前歌词行索引 */
	function findLyricIndex(time: number): number {
		if (lyrics.length === 0) return -1;
		let lo = 0;
		let hi = lyrics.length - 1;
		// 如果时间小于第一行，返回 -1
		if (time < lyrics[0].time) return -1;
		while (lo <= hi) {
			const mid = (lo + hi) >> 1;
			const next = lyrics[mid + 1];
			if (time >= lyrics[mid].time && (!next || time < next.time)) {
				return mid;
			}
			if (time < lyrics[mid].time) {
				hi = mid - 1;
			} else {
				lo = mid + 1;
			}
		}
		return lyrics.length - 1;
	}

	function onLoadedMetadata() {
		if (audioEl) duration = audioEl.duration;
	}

	function onEnded() {
		isPlaying = false;
		if (trackList.length > 1) {
			next();
		}
	}

	// ── 工具函数 ──
	function formatTime(s: number): string {
		if (!s || isNaN(s)) return '0:00';
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	function selectTrack(index: number) {
		playTrack(index);
	}
</script>

<div class="music-player" class:compact>
	<!-- 加载状态 -->
	{#if isLoading}
		<div class="mp-loading">
			<span class="mp-spin-wrapper"><Loader size="24" /></span>
			<span>加载中…</span>
		</div>
	{:else if error && trackList.length === 0}
		<div class="mp-error">
			<X size="18" />
			<span>{error}</span>
		</div>
	{:else if currentTrack}
		<!-- 歌词面板（在播放器上方向上展开） -->
		{#if showLyrics && lyrics.length > 0}
			<div class="mp-lyrics" transition:slide={{ duration: 250 }}>
				<div class="mp-lyrics-header">
					<span>歌词</span>
					<button
						class="mp-btn mp-btn-sm"
						onclick={() => (showLyrics = false)}
						aria-label="关闭歌词"
					>
						<X size="14" />
					</button>
				</div>
				<div class="mp-lyrics-body" bind:this={lyricContainer}>
					{#each lyrics as line, i (i)}
						<p class="mp-lyric-line" class:active={i === currentLyricIndex} data-lyric-idx={i}>
							{line.text || '♪'}
						</p>
					{/each}
				</div>
			</div>
		{/if}

		<!-- 主播放器区域 -->
		<div class="mp-main">
			<!-- 封面 -->
			<div class="mp-cover" class:playing={isPlaying}>
				{#if currentTrack.cover}
					<img src={currentTrack.cover} alt={currentTrack.name} loading="lazy" />
				{:else}
					<div class="mp-cover-fallback"><Music size="28" /></div>
				{/if}
				<button
					class="mp-play-overlay"
					onclick={togglePlay}
					aria-label={isPlaying ? '暂停' : '播放'}
				>
					{#if isLoadingUrl}
						<span class="mp-spin-wrapper"><Loader size="22" /></span>
					{:else if isPlaying}
						<Pause size="22" fill="currentColor" />
					{:else}
						<Play size="22" fill="currentColor" />
					{/if}
				</button>
			</div>

			<!-- 信息 & 控制 -->
			<div class="mp-info">
				<div class="mp-track-meta">
					<h4 class="mp-title">{currentTrack.name}</h4>
					<span class="mp-artist">{currentTrack.artist}</span>
					{#if playlistName && trackList.length > 1}
						<span class="mp-playlist-tag"
							>{playlistName} · {currentIndex + 1}/{trackList.length}</span
						>
					{/if}
				</div>

				{#if compact}
					<!-- 精简模式：进度条 + 控制按钮水平排列 -->
					<div class="mp-compact-row">
						<div class="mp-progress-row">
							<span class="mp-time-current">{formatTime(currentTime)}</span>
							<div
								class="mp-progress"
								bind:this={progressBar}
								onclick={onProgressClick}
								onkeydown={(e) => {
									if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
										if (!audioEl || !duration) return;
										const step = duration * 0.05;
										audioEl.currentTime =
											e.key === 'ArrowLeft'
												? Math.max(0, currentTime - step)
												: Math.min(duration, currentTime + step);
										currentTime = audioEl.currentTime;
										updateLyricScroll();
									}
								}}
								role="slider"
								aria-label="播放进度"
								aria-valuemin="0"
								aria-valuemax="100"
								aria-valuenow={Math.round(progress)}
								tabindex="0"
							>
								<div class="mp-progress-track">
									<div class="mp-progress-fill" style={`width:${progress}%`}>
										<div class="mp-progress-handle"></div>
									</div>
								</div>
							</div>
							<span class="mp-time-duration">{formatTime(duration)}</span>
						</div>
						<div class="mp-controls">
							<div class="mp-controls-left">
								{#if trackList.length > 1}
									<button class="mp-btn" onclick={prev} aria-label="上一首">
										<SkipBack size="16" fill="currentColor" />
									</button>
								{/if}
								<button
									class="mp-btn mp-btn-play"
									onclick={togglePlay}
									aria-label={isPlaying ? '暂停' : '播放'}
								>
									{#if isLoadingUrl}
										<span class="mp-spin-wrapper"><Loader size="18" /></span>
									{:else if isPlaying}
										<Pause size="18" fill="currentColor" />
									{:else}
										<Play size="18" fill="currentColor" />
									{/if}
								</button>
								{#if trackList.length > 1}
									<button class="mp-btn" onclick={next} aria-label="下一首">
										<SkipForward size="16" fill="currentColor" />
									</button>
								{/if}
							</div>
							{#if trackList.length > 1}
								<div class="mp-controls-right">
									<button
										class="mp-btn mp-btn-sm"
										class:active={showPlaylist}
										onclick={() => (_playlistExpanded = !_playlistExpanded)}
										aria-label="播放列表"
									>
										<ListMusic size="15" />
									</button>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<!-- 标准模式 -->
					<div class="mp-progress-row">
						<span class="mp-time-current">{formatTime(currentTime)}</span>
						<div
							class="mp-progress"
							bind:this={progressBar}
							onclick={onProgressClick}
							onkeydown={(e) => {
								if (!audioEl || !duration) return;
								if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
									e.preventDefault();
									const step = duration * 0.05;
									audioEl.currentTime =
										e.key === 'ArrowLeft'
											? Math.max(0, currentTime - step)
											: Math.min(duration, currentTime + step);
									currentTime = audioEl.currentTime;
									updateLyricScroll();
								} else if (e.key === 'Home') {
									e.preventDefault();
									audioEl.currentTime = 0;
									currentTime = 0;
									updateLyricScroll();
								} else if (e.key === 'End') {
									e.preventDefault();
									audioEl.currentTime = duration;
									currentTime = duration;
									updateLyricScroll();
								}
							}}
							role="slider"
							aria-label="播放进度"
							aria-valuemin="0"
							aria-valuemax={duration || 0}
							aria-valuenow={Math.round(currentTime)}
							aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
							tabindex="0"
						>
							<div class="mp-progress-track">
								<div class="mp-progress-fill" style={`width:${progress}%`}>
									<div class="mp-progress-handle"></div>
								</div>
							</div>
						</div>
						<span class="mp-time-duration">{formatTime(duration)}</span>
					</div>

					<div class="mp-controls">
						<div class="mp-controls-left">
							{#if trackList.length > 1}
								<button
									class="mp-btn"
									onclick={prev}
									aria-label="上一首"
									disabled={currentIndex === 0 && trackList.length <= 1}
								>
									<SkipBack size="18" fill="currentColor" />
								</button>
							{/if}
							<button
								class="mp-btn mp-btn-play"
								onclick={togglePlay}
								aria-label={isPlaying ? '暂停' : '播放'}
							>
								{#if isLoadingUrl}
									<span class="mp-spin-wrapper"><Loader size="20" /></span>
								{:else if isPlaying}
									<Pause size="20" fill="currentColor" />
								{:else}
									<Play size="20" fill="currentColor" />
								{/if}
							</button>
							{#if trackList.length > 1}
								<button class="mp-btn" onclick={next} aria-label="下一首">
									<SkipForward size="18" fill="currentColor" />
								</button>
							{/if}
						</div>
						<div class="mp-controls-right">
							<div class="mp-volume">
								<button
									class="mp-btn mp-btn-sm"
									onclick={toggleMute}
									aria-label={isMuted ? '取消静音' : '静音'}
								>
									{#if isMuted || volume === 0}
										<VolumeX size="16" />
									{:else}
										<Volume2 size="16" />
									{/if}
								</button>
								<input
									class="mp-volume-slider"
									type="range"
									min="0"
									max="1"
									step="0.05"
									value={volume}
									oninput={onVolumeChange}
									aria-label="音量"
									aria-valuemin="0"
									aria-valuemax="1"
									aria-valuenow={volume}
								/>
							</div>
							{#if trackList.length > 1}
								<button
									class="mp-btn mp-btn-sm"
									class:active={showPlaylist}
									onclick={() => (_playlistExpanded = !_playlistExpanded)}
									aria-label="播放列表"
								>
									<ListMusic size="16" />
								</button>
							{/if}
							{#if lyrics.length > 0}
								<button
									class="mp-btn mp-btn-sm"
									class:active={showLyrics}
									onclick={() => (showLyrics = !showLyrics)}
									aria-label="歌词"
								>
									词
								</button>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- 错误提示 -->
		{#if error}
			<div class="mp-error-bar" transition:fade={{ duration: 200 }}>
				<X size="14" />
				<span>{error}</span>
			</div>
		{/if}

		<!-- 播放列表 -->
		{#if showPlaylist && trackList.length > 1}
			<div class="mp-playlist" transition:slide={{ duration: 250 }}>
				<div class="mp-playlist-header">
					<span>播放列表 ({trackList.length})</span>
					<button
						class="mp-btn mp-btn-sm"
						onclick={() => (_playlistExpanded = false)}
						aria-label="关闭列表"
					>
						<X size="14" />
					</button>
				</div>
				<ul class="mp-playlist-body">
					{#each trackList as track, i (track.id)}
						<li class="mp-playlist-item" class:active={i === currentIndex}>
							<button class="mp-pl-btn" onclick={() => selectTrack(i)}>
								<span class="mp-pl-index">{i === currentIndex && isPlaying ? '▶' : i + 1}</span>
								<div class="mp-pl-info">
									<span class="mp-pl-name">{track.name}</span>
									<span class="mp-pl-artist">{track.artist}</span>
								</div>
								<span class="mp-pl-duration">{formatTime(track.duration / 1000)}</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- 隐藏的 audio 元素 -->
		<audio
			bind:this={audioEl}
			ontimeupdate={onTimeUpdate}
			onloadedmetadata={onLoadedMetadata}
			onended={onEnded}
			onplay={() => (isPlaying = true)}
			onpause={() => (isPlaying = false)}
			preload="metadata"
		></audio>
	{/if}
</div>

<style>
	.music-player {
		margin: 1.6rem 0;
		border: var(--pixel-border);
		border-radius: var(--r-md);
		background: var(--surface);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
		/* 隔离 prose 排版样式，防止 .prose 的全局 p/ul/li/img 规则泄漏进来 */
		isolation: isolate;
	}

	/* ── 重置 prose 全局样式污染 ── */
	/* +page.svelte 的 .prose :global(img) 编译后特异度 (0,2,1)，
	   需用 .mp-cover .mp-cover-img 等更具体的选择器 (0,3,1) 才能覆盖 */
	:global(.prose .music-player .mp-cover img) {
		margin: 0;
		padding: 0;
		border-radius: 0;
		box-shadow: none;
		max-width: none;
		height: 100%;
		width: 100%;
		object-fit: cover;
		display: block;
	}
	:global(.prose .music-player .mp-lyric-line) {
		margin: 0;
		padding: 0.35rem 0;
		color: var(--muted);
	}
	:global(.prose .music-player .mp-playlist-body) {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	:global(.prose .music-player .mp-playlist-item) {
		margin: 0;
		padding: 0;
		color: inherit;
	}
	:global(.prose .music-player .mp-title) {
		margin: 0;
		padding: 0;
		font-family: inherit;
		font-weight: 600;
		font-size: 13px;
		color: var(--text);
		line-height: 1.4;
	}
	:global(.prose .music-player .mp-pl-btn) {
		color: inherit;
		text-decoration: none;
	}

	/* ── 加载 / 错误状态 ── */
	.mp-loading,
	.mp-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem;
		justify-content: center;
		color: var(--muted);
		font-size: 13px;
	}

	.mp-error {
		color: var(--accent);
	}

	/* 加载动画 */
	.mp-spin-wrapper {
		display: inline-flex;
		animation: mp-spin 0.8s linear infinite;
	}

	.mp-spin-wrapper :global(svg) {
		animation: mp-spin 0.8s linear infinite;
	}

	@keyframes mp-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* ── 主播放区域 ── */
	.mp-main {
		display: flex;
		gap: 1rem;
		padding: 1rem;
	}

	/* ── 精简模式 ── */
	.compact .mp-main {
		padding: 0.5rem 0.7rem;
		gap: 0.6rem;
		align-items: center;
	}

	.compact .mp-cover {
		width: 44px;
		height: 44px;
		border-radius: var(--r-sm);
	}

	.compact .mp-info {
		gap: 0.15rem;
		justify-content: center;
	}

	/* 精简模式：进度条和按钮水平排列 */
	.mp-compact-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mp-compact-row .mp-progress-row {
		flex: 1;
		min-width: 0;
	}

	.mp-compact-row .mp-controls {
		flex-shrink: 0;
	}

	.mp-compact-row .mp-controls-left {
		flex: 0;
		gap: 0.15rem;
	}

	.compact .mp-title {
		font-size: 12px;
	}

	.compact .mp-artist {
		font-size: 10px;
	}

	.compact .mp-playlist-tag {
		font-size: 9px;
		padding: 0 4px;
	}

	/* 精简模式隐藏音量 */
	.compact .mp-volume,
	.compact .mp-volume-slider {
		display: none;
	}

	/* 精简模式进度条更细 */
	.compact .mp-progress {
		padding: 0.2rem 0;
	}

	.compact .mp-progress-track {
		height: 3px;
	}

	.compact .mp-progress-handle {
		width: 8px;
		height: 8px;
		right: -4px;
	}

	.compact .mp-time-current,
	.compact .mp-time-duration {
		font-size: 10px;
		min-width: 2rem;
	}

	/* 精简模式按钮更小 */
	.compact .mp-btn-play {
		width: 30px;
		height: 30px;
	}

	.compact .mp-btn-sm {
		padding: 0.15rem;
	}

	.compact .mp-controls {
		gap: 0.3rem;
	}

	.compact .mp-controls-left {
		gap: 0.15rem;
	}

	/* 封面 */
	.mp-cover {
		position: relative;
		flex-shrink: 0;
		width: 88px;
		height: 88px;
		border-radius: var(--r-sm);
		overflow: hidden;
		background: var(--accent-soft);
	}

	.mp-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.mp-cover-fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		color: var(--accent);
	}

	.mp-play-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.35);
		color: var(--on-accent);
		border: none;
		cursor: pointer;
		opacity: 1;
		transition: opacity 0.2s var(--ease);
	}

	.mp-cover.playing .mp-play-overlay {
		opacity: 0;
	}

	.mp-cover.playing:hover .mp-play-overlay {
		opacity: 1;
	}

	/* 信息 & 控制 */
	.mp-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.4rem;
	}

	.mp-track-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.5rem;
	}

	.mp-title {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.mp-artist {
		font-size: 12px;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.mp-playlist-tag {
		font-size: 10px;
		font-family: var(--font-mono);
		color: var(--accent);
		background: var(--accent-soft);
		padding: 1px 6px;
		border-radius: var(--r-sm);
		white-space: nowrap;
	}

	/* 进度条 + 时间（同一行） */
	.mp-progress-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mp-time-current,
	.mp-time-duration {
		flex-shrink: 0;
		font-size: 10px;
		font-family: var(--font-mono);
		color: var(--muted);
		min-width: 2.5rem;
		text-align: center;
	}

	.mp-progress {
		flex: 1;
		cursor: pointer;
		padding: 0.35rem 0;
	}

	.mp-progress-track {
		height: 4px;
		border-radius: var(--r-sm);
		background: var(--border-l);
		overflow: visible;
	}

	.mp-progress-fill {
		position: relative;
		height: 100%;
		border-radius: var(--r-sm);
		background: var(--accent);
		transition: width 0.1s linear;
	}

	.mp-progress-handle {
		position: absolute;
		right: -5px;
		top: 50%;
		transform: translateY(-50%);
		width: 10px;
		height: 10px;
		border-radius: var(--r-sm);
		background: var(--accent);
		box-shadow: var(--shadow-sm);
		opacity: 0;
		transition: opacity 0.2s var(--ease);
	}

	.mp-progress:hover .mp-progress-handle {
		opacity: 1;
	}

	/* 控制按钮 */
	.mp-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mp-controls-left {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
		justify-content: center;
	}

	.mp-controls-right {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.mp-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: none;
		color: var(--muted);
		cursor: pointer;
		padding: 0.3rem;
		border-radius: var(--r-sm);
		transition:
			color 0.15s var(--ease),
			background 0.15s var(--ease);
		flex-shrink: 0;
	}

	.mp-btn:hover {
		color: var(--text);
		background: var(--accent-soft);
	}

	.mp-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.mp-btn.active {
		color: var(--accent);
	}

	.mp-btn-sm {
		padding: 0.2rem;
	}

	.mp-btn-play {
		width: 36px;
		height: 36px;
		border-radius: var(--r-sm);
		background: var(--accent);
		color: var(--on-accent);
	}

	.mp-btn-play:hover {
		background: var(--accent);
		color: var(--on-accent);
		opacity: 0.9;
	}

	/* 音量 */
	.mp-volume {
		display: flex;
		align-items: center;
		gap: 0.15rem;
	}

	.mp-volume-slider {
		width: 60px;
		height: 4px;
		-webkit-appearance: none;
		appearance: none;
		background: var(--border-l);
		border-radius: var(--r-sm);
		outline: none;
		cursor: pointer;
	}

	.mp-volume-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 10px;
		height: 10px;
		border-radius: var(--r-sm);
		background: var(--accent);
		cursor: pointer;
	}

	.mp-volume-slider::-moz-range-thumb {
		width: 10px;
		height: 10px;
		border: none;
		border-radius: var(--r-sm);
		background: var(--accent);
		cursor: pointer;
	}

	/* 错误提示条 */
	.mp-error-bar {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 1rem;
		font-size: 11px;
		color: var(--accent);
		background: var(--accent-soft);
		border-top: 1px solid var(--border-l);
	}

	/* ── 歌词面板（在播放器上方） ── */
	.mp-lyrics {
		border-bottom: 1px solid var(--border-l);
	}

	.mp-lyrics-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		font-size: 12px;
		font-weight: 600;
		color: var(--muted);
		border-bottom: 1px solid var(--border-l);
	}

	.mp-lyrics-body {
		max-height: 240px;
		overflow-y: auto;
		padding: 0 1rem;
		scroll-behavior: smooth;
		/* 阻止滚动事件冒泡到浏览器窗口 */
		overscroll-behavior: contain;
		mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
	}
	/* 首行和末行添加额外间距，让它们也能滚动到中间 */
	.mp-lyrics-body::before,
	.mp-lyrics-body::after {
		content: '';
		display: block;
		height: 100px;
	}

	.mp-lyric-line {
		margin: 0;
		padding: 0.5rem 0;
		font-size: 12px;
		text-align: center;
		color: var(--muted);
		transition:
			color 0.3s var(--ease),
			transform 0.3s var(--ease);
		line-height: 1.6;
	}

	.mp-lyric-line.active {
		color: var(--accent);
		font-weight: 600;
		transform: scale(1.05);
	}

	/* ── 播放列表 ── */
	.mp-playlist {
		border-top: 1px solid var(--border-l);
	}

	.mp-playlist-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		font-size: 12px;
		font-weight: 600;
		color: var(--muted);
		border-bottom: 1px solid var(--border-l);
	}

	.mp-playlist-body {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 280px;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.mp-playlist-item {
		transition: background 0.15s var(--ease);
	}

	.mp-pl-btn {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		padding: 0.45rem 1rem;
		border: none;
		background: none;
		cursor: pointer;
		text-align: left;
		font: inherit;
		color: inherit;
		transition: background 0.15s var(--ease);
	}

	.mp-playlist-item:hover {
		background: var(--accent-soft);
	}

	.mp-playlist-item.active {
		background: var(--accent-soft);
	}

	.mp-pl-index {
		flex-shrink: 0;
		width: 1.5rem;
		text-align: center;
		font-size: 11px;
		font-family: var(--font-mono);
		color: var(--muted);
	}

	.mp-playlist-item.active .mp-pl-index {
		color: var(--accent);
	}

	.mp-pl-info {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.mp-pl-name {
		font-size: 12px;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.mp-playlist-item.active .mp-pl-name {
		color: var(--accent);
		font-weight: 600;
	}

	.mp-pl-artist {
		font-size: 10px;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.mp-pl-duration {
		flex-shrink: 0;
		font-size: 10px;
		font-family: var(--font-mono);
		color: var(--muted);
	}

	/* ── 响应式：移动端布局 ── */
	@media (max-width: 680px) {
		.mp-main {
			flex-direction: column;
			align-items: center;
			gap: 0.75rem;
			padding: 0.9rem;
			text-align: center;
		}

		/* 封面居中放大 */
		.mp-cover {
			width: 120px;
			height: 120px;
		}

		/* 信息区铺满宽度 */
		.mp-info {
			width: 100%;
			gap: 0.55rem;
		}

		/* 标题/歌手居中 */
		.mp-track-meta {
			justify-content: center;
			flex-direction: column;
			align-items: center;
		}
		.compact .mp-track-meta {
			flex-direction: row;
			justify-content: start;
		}

		.mp-title {
			font-size: 0.95rem;
		}

		.mp-artist {
			font-size: 11px;
		}

		/* 隐藏音量滑块和按钮 */
		.mp-volume,
		.mp-volume-slider {
			display: none;
		}

		/* 控制区全部居中 */
		.mp-controls {
			justify-content: center;
		}

		.mp-controls-left {
			flex: 0;
		}

		.mp-controls-right {
			position: absolute;
			flex: 0;
			right: 1rem;
		}

		/* 按钮增大触控区域 */
		.mp-btn {
			padding: 0.45rem;
		}

		.mp-btn-sm {
			padding: 0.35rem;
		}

		.mp-btn-play {
			width: 44px;
			height: 44px;
		}

		/* 歌词面板高度限制 */
		.mp-lyrics-body {
			max-height: 200px;
		}
		.mp-lyrics-body::before,
		.mp-lyrics-body::after {
			height: 80px;
		}

		/* 播放列表高度限制 */
		.mp-playlist-body {
			max-height: 240px;
		}

		/* ── 精简模式移动端：保持横排，不切换为列布局 ── */
		.compact .mp-main {
			flex-direction: row;
			align-items: center;
			text-align: left;
			gap: 0.5rem;
			padding: 0.45rem 0.6rem;
		}

		.compact .mp-cover {
			width: 38px;
			height: 38px;
		}

		.compact .mp-info {
			width: auto;
			flex: 1;
			gap: 0.15rem;
		}

		.compact .mp-title {
			font-size: 12px;
		}

		.compact .mp-artist {
			font-size: 10px;
		}

		.compact .mp-playlist-tag {
			display: none;
		}

		.compact .mp-progress-row {
			gap: 0.3rem;
		}

		.compact .mp-time-current,
		.compact .mp-time-duration {
			min-width: 1.7rem;
			font-size: 9px;
		}

		.compact .mp-controls {
			justify-content: flex-end;
			gap: 0.15rem;
		}

		.compact .mp-controls-left {
			flex: 0;
			gap: 0.1rem;
		}

		.compact .mp-controls-right {
			position: static;
		}

		.compact .mp-btn {
			padding: 0.25rem;
		}

		.compact .mp-btn-play {
			width: 30px;
			height: 30px;
		}

		.compact .mp-btn-sm {
			padding: 0.2rem;
		}

		.compact .mp-playlist-body {
			max-height: 200px;
		}
	}
</style>
