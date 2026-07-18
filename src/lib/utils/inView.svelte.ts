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

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					state.current = entry.isIntersecting;
				}
			},
			{
				rootMargin: options?.margin ?? '0px',
				threshold:
					typeof options?.amount === 'number' ? options.amount : options?.amount === 'all' ? 1 : 0
			}
		);

		observer.observe(target);
		return () => observer.disconnect();
	});

	return state;
}
