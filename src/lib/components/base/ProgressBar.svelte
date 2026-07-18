<script lang="ts">
	import { browser } from '$app/environment';

	let progress = $state(0);
	let rafId = 0;

	$effect(() => {
		if (!browser) return;

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
			cancelAnimationFrame(rafId);
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<div
	class="progress-bar"
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
	}
</style>
