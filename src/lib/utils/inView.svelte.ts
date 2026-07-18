/**
 * useInView — 原生 IntersectionObserver 实现的视口检测
 *
 * 用法：
 *   const inView = useInView(() => document.getElementById('target'), {
 *     margin: '-12% 0px -72% 0px',
 *     amount: 'some'
 *   });
 *   // 读取 inView.current 获取是否在视口中
 */

interface InViewOptions {
	margin?: string;
	amount?: number | 'some' | 'all';
}

interface InViewState {
	current: boolean;
}

/**
 * 使用 IntersectionObserver 检测元素是否在视口中
 * 返回一个 reactive 对象，通过 .current 读取状态
 */
export function useInView(
	getTarget: () => Element | null | undefined,
	options?: InViewOptions
): InViewState {
	const state: InViewState = $state({ current: false });

	$effect(() => {
		const target = getTarget();
		if (!target) return;

		// 计算 IntersectionObserver 的 threshold：
		// - number: 直接使用该比例 (0~1)
		// - 'all': 元素完全可见时触发 → threshold = 1
		// - 'some' / undefined: 任意像素可见即触发 → threshold = 0
		const amount = options?.amount;
		const threshold =
			typeof amount === 'number' ? amount : amount === 'all' ? 1 : 0;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					state.current = entry.isIntersecting;
				}
			},
			{
				rootMargin: options?.margin ?? '0px',
				threshold
			}
		);

		observer.observe(target);
		return () => observer.disconnect();
	});

	return state;
}
