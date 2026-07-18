<script lang="ts">
	// 氛围装饰层：固定背景星点
	const dots = Array(12).fill(0);
</script>

<div class="ambient" aria-hidden="true">
	{#each dots as _, i (i)}
		<span class="dot"></span>
	{/each}
</div>
