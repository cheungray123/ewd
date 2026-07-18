import { browser } from '$app/environment';

/** 北京时区实时时钟，返回响应式状态 */
export function useClock() {
	let date = $state(new Date());

	function tick() {
		if (!browser) return;
		date = new Date();
	}

	$effect(() => {
		if (!browser) return;
		tick(); // 立即执行一次，避免首帧显示占位符
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	});

	return {
		get value() {
			return date.toLocaleTimeString('zh-CN', {
				timeZone: 'Asia/Shanghai',
				hour12: false
			});
		}
	};
}
