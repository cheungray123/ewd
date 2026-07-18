<script lang="ts">
	import { reveal, type RevealOptions } from '$lib/actions/reveal';
	import type { Snippet } from 'svelte';

	type Variant = 'up' | 'fade' | 'left' | 'right' | 'scale';

	interface Props {
		/** 入场动画方向 */
		variant?: Variant;
		/** 延迟（秒），用于 stagger 效果 */
		delay?: number;
		/** 是否只触发一次，默认 true */
		once?: boolean;
		/** 额外 class */
		class?: string;
		/** 标签名，默认 div */
		tag?: string;
		children: Snippet;
	}

	let {
		variant = 'up',
		delay = 0,
		once = true,
		class: className = '',
		tag = 'div',
		children
	}: Props = $props();

	// CSS 变体类名映射
	const variantClass: Record<Variant, string> = {
		up: '',
		fade: 'reveal--fade',
		left: 'reveal--left',
		right: 'reveal--right',
		scale: 'reveal--scale'
	};

	const opts = $derived<RevealOptions>({ delay, once });
</script>

<svelte:element this={tag} class="reveal {variantClass[variant]} {className}" use:reveal={opts}>
	{@render children()}
</svelte:element>
