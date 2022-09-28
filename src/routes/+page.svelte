<script lang="ts">
	import FilePicker from '$lib/file-picker.svelte';
	import Button from '$lib/button.svelte';
	import Target from '$lib/target.svelte';
	import Entity from '$lib/entity.svelte';
	import { onMount } from 'svelte';
	import { Application } from 'pixi.js';
	import { LANRouter } from '../mblock/global';
	import {
		createEntity,
		getTargets,
		type ParsedTarget,
		type TargetJSON,
	} from '../mblock/target';
	import type { Std } from '../mblock/targets/std';

	let showFilePicker = true;
	const lanRouter = new LANRouter();
	let targets: ParsedTarget[] = [];
	// TODO: add to simulation
	let entities: { name: string; entity: Std }[] = [];

	const stopAll = () => {
		for (const { entity } of Object.values(entities)) {
			entity.stopAll();
		}
	};

	const create = async (target: TargetJSON, name: string, amount: number) => {
		if (amount < 1) amount = 1;
		const newEntities = [];
		if (amount == 1) {
			newEntities.push({ name, entity: await createEntity(target, lanRouter) });
		} else {
			for (let i = 1; i <= amount; i++) {
				newEntities.push({
					name: `${name}-${i}`,
					entity: await createEntity(target, lanRouter),
				});
			}
		}
		entities = [...entities, ...newEntities];
	};

	let canvas: HTMLCanvasElement;
	let pixiApp: Application;
	const resize = () =>
		pixiApp && pixiApp.renderer.resize(canvas.clientWidth, canvas.clientHeight);
	onMount(() => {
		pixiApp = new Application({
			view: canvas,
			backgroundColor: 0xf5f5f5,
		});
		resize();
		window.addEventListener('resize', resize);
	});
</script>

{#if showFilePicker}
	<FilePicker
		on:choose={({ detail: { project } }) => {
			stopAll();
			entities = [];
			targets = getTargets(project);
			showFilePicker = false;
		}}
		on:hide={() => (showFilePicker = false)}
	/>
{/if}

<main>
	<div id="sidebar">
		<div id="controls">
			<Button on:click={() => (showFilePicker = true)}>Load mBlock File</Button>
			<Button on:click={stopAll}>Stop All</Button>
		</div>
		<div id="targets">
			<h1>Targets</h1>
			{#if targets.length > 0}
				{#each targets as target, i (i)}
					<Target
						{...target}
						on:create={({ detail: { target, name, amount } }) =>
							create(target, name, amount)}
					/>
				{/each}
			{:else}
				<span>No Targets available.</span>
			{/if}
		</div>
		<div id="entities">
			<h1>Entities</h1>
			{#if entities.length > 0}
				{#each entities as entity, i (i)}
					<Entity {...entity} />
				{/each}
			{:else}
				<span>No Entities have been created yet.</span>
			{/if}
		</div>
	</div>
	<canvas id="simulation" bind:this={canvas} />
</main>

<style lang="scss" scoped>
	main {
		display: grid;
		grid-template-columns: 400px auto;
		div#sidebar {
			padding: var(--padding);
			height: 100vh;
			overflow-y: auto;
			> div {
				padding-bottom: var(--padding);
			}
		}
		canvas#simulation {
			width: 100%;
			height: 100vh;
		}
	}
</style>
