<script lang="ts">
	import { browser } from '$app/environment';

	let progress = $state(0);
	let rafId = 0;
	let reduceMotion = $state(false);

	$effect(() => {
		if (!browser) return;

		// 检测用户是否启用了减少动画偏好
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = mq.matches;
		const onChange = () => (reduceMotion = mq.matches);
		mq.addEventListener('change', onChange);

		const update = () => {
			cancelAnimationFrame(rafId);
			rafId = requestAnimationFrame(() => {
				const el = document.querySelector<HTMLElement>('.prose');
				if (!el) {
					progress = 0;
					return;
				}
				const rect = el.getBoundingClientRect();
				const total = rect.height - window.innerHeight;
				if (total <= 0) {
					progress = 1;
					return;
				}
				const scrolled = -rect.top;
				progress = Math.max(0, Math.min(1, scrolled / total));
			});
		};

		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update, { passive: true });
		update();

		return () => {
			mq.removeEventListener('change', onChange);
			cancelAnimationFrame(rafId);
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<div
	class="progress-bar"
	class:reduce-motion={reduceMotion}
	style="transform: scaleX({progress}); transform-origin: left;"
	aria-hidden="true"
></div>

<style>
	.progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--accent);
		z-index: 100;
		pointer-events: none;
		will-change: transform;
		/* 默认启用平滑过渡 */
		transition: transform 0.1s linear;
	}
	/* 用户设置了 prefers-reduced-motion 时，移除过渡，直接更新 */
	.progress-bar.reduce-motion {
		transition: none;
	}
</style>
