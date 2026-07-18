<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { FileText, Smile, Image as ImageIcon, Upload, X } from 'svelte-lucide';
	import { emojiGroups } from '$lib/data/emoji';
	import { miniGFM } from '$lib/utils/miniGFM';
	import {
		submitComment,
		saveUser,
		uploadImage,
		getGravatarUrl,
		type CommentConfig,
		type CommentUser
	} from '$lib/utils/comment';
	import { md5 } from '$lib/utils/md5';

	const MAX_IMAGE_COUNT = 3;
	const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

	function parseMarkdown(text: string): string {
		if (!text.trim()) return '';
		return miniGFM(text);
	}

	interface Props {
		url: string;
		parentId?: string;
		title?: string;
		rootId?: string;
		config: CommentConfig;
		userInfo?: CommentUser | null;
		compact?: boolean;
		onSubmitted?: () => void;
		onCancel?: () => void;
	}

	let {
		url,
		parentId,
		rootId,
		title = '',
		config,
		userInfo,
		compact = false,
		onSubmitted,
		onCancel
	}: Props = $props();

	const formId = `cm-${Math.random().toString(36).slice(2, 8)}`;

	let nick = $state('');
	let mail = $state('');
	let link = $state('');
	let content = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);
	let showSuccess = $state(false);
	let userEditedFields = $state(false);

	$effect(() => {
		if (userEditedFields) return;
		nick = userInfo?.nick || '';
		mail = userInfo?.mail || '';
		link = userInfo?.link || '';
	});

	let lastFields = $state('');
	$effect(() => {
		const current = `${nick}|${mail}|${link}|${content}`;
		if (error && lastFields && current !== lastFields) error = null;
		lastFields = current;
	});

	let showMdPreview = $state(false);
	let mdPreviewHtml = $state('');
	$effect(() => {
		if (!showMdPreview || !content.trim()) {
			mdPreviewHtml = '';
			return;
		}
		mdPreviewHtml = parseMarkdown(content);
	});

	let showEmojiPanel = $state(false);
	let activeEmojiTab = $state(0);

	let uploadedImages = $state<Array<{ file?: File; url?: string; preview: string }>>([]);
	let imageUploadError = $state<string | null>(null);
	let showImagePanel = $state(false);
	let imageInputMode = $state<'local' | 'url'>('local');
	let imageUrlInput = $state('');

	let captchaToken = $state<string | null>(null);
	let captchaWidgetId: string | null = null;
	let captchaLoaded = $state(false);

	const gravatarCdn = $derived(config?.GRAVATAR_CDN || 'weavatar.com');
	// 实时根据输入框邮箱计算头像，未输入时回退到已保存用户数据
	const avatarStyle = $derived.by(() => {
		const email = mail.trim();
		if (email) {
			const hash = md5(email.toLowerCase());
			return `background-image:url(${getGravatarUrl(hash, gravatarCdn, 40)});background-size:cover`;
		}
		if (userInfo?.mailMd5) {
			return `background-image:url(${getGravatarUrl(userInfo.mailMd5, gravatarCdn, 40)});background-size:cover`;
		}
		return '';
	});
	const displayedFields = $derived(config.DISPLAYED_FIELDS || ['nick', 'mail', 'link']);
	const requiredFields = $derived(config.REQUIRED_FIELDS || ['nick', 'mail']);

	const defaultLimits: Record<string, number> = { nick: 30, mail: 100, link: 255, comment: 5000 };
	const limits = $derived.by(() => {
		const raw = config.LIMIT_LENGTH;
		if (!raw) return defaultLimits;
		try {
			const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
			if (typeof parsed === 'number') return { ...defaultLimits, comment: parsed };
			if (typeof parsed === 'object' && parsed !== null) return { ...defaultLimits, ...parsed };
		} catch {
			const n = parseInt(String(raw), 10);
			if (!Number.isNaN(n)) return { ...defaultLimits, comment: n };
		}
		return defaultLimits;
	});

	const isAdmin = $derived(config.IS_ADMIN === true || config.IS_ADMIN === 'true');
	let adminOverride = $state(false);
	let showUserInfo = $state(false);
	const effectiveAdmin = $derived(isAdmin && !adminOverride);
	const showUserFields = $derived(!effectiveAdmin && (showUserInfo || !userInfo));

	function handleClickOutside(event: MouseEvent) {
		const t = event.target as HTMLElement;
		if (!t.closest('.c-emoji-panel') && !t.closest('.c-emoji-trigger')) showEmojiPanel = false;
		if (!t.closest('.c-img-panel') && !t.closest('.c-img-trigger')) showImagePanel = false;
	}

	function loadTurnstile() {
		if (!browser || captchaLoaded) return;
		const siteKey = config.TURNSTILE_SITE_KEY;
		if (!siteKey) return;
		if (window.turnstile) {
			renderTurnstile();
			return;
		}
		// 检查是否已有其他实例加载了脚本
		const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
		if (existing) {
			existing.addEventListener('load', () => renderTurnstile());
			return;
		}
		const script = document.createElement('script');
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
		script.onload = () => renderTurnstile();
		document.head.appendChild(script);
	}
	function renderTurnstile() {
		if (!browser) return;
		const ts = window.turnstile;
		if (!ts) return;
		const siteKey = config.TURNSTILE_SITE_KEY;
		if (!siteKey) return;
		const container = document.getElementById(`${formId}-captcha`);
		if (!container) return;
		captchaWidgetId = ts.render(container, {
			sitekey: siteKey,
			callback: (token: string) => {
				captchaToken = token;
			}
		});
		captchaLoaded = true;
	}
	function loadGeetest() {
		if (!browser || captchaLoaded) return;
		const captchaId = config.GEETEST_CAPTCHA_ID;
		if (!captchaId) return;
		if (window.initGeetest4) {
			initGeetest();
			return;
		}
		const existing = document.querySelector('script[src*="static.geetest.com/v4/gt4.js"]');
		if (existing) {
			existing.addEventListener('load', () => initGeetest());
			return;
		}
		const script = document.createElement('script');
		script.src = 'https://static.geetest.com/v4/gt4.js';
		script.onload = () => initGeetest();
		document.head.appendChild(script);
	}
	function initGeetest() {
		if (!browser) return;
		const captchaId = config.GEETEST_CAPTCHA_ID;
		if (!captchaId) return;
		const initGt4 = window.initGeetest4;
		if (!initGt4) return;
		initGt4({ captchaId, product: 'bind' }, (captcha: unknown) => {
			const c = captcha as {
				onReady: (cb: () => void) => void;
				onSuccess: (cb: () => void) => void;
				getValidate: () => {
					lot_number: string;
					captcha_output: string;
					pass_token: string;
				} | null;
			};
			c.onReady(() => {
				captchaLoaded = true;
			});
			c.onSuccess(() => {
				const r = c.getValidate();
				if (r) captchaToken = `${r.lot_number}|${r.captcha_output}|${r.pass_token}`;
			});
		});
	}
	function initCaptcha() {
		if (!browser) return;
		const p = config.CAPTCHA_PROVIDER;
		if (p === 'Turnstile') loadTurnstile();
		else if (p === 'Geetest') loadGeetest();
	}
	function resetCaptcha() {
		if (!browser) return;
		if (config.CAPTCHA_PROVIDER === 'Turnstile' && captchaWidgetId)
			window.turnstile?.reset(captchaWidgetId);
		captchaToken = null;
	}

	function toggleEmojiPanel() {
		showEmojiPanel = !showEmojiPanel;
	}
	function switchEmojiTab(i: number) {
		activeEmojiTab = i;
	}
	function insertEmoji(emoji: string) {
		content += emoji;
	}

	function handleImageSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;
		if (uploadedImages.length + files.length > MAX_IMAGE_COUNT) {
			imageUploadError = '最多上传 3 张图片';
			return;
		}
		imageUploadError = null;
		Array.from(files).forEach((file) => {
			if (!file.type.startsWith('image/')) {
				imageUploadError = '只能上传图片文件';
				return;
			}
			if (file.size > MAX_IMAGE_SIZE_BYTES) {
				imageUploadError = `图片大小不能超过 ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`;
				return;
			}
			const reader = new FileReader();
			reader.onload = (e) => {
				uploadedImages = [...uploadedImages, { file, preview: e.target?.result as string }];
			};
			reader.readAsDataURL(file);
		});
		input.value = '';
	}
	function addImageUrl() {
		const u = imageUrlInput.trim();
		if (!u) return;
		if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(u)) {
			imageUploadError = '请输入有效的图片链接';
			return;
		}
		const imageCdn = config.IMAGE_CDN;
		if (imageCdn) {
			try {
				const imgUrl = new URL(u);
				const allowed = imageCdn.split(',').map((d) => d.trim());
				const ok = allowed.some((d) => imgUrl.hostname === d || imgUrl.hostname.endsWith('.' + d));
				if (!ok) {
					imageUploadError = '图片链接域名不在允许范围内';
					return;
				}
			} catch {
				imageUploadError = '请输入有效的图片链接';
				return;
			}
		}
		if (uploadedImages.length >= MAX_IMAGE_COUNT) {
			imageUploadError = '最多上传 3 张图片';
			return;
		}
		imageUploadError = null;
		uploadedImages = [...uploadedImages, { url: u, preview: u }];
		imageUrlInput = '';
		showImagePanel = false;
	}
	function toggleImagePanel() {
		showImagePanel = !showImagePanel;
	}
	function removeImage(i: number) {
		uploadedImages = uploadedImages.filter((_, idx) => idx !== i);
	}

	async function handleSubmit() {
		if (submitting || !browser) return;
		if (!effectiveAdmin) {
			if (requiredFields.includes('nick') && !nick.trim()) {
				error = '请输入昵称';
				return;
			}
			if (requiredFields.includes('mail') && !mail.trim()) {
				error = '请输入邮箱';
				return;
			}
		}
		if (!content.trim() && uploadedImages.length === 0) {
			error = '请输入评论内容或上传图片';
			return;
		}
		if (nick.length > limits.nick) {
			error = `昵称最长 ${limits.nick} 个字符`;
			return;
		}
		if (mail.length > limits.mail) {
			error = `邮箱最长 ${limits.mail} 个字符`;
			return;
		}
		if (link.length > limits.link) {
			error = `链接最长 ${limits.link} 个字符`;
			return;
		}
		if (content.length > limits.comment) {
			error = `评论内容最长 ${limits.comment} 个字符`;
			return;
		}
		if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
			error = '请输入有效的邮箱地址';
			return;
		}
		if (config.CAPTCHA_PROVIDER && !captchaToken) {
			error = '请完成验证码验证';
			return;
		}

		submitting = true;
		error = null;
		try {
			if (!effectiveAdmin && (nick || mail || link)) saveUser({ nick, mail, link });
			let commentHtml = content ? parseMarkdown(content) : '';
			if (uploadedImages.length > 0) {
				const uploadPromises = uploadedImages.map(async (img) => {
					if (img.url) return img.url;
					if (img.file) {
						const result = await uploadImage(img.file);
						return result ? result.url : null;
					}
					return null;
				});
				const urls = await Promise.all(uploadPromises);
				const failed = urls.filter((u) => u === null).length;
				if (failed > 0) throw new Error(`${failed} 张图片上传失败`);
				const escapeHtml = (s: string) =>
					s
						.replace(/&/g, '&amp;')
						.replace(/"/g, '&quot;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;');
				commentHtml += urls
					.filter((u): u is string => u !== null)
					.map(
						(u) =>
							`<img src="${escapeHtml(u)}" alt="uploaded image" style="max-width:100%;border-radius: 0;margin-top:8px;">`
					)
					.join('');
			}
			await submitComment({
				url,
				href: window.location.href,
				ua: navigator.userAgent,
				nick: effectiveAdmin ? config.SITE_NAME || config.BLOGGER_NAME || '博主' : nick || '匿名',
				mail: effectiveAdmin ? '' : mail,
				link: effectiveAdmin ? '' : link,
				content: commentHtml,
				comment: commentHtml,
				pid: parentId,
				rid: rootId,
				title,
				turnstileToken: captchaToken || undefined
			});
			content = '';
			uploadedImages = [];
			error = null;
			resetCaptcha();
			showSuccess = true;
			userEditedFields = false;
			setTimeout(() => {
				showSuccess = false;
				onSubmitted?.();
			}, 800);
		} catch (e) {
			error = e instanceof Error ? e.message : '评论发送失败';
		} finally {
			submitting = false;
		}
	}

	onMount(() => {
		initCaptcha();
	});
	onDestroy(() => {
		if (!browser) return;
		if (config.CAPTCHA_PROVIDER === 'Turnstile' && captchaWidgetId)
			window.turnstile?.remove?.(captchaWidgetId);
	});
