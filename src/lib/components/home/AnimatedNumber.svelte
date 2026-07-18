<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { pixelEase } from '$lib/utils/motion';
	import { untrack } from 'svelte';
	import { browser } from '$app/environment';

	interface Props {
		/** 原始数值字符串，支持 "12.3k" 或 "150" */
		value: string;
		/** 延迟启动时间（ms），用于 stagger 效果 */
		delay?: number;
	}

	let { value, delay = 0 }: Props = $props();

	// 解析目标数值：支持 "12.3k" 和 "150" 两种格式
	function parseTarget(raw: string): { target: number; useK: boolean } {
		const kMatch = raw.match(/^(\d[\d.]+)k$/i);
		if (kMatch) return { target: parseFloat(kMatch[1]) * 1000, useK: true };
		return { target: parseInt(raw, 10) || 0, useK: false };
	}

	const { target, useK } = untrack(() => parseTarget(value));

	// tweened store，初始值为 0，目标值为 target
	const tween = tweened(0, { duration: 1200, easing: pixelEase });

	// 用 $state 跟踪当前值
	let current = $state(0);
	let hasStarted = $state(false);

	// 订阅 tween 更新
	tween.subscribe((v) => {
		current = v;
	});

	// 在浏览器端启动动画
	$effect(() => {
		if (!browser) return;

		// 重置并启动动画
		tween.set(0);
		const timer = setTimeout(() => {
			tween.set(target);
		}, 400 + delay);

		return () => clearTimeout(timer);
	});

	// 格式化显示
	let display = $derived.by(() => {
		if (useK) {
			if (current < 1000) return String(Math.floor(current));
			return `${(current / 1000).toFixed(1)}k`;
		}
		return String(Math.floor(current));
	});
</script>

<span>{display}</span>
