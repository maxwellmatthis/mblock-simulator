<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let leftBorderRadius = true;
	export let fillParentWidth = false;
	export let backgroundColor: "primary" | "yellow" | "red" = "primary";
</script>

<button class={backgroundColor} class:leftBorderRadius class:fillParentWidth on:click={() => dispatch('click')}>
	<slot>Click me!</slot>
</button>

<style lang="scss" scoped>
	button {
		background-color: var(--primary);
		color: var(--text);
		padding: var(--padding);
		border: none;
		border-top-right-radius: var(--radius);
		border-bottom-right-radius: var(--radius);
		text-align: center;
		cursor: pointer;
	}

	button.yellow {
		background-color: rgba(255, 255, 0, 0.7);
	}

	button.red {
		background-color: rgba(255, 0, 0, 0.8);
	}
	
	button.leftBorderRadius {
		border-top-left-radius: var(--radius);
		border-bottom-left-radius: var(--radius);
	}

	button.fillParentWidth {
		width: 100%;
	}
</style>