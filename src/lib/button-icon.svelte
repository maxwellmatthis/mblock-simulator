<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let src: string;
	export let alt: string;
</script>

<button on:click={() => dispatch('click')}>
	<img {src} {alt} />
</button>

<style lang="scss" scoped>
	button {
		background: none;
		border: none;
		margin: 0;
		padding: 0;
		cursor: pointer;
	}
</style>
