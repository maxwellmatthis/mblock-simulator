<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import ButtonIcon from './button-icon.svelte';
	const dispatch = createEventDispatcher();

	export let maxHeightPx: number | null = null;

	const noop = () => {};
	export let isFullscreen = false;
	let fsContainer: HTMLDivElement;
	let fullscreenSupport = false;
	let exitFullscreen = noop;
	let requestFullscreen: (options?: FullscreenOptions) => void = noop;

	onMount(() => {
		fullscreenSupport =
			document.fullscreenEnabled ||
			// @ts-ignore
			document.webkitFullscreenEnabled ||
			// @ts-ignore
			document.mozFullScreenEnabled ||
			// @ts-ignore
			document.msFullscreenEnabled ||
			false;
		exitFullscreen = (
			document.exitFullscreen ||
			// @ts-ignore
			document.mozCancelFullScreen ||
			// @ts-ignore
			document.webkitExitFullscreen ||
			// @ts-ignore
			document.msExitFullscreen ||
			noop
		).bind(document);
		requestFullscreen = (
			fsContainer.requestFullscreen ||
			// @ts-ignore
			fsContainer.mozRequestFullScreen ||
			// @ts-ignore
			fsContainer.webkitRequestFullscreen ||
			// @ts-ignore
			fsContainer.msRequestFullscreen ||
			noop
		).bind(fsContainer);
		document.addEventListener('fullscreenchange', fullscreenChange);
		document.addEventListener('mozfullscreenchange', fullscreenChange);
		document.addEventListener('MSFullscreenChange', fullscreenChange);
		document.addEventListener('webkitfullscreenchange', fullscreenChange);
	});

	const fullscreenChange = () => {
		isFullscreen = !isFullscreen;
		dispatch('fullscreenChange', { isFull: isFullscreen });
	};

	const fsToggle = () => {
		if (!fullscreenSupport) return;
		if (isFullscreen) {
			exitFullscreen();
		} else {
			requestFullscreen({ navigationUI: 'hide' });
		}
	};
</script>

<div
	class="fs"
	class:isFullscreen
	bind:this={fsContainer}
	style={isFullscreen || maxHeightPx === null
		? ''
		: `max-height: ${maxHeightPx}px;`}
>
	<div id="header">
		<slot name="header" />
	</div>
	<div id="content" class:isFullscreen>
		<slot name="content" />
	</div>
	{#if fullscreenSupport}
		<div id="controls">
			{#if isFullscreen}
				<ButtonIcon on:click={fsToggle}
					><img src="/icons/minimize.svg" alt="Exit full screen" /></ButtonIcon
				>
			{:else}
				<ButtonIcon
					><img
						on:click={fsToggle}
						src="/icons/maximize.svg"
						alt="Show in full screen"
					/></ButtonIcon
				>
			{/if}
		</div>
	{/if}
</div>

<style>
	div.fs {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background-color: var(--background);
	}

	div#content {
		height: 100%;
		justify-self: stretch;
		overflow-x: auto;
	}

	div#controls {
		display: flex;
		justify-content: right;
		width: 100%;
		padding: var(--padding);
		background-color: var(--background-light);
	}
</style>