</script>

<svelte:window onclick={handleClickOutside} />

<form
	class="c-form"
	class:compact
	onsubmit={(e) => {
		e.preventDefault();
		handleSubmit();
	}}
>
	<span class="ava" style={avatarStyle}></span>
	<div class="field">
		{#if showUserFields}
			<div class="c-fields cols-3">
				{#if displayedFields.includes('nick')}
					<div class="c-field">
						<label class="sr-only" for="cm-name-{formId}">姓名</label>
						<input
							class="c-input"
							id="cm-name-{formId}"
							type="text"
							bind:value={nick}
							placeholder={requiredFields.includes('nick') ? '姓名 *' : '姓名'}
							autocomplete="name"
							maxlength={limits.nick}
							oninput={() => (userEditedFields = true)}
							disabled={submitting}
						/>
					</div>
				{/if}
				{#if displayedFields.includes('mail')}
					<div class="c-field">
						<label class="sr-only" for="cm-mail-{formId}">邮箱</label>
						<input
							class="c-input"
							id="cm-mail-{formId}"
							type="email"
							bind:value={mail}
							placeholder={requiredFields.includes('mail') ? '邮箱 *' : '邮箱'}
							autocomplete="email"
							maxlength={limits.mail}
							oninput={() => (userEditedFields = true)}
							disabled={submitting}
						/>
					</div>
				{/if}
				{#if displayedFields.includes('link')}
					<div class="c-field">
						<label class="sr-only" for="cm-url-{formId}">网址</label>
						<input
							class="c-input"
							id="cm-url-{formId}"
							type="url"
							bind:value={link}
							placeholder="网址"
							autocomplete="url"
							maxlength={limits.link}
							oninput={() => (userEditedFields = true)}
							disabled={submitting}
						/>
					</div>
				{/if}
			</div>
		{:else if isAdmin && !adminOverride}
			<div class="c-admin-bar">
				以「{config.SITE_NAME || config.BLOGGER_NAME || '博主'}」身份评论
				<button
					class="c-switch"
					type="button"
					onclick={() => {
						adminOverride = true;
						showUserInfo = true;
						userEditedFields = true;
					}}>切换</button
				>
			</div>
		{:else}
			<button class="c-user-toggle" type="button" onclick={() => (showUserInfo = true)}>
				以「{userInfo?.nick || '匿名'}」身份评论 <span class="change">切换</span>
			</button>
		{/if}

		<div class="c-input-area">
			<textarea
				bind:value={content}
				placeholder={config.COMMENT_PLACEHOLDER || '说点什么吧…'}
				maxlength={limits.comment}
				rows={compact ? 3 : 4}
				disabled={submitting}
				aria-label={compact ? '回复' : '发表评论'}></textarea>
			<span class="char-count" class:limit={content.length > limits.comment * 0.9}
				>{content.length}/{limits.comment}</span
			>
		</div>

		<div class="c-toolbar">
			<button
				type="button"
				class="c-tool"
				class:active={showMdPreview}
				title="Markdown 预览"
				aria-label="Markdown 预览"
				onclick={() => (showMdPreview = !showMdPreview)}
			>
				<FileText size="16" strokeWidth="1.6" />
			</button>
			{#if config.SHOW_EMOTION !== 'false'}
				<button
					class="c-tool c-emoji-trigger"
					class:active={showEmojiPanel}
					onclick={toggleEmojiPanel}
					disabled={submitting}
					title="插入表情"
					type="button"
					aria-label="插入表情"
				>
					<Smile size="16" strokeWidth="1.6" />
				</button>
			{/if}
			{#if config.SHOW_IMAGE !== 'false'}
				<button
					class="c-tool c-img-trigger"
					class:active={showImagePanel}
					onclick={toggleImagePanel}
					disabled={submitting || uploadedImages.length >= MAX_IMAGE_COUNT}
					title="上传图片"
					type="button"
					aria-label="上传图片"
				>
					<ImageIcon size="16" strokeWidth="1.6" />
					{#if uploadedImages.length > 0}<span class="cnt"
							>{uploadedImages.length}/{MAX_IMAGE_COUNT}</span
						>{/if}
				</button>
			{/if}

			{#if showEmojiPanel}
				<div class="c-emoji-panel">
					<div class="c-panel-tabs">
						{#each emojiGroups as group, i (group.name)}
							<button
								class:active={i === activeEmojiTab}
								onclick={() => switchEmojiTab(i)}
								type="button">{group.name}</button
							>
						{/each}
					</div>
					<div class="c-emoji-grid">
						{#each emojiGroups[activeEmojiTab].emojis as emoji (emoji)}
							<button
								class="c-emoji-item"
								type="button"
								onclick={() => insertEmoji(emoji)}
								disabled={submitting}>{emoji}</button
							>
						{/each}
					</div>
				</div>
			{/if}

			{#if showImagePanel}
				<div class="c-img-panel">
					{#if config.SHOW_LOCAL_UPLOAD === 'true'}
						<div class="c-panel-tabs">
							<button
								class:active={imageInputMode === 'local'}
								onclick={() => (imageInputMode = 'local')}
								type="button">本地上传</button
							>
							<button
								class:active={imageInputMode === 'url'}
								onclick={() => (imageInputMode = 'url')}
								type="button">远程图片</button
							>
						</div>
					{/if}
					<div class="c-panel-body">
						{#if config.SHOW_LOCAL_UPLOAD === 'true' && imageInputMode === 'local'}
							<label class="c-upload-area">
								<Upload size="22" strokeWidth="1.6" />
								<span>点击或拖拽上传</span>
								<span class="hint">支持 JPG、PNG、GIF，最大 5MB</span>
								<input
									type="file"
									accept="image/*"
									multiple
									onchange={handleImageSelect}
									disabled={submitting || uploadedImages.length >= MAX_IMAGE_COUNT}
								/>
							</label>
						{:else}
							<div class="c-url-input">
								<input
									type="url"
									bind:value={imageUrlInput}
									placeholder="输入图片链接地址"
									disabled={submitting}
									aria-label="远程图片链接"
								/>
								<button
									class="c-add-url"
									onclick={addImageUrl}
									disabled={submitting || !imageUrlInput.trim()}
									type="button">添加</button
								>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		{#if imageUploadError}
			<div class="c-err c-img-err">
				<X size="12" strokeWidth="1.6" /><span>{imageUploadError}</span>
			</div>
		{/if}

		{#if uploadedImages.length > 0}
			<div class="c-img-previews">
				{#each uploadedImages as image, i (i)}
					<div class="c-img-prev">
						<img src={image.preview} alt="preview" loading="lazy" />
						<button
							class="c-img-rm"
							type="button"
							onclick={() => removeImage(i)}
							title="删除"
							aria-label="删除图片"><X size="11" strokeWidth="1.6" /></button
						>
					</div>
				{/each}
			</div>
		{/if}

		{#if showMdPreview}
			<div class="c-md-preview">
				{#if content.trim()}
					{#if mdPreviewHtml}
						<!-- eslint-disable svelte/no-at-html-tags -->
						{@html mdPreviewHtml}
					{:else}
						<p class="c-md-empty">解析中…</p>
					{/if}
				{:else}
					<p class="c-md-empty">输入 Markdown 内容后显示预览</p>
				{/if}
			</div>
		{/if}

		{#if error}
			<div class="c-err"><X size="13" strokeWidth="1.6" /><span>{error}</span></div>
		{/if}

		{#if config.CAPTCHA_PROVIDER === 'Turnstile' || config.CAPTCHA_PROVIDER === 'Geetest'}
			<div id="{formId}-captcha"></div>
		{/if}

		{#if showSuccess}
			<div class="c-ok">✓ 发送成功</div>
		{/if}

		<div class="actions">
			<span class="c-hint">{compact ? '邮箱不会公开' : '邮箱不会公开 · 网址可留空'}</span>
			<div class="acts-right">
				{#if compact && onCancel}
					<button class="btn cancel" type="button" onclick={onCancel} disabled={submitting}
						>取消</button
					>
				{/if}
				<button
					class="btn primary"
					type="submit"
					disabled={submitting || (!content.trim() && uploadedImages.length === 0)}
				>
					{#if submitting}<span class="cm-spin"></span> 发送中…{:else}{compact
							? '回复'
							: '发表评论'}{/if}
				</button>
			</div>
		</div>
	</div>
</form>

<style>
	.c-form {
		display: flex;
		gap: 0.9rem;
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		padding: 1rem;
		box-shadow: var(--shadow-sm);
		margin-bottom: 1.8rem;
		position: relative;
	}
	.c-form.compact {
		margin-top: 0.8rem;
		margin-bottom: 0;
	}
	.c-form .ava {
		width: 40px;
		height: 40px;
		border-radius: var(--r-sm);
		flex: 0 0 auto;
		background: var(--grad-ava-3);
	}
	.c-form .field {
		flex: 1;
		min-width: 0;
		position: relative;
	}
	.c-fields {
		display: grid;
		gap: 0.6rem;
		margin-bottom: 0.7rem;
	}
	.c-fields.cols-3 {
		grid-template-columns: repeat(3, 1fr);
	}
	.c-input {
		width: 100%;
		font-family: var(--font-body);
		font-size: 12px;
		color: var(--fg);
		background: var(--bg);
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		padding: 0.6rem 0.75rem;
		transition:
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.c-input::placeholder {
		color: var(--muted);
		opacity: 0.65;
	}
	.c-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.c-input-area {
		position: relative;
	}
	.c-form textarea {
		width: 100%;
		min-height: 64px;
		resize: vertical;
		font-family: var(--font-body);
		font-size: 13px;
		color: var(--fg);
		background: var(--bg);
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		padding: 0.7rem 0.85rem;
		line-height: 1.6;
		transition:
			border-color 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.c-form textarea::placeholder {
		color: var(--muted);
		opacity: 0.65;
	}
	.c-form textarea:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}
	.c-form.compact textarea {
		min-height: 48px;
	}
	.char-count {
		position: absolute;
		right: 0.5rem;
		bottom: 0.5rem;
		font-family: var(--font-mono);
		font-size: 9px;
		color: var(--muted);
		background: var(--surface);
		padding: 1px 5px;
		border-radius: var(--r-sm);
		pointer-events: none;
		opacity: 0.8;
		z-index: 1;
	}
	.char-count.limit {
		color: var(--accent);
	}

	.c-admin-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.7rem;
		background: var(--accent-soft);
		border-radius: var(--r-sm);
		font-size: 12px;
		color: var(--accent);
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	.c-switch {
		margin-left: auto;
		background: none;
		border: none;
		color: var(--accent);
		font-size: 12px;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		padding: 0;
	}
	.c-user-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.65rem;
		background: var(--bg);
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		font-size: 12px;
		color: var(--dim);
		cursor: pointer;
		transition:
			border-color 0.2s var(--ease),
			color 0.2s var(--ease);
		margin-bottom: 0.5rem;
	}
	.c-user-toggle:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.c-user-toggle .change {
		color: var(--accent);
		font-weight: 500;
	}

	.c-toolbar {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		margin-top: 0.4rem;
		position: relative;
	}
	.c-tool {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.45rem;
		font-size: 10px;
		color: var(--dim);
		background: var(--bg);
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		cursor: pointer;
		transition:
			border-color 0.2s var(--ease),
			color 0.2s var(--ease),
			background 0.2s var(--ease);
	}
	.c-tool:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.c-tool.active {
		background: var(--accent-soft);
		color: var(--accent);
		border-color: var(--accent);
	}
	.c-tool .cnt {
		font-size: 9px;
		background: var(--accent);
		color: var(--on-accent);
		padding: 1px 4px;
		border-radius: var(--r-sm);
	}

	.c-emoji-panel,
	.c-img-panel {
		position: absolute;
		left: 0;
		top: 100%;
		margin-top: 0.35rem;
		background: var(--surface);
		border: var(--pixel-border);
		border-radius: var(--r-md);
		box-shadow: var(--shadow-md);
		z-index: 100;
		overflow: hidden;
	}
	.c-emoji-panel {
		width: 300px;
	}
	.c-img-panel {
		width: 260px;
	}
	.c-panel-tabs {
		display: flex;
		gap: 2px;
		padding: 0.35rem;
		border-bottom: 1px solid var(--border-l);
		background: var(--bg);
	}
	.c-panel-tabs button {
		font-size: 10px;
		color: var(--dim);
		padding: 3px 8px;
		border-radius: var(--r-sm);
		cursor: pointer;
		transition:
			color 0.2s var(--ease),
			background 0.2s var(--ease);
		border: none;
		background: transparent;
	}
	.c-panel-tabs button:hover {
		color: var(--fg);
	}
	.c-panel-tabs button.active {
		background: var(--accent-soft);
		color: var(--accent);
	}
	.c-panel-body {
		padding: 0.65rem;
	}
	.c-upload-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 1rem;
		border: 2px dashed var(--border);
		border-radius: var(--r-sm);
		cursor: pointer;
		transition:
			border-color 0.2s var(--ease),
			color 0.2s var(--ease);
		color: var(--dim);
	}
	.c-upload-area:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
	.c-upload-area input {
		display: none;
	}
	.c-upload-area .hint {
		font-size: 9px;
		color: var(--muted);
	}
	.c-url-input {
		display: flex;
		gap: 0.25rem;
	}
	.c-url-input input {
		flex: 1;
		padding: 0.4rem;
		border: var(--pixel-border);
		border-radius: var(--r-sm);
		font-size: 12px;
		color: var(--fg);
		background: var(--bg);
	}
	.c-url-input input:focus {
		outline: none;
		border-color: var(--accent);
	}
	.c-add-url {
		padding: 0.4rem 0.55rem;
		background: var(--accent);
		color: var(--on-accent);
		border: none;
		border-radius: var(--r-sm);
		font-size: 12px;
		cursor: pointer;
		transition: background 0.2s var(--ease);
	}
	.c-add-url:hover:not(:disabled) {
		background: var(--accent-hover);
	}
	.c-add-url:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.c-emoji-grid {
		padding: 0.35rem;
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 2px;
		max-height: 180px;
		overflow-y: auto;
	}
	.c-emoji-item {
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		border-radius: var(--r-sm);
		cursor: pointer;
		transition:
			background 0.15s var(--ease),
			transform 0.15s var(--ease);
		border: none;
		background: none;
	}
	.c-emoji-item:hover {
		background: var(--accent-soft);
		transform: scale(1.15);
	}

	.c-img-previews {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.35rem;
		flex-wrap: wrap;
	}
	.c-img-prev {
		position: relative;
		width: 72px;
		height: 72px;
		border-radius: var(--r-sm);
		overflow: hidden;
		border: var(--pixel-border);
	}
	.c-img-prev img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.c-img-prev .c-img-rm {
		position: absolute;
		top: 3px;
		right: 3px;
		width: 18px;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: color-mix(in oklch, var(--bg) 65%, transparent);
		color: var(--on-accent);
		border: none;
		border-radius: 0;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.2s var(--ease);
	}
	.c-img-prev:hover .c-img-rm {
		opacity: 1;
	}

	.c-md-preview {
		margin-top: 0.5rem;
		padding: 0.65rem;
		max-height: 180px;
		overflow-y: auto;
		line-height: 1.7;
		color: var(--fg);
		font-size: 12px;
		background: var(--bg);
		border: var(--pixel-border);
		border-radius: var(--r-sm);
	}
	.c-md-preview :global(p) {
		margin: 0 0 0.4rem 0;
	}
	.c-md-preview :global(p:last-child) {
		margin-bottom: 0;
	}
	.c-md-preview :global(strong) {
		font-weight: 600;
	}
	.c-md-preview :global(em) {
		font-style: italic;
	}
	.c-md-preview :global(code) {
		padding: 2px 5px;
		background: var(--accent-soft);
		border-radius: var(--r-sm);
		font-family: var(--font-mono);
		font-size: 0.9em;
	}
	.c-md-preview :global(pre) {
		padding: 0.5rem;
		background: var(--bg);
		border-radius: var(--r-sm);
		overflow-x: auto;
		margin: 0.4rem 0;
	}
	.c-md-preview :global(pre code) {
		padding: 0;
		background: none;
	}
	.c-md-preview :global(blockquote) {
		margin: 0.4rem 0;
		padding-left: 0.65rem;
		border-left: 3px solid var(--accent);
		color: var(--dim);
	}
	.c-md-preview :global(a) {
		color: var(--accent);
		text-decoration: underline;
	}
	.c-md-preview :global(del) {
		text-decoration: line-through;
		color: var(--muted);
	}
	.c-md-empty {
		text-align: center;
		color: var(--muted);
		font-size: 12px;
		margin: 0;
	}

	.c-err {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.35rem 0.55rem;
		background: var(--accent-soft);
		border-radius: var(--r-sm);
		color: var(--accent);
		font-size: 11px;
		margin-top: 0.4rem;
		animation: c-shake 0.4s var(--ease);
	}
	.c-img-err {
		animation: none;
		margin-top: 0.3rem;
	}
	@keyframes c-shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-4px);
		}
		40% {
			transform: translateX(4px);
		}
		60% {
			transform: translateX(-3px);
		}
		80% {
			transform: translateX(2px);
		}
	}
	.c-ok {
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--ok);
		margin-top: 0.4rem;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.6rem;
		gap: 0.6rem;
	}
	.c-hint {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.02em;
		color: var(--muted);
	}
	.acts-right {
		display: flex;
		gap: 0.5rem;
	}
	/* 使用全局 .btn 样式，仅覆盖字体大小 */
	.c-form .btn {
		font-size: 10px;
		padding: 0.5rem 0.9rem;
	}
	.cm-spin {
		display: inline-block;
		width: 10px;
		height: 10px;
		border: 2px solid color-mix(in oklch, var(--fg) 30%, transparent);
		border-top-color: var(--on-accent);
		border-radius: 0;
		animation: c-spin 0.8s var(--ease) infinite;
		vertical-align: middle;
	}
	@keyframes c-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 680px) {
		.c-form {
			flex-direction: column;
			align-items: stretch;
		}
		.c-form .ava {
			align-self: center;
		}
		.c-fields.cols-3 {
			grid-template-columns: 1fr;
		}
		.c-emoji-panel {
			width: 260px;
		}
		.c-img-panel {
			width: 220px;
		}
	}
</style>
