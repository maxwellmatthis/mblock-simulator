<script lang="ts">
	import FilePicker from '$lib/file-picker.svelte';
	import Button from '$lib/button.svelte';
	import Target from '$lib/target.svelte';
	import Entity from '$lib/entity.svelte';
	import { onMount } from 'svelte';
	import type { Sprite } from 'pixi.js';
	import { SimulationView } from '../pixi/simulation-view';
	import { LANRouter } from '../mblock/global';
	import {
		createEntity,
		getTargets,
		type ParsedTarget,
		type TargetJSON,
	} from '../mblock/target';
	import type { Std } from '../mblock/targets/std';
	import type { SimulationSprite } from 'src/pixi/simulation-sprite';

	/* file picker */
	let showFilePicker = false;
	let targets: ParsedTarget[] = [];
	const SAVED_TARGETS_STORAGE_KEY = 'savedTargets';
	onMount(() => {
		const savedTargets = window.localStorage.getItem(SAVED_TARGETS_STORAGE_KEY);
		if (savedTargets === null) showFilePicker = true;
		else targets = JSON.parse(savedTargets);
	});

	/* targets and entities */
	type Entities = {
		[index: symbol]: { name: string; entity: Std; pixi?: SimulationSprite };
	};
	let entities: Entities = {};
	$: entitiesEntries = Reflect.ownKeys(entities).map((key) => {
		return {
			key: key as symbol,
			value: entities[key as symbol],
		};
	});

	const stop = (key: symbol) => {
		entities[key].entity.stopAll();
	};
	const stopAll = () => {
		for (const key of Reflect.ownKeys(entities)) {
			stop(key as symbol);
		}
	};
	const delete_ = (key: symbol) => {
		stop(key);
		entities[key].pixi?.destroy();
		delete entities[key];
		entities = entities;
	};
	const deleteAll = () => {
		for (const key of Reflect.ownKeys(entities)) {
			delete_(key as symbol);
		}
	};
	const lanRouter = new LANRouter();
	const create = async (target: TargetJSON, name: string, amount: number) => {
		if (amount < 1) amount = 1;
		const newEntities: Entities = {};
		for (let i = 1; i <= amount; i++) {
			const newEntity = await createEntity(target, lanRouter);
			let sprite: SimulationSprite | undefined = undefined;
			if (newEntity.physicsEnabled) {
				sprite = pixiApp.addSprite(newEntity.targetId);
				const { moveXY, rotate, getRotation } = sprite.translationFunctions();
				newEntity.registerSpriteMovement(moveXY, rotate, getRotation);
			}
			newEntities[Symbol()] = {
				name: `${name}${amount > 1 ? '-' + i : ''}`,
				entity: newEntity,
				pixi: sprite,
			};
			newEntity.activate();
		}
		entities = Object.assign(entities, newEntities);
	};

	/* canvas */
	let canvas: HTMLCanvasElement;
	let pixiApp: SimulationView;
	onMount(() => (pixiApp = new SimulationView(canvas)));
</script>

{#if showFilePicker}
	<FilePicker
		on:choose={({ detail: { project } }) => {
			deleteAll();
			targets = getTargets(project);
			window.localStorage.setItem(
				SAVED_TARGETS_STORAGE_KEY,
				JSON.stringify(targets)
			);
			showFilePicker = false;
		}}
		on:hide={() => (showFilePicker = false)}
	/>
{/if}

<main>
	<div id="sidebar">
		<div id="controls">
			<Button on:click={() => (showFilePicker = true)}>Load mBlock File</Button>
			<Button backgroundColor={'yellow'} on:click={stopAll}>Stop All</Button>
			<Button backgroundColor={'red'} on:click={deleteAll}
				>Delete All Entities</Button
			>
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
			{#if entitiesEntries.length > 0}
				{#each entitiesEntries as { key, value: { name, entity } } (key)}
					<Entity {name} {entity} on:delete={() => delete_(key)} />
				{/each}
			{:else}
				<span>No Entities have been created yet.</span>
			{/if}
		</div>
	</div>
	<canvas
		id="simulation"
		bind:this={canvas}
		on:wheel|preventDefault={(ev) =>
			pixiApp.camera.scaleBy(ev.offsetX, ev.offsetY, ev.deltaY)}
		on:mousedown={(ev) => pixiApp.camera.startDrag(ev.offsetX, ev.offsetY)}
		on:mousemove={(ev) => pixiApp.camera.drag(ev.offsetX, ev.offsetY)}
		on:mouseup={() => pixiApp.camera.stopDrag()}
	/>
</main>

<style lang="scss" scoped>
	main {
		display: grid;
		grid-template-columns: 410px auto;
		div#sidebar {
			padding: var(--padding);
			height: 100vh;
			overflow-y: auto;
			> div {
				padding-bottom: var(--padding);
			}
			div#controls {
				display: flex;
				justify-content: space-between;
			}
		}
		canvas#simulation {
			width: 100%;
			height: 100vh;
		}
	}
</style>
