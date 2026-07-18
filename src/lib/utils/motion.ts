/**
 * 全站动画配置（原生 Svelte 实现）
 *
 * 像素宇宙设计原则：
 * 1. 所有过渡使用 steps(4, end) — 像素级阶梯感
 * 2. 滚动入场用 CSS-first reveal action（src/lib/actions/reveal.ts）
 * 3. Svelte 原生 transition（svelte/transition）用于进出场动画
 * 4. Svelte 原生 animate:flip 用于列表 FLIP 布局动画
 * 5. 克制原则 — duration 200–600ms，不干扰阅读
 */

// ── 像素阶梯缓动 ──
// 对应 CSS var(--ease) = steps(4, end)
// 将动画分成 4 个离散步骤，营造 8-bit 阶梯感
const STEP_COUNT = 4;

/**
 * 像素阶梯缓动函数
 * 对应 CSS steps(4, end) — 用于 Svelte transition 的 easing参数
 */
export function pixelEase(t: number): number {
	return Math.min(Math.floor(t * STEP_COUNT) / STEP_COUNT, 1);
}

/**
 * 可配置阶梯数的缓动函数
 */
export function stepsEase(steps = 4) {
	return (t: number) => Math.min(Math.floor(t * steps) / steps, 1);
}

// 保持向后兼容的别名
export const easeOut = pixelEase;

// ── 通用 transition 参数（毫秒）──
export const t = {
	fast: { duration: 250, easing: pixelEase },
	normal: { duration: 400, easing: pixelEase },
	slow: { duration: 600, easing: pixelEase },
	exit: { duration: 200, easing: pixelEase }
} as const;

// ── 弹簧配置（用于 svelte/motion 的 spring()）──
// Svelte spring 使用 0-1 范围的 stiffness/damping
export const springs = {
	gentle: { stiffness: 0.12, damping: 0.7 },
	snappy: { stiffness: 0.25, damping: 0.5 },
	bouncy: { stiffness: 0.3, damping: 0.3 }
} as const;
