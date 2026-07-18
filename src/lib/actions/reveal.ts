/**
 * CSS-first 滚动入场动画 Action
 *
 * 设计原理：
 * 1. CSS 类 .reveal 控制初始隐藏状态（opacity:0），在预渲染 HTML 中即生效 — 无闪动
 * 2. 此 action 仅在元素进入视口时添加 .in 类，触发 CSS transition
 * 3. 完全不依赖 JS 动画库，零开销、原生 IntersectionObserver
 * 4. will-change 仅在动画期间启用，动画结束后清除 — 避免 GPU 层泄漏
 *
 * 用法：
 *   <div class="reveal reveal--up" use:reveal>...</div>
 *   <div class="reveal" use:reveal={{ delay: 0.12 }}>...</div>  <!-- stagger -->
 *   <div class="reveal reveal--scale" use:reveal={{ once: false }}>...</div>
 */

export interface RevealOptions {
	/** 延迟（秒），用于 stagger 效果 */
	delay?: number;
	/** 是否只触发一次，默认 true */
	once?: boolean;
	/** 视口阈值，0-1 或 'some'/'all'，默认 0.05 */
	amount?: number | 'some' | 'all';
	/** rootMargin，默认 '0px 0px -4% 0px' */
	margin?: string;
}

export function reveal(node: HTMLElement, options?: RevealOptions) {
	const opts = { delay: 0, once: true, amount: 0.05, margin: '0px 0px -4% 0px', ...options };

	// 仅在浏览器环境执行
	if (typeof window === 'undefined') {
		return;
	}

	// 尊重 prefers-reduced-motion：直接显示
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		node.classList.add('in');
		return;
	}

	// 设置 stagger 延迟
	if (opts.delay > 0) {
		node.style.transitionDelay = `${opts.delay}s`;
	}

	// 标记是否已触发（防止 hydration 时立即触发）
	let hasTriggered = false;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting && !hasTriggered) {
					hasTriggered = true;
					// 动画开始前启用 will-change，让浏览器提前创建合成器层
					node.style.willChange = 'opacity, transform';
					node.classList.add('in');

					if (opts.once) {
						observer.unobserve(node);
					}

					// 动画结束后清除 will-change，释放 GPU 资源
					const cleanup = () => {
						node.style.willChange = '';
						node.removeEventListener('transitionend', cleanup);
					};
					node.addEventListener('transitionend', cleanup, { once: true });
					// 兜底：300ms 后强制清除（防止 transitionend 未触发）
					setTimeout(cleanup, 300);
				} else if (!opts.once && !entry.isIntersecting) {
					node.classList.remove('in');
				}
			}
		},
		{
			threshold: typeof opts.amount === 'number' ? opts.amount : 0,
			rootMargin: opts.margin
		}
	);

	// 延迟开始观察，避免 hydration 时立即触发
	requestAnimationFrame(() => {
		observer.observe(node);
	});

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
