<script lang="ts">
	import { useInView } from '$lib/utils/inView.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		/** 被跟踪的目标元素 ID */
		targetId: string;
		/** 链接 href */
		href: string;
		/** IntersectionObserver rootMargin */
		margin?: string;
		/** 额外 class */
		class?: string;
		/** 链接内容 */
		children: Snippet;
	}
	let {
		targetId,
		href,
		margin = '-12% 0px -72% 0px',
		class: className = '',
		children
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	// margin 在初始化时读取一次，运行期间不会变化
	const inView = useInView(() => document.getElementById(targetId), {
		margin,
		amount: 'some'
	});
</script>

<a {href} class={className} class:active={inView.current}>
	{@render children()}
</a>
