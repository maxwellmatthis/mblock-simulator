<script lang="ts">
	import FilePicker from '$lib/file-picker.svelte';
	import Button from '$lib/button.svelte';
	import Target from '$lib/target.svelte';
	import Entity from '$lib/entity.svelte';
	import { onMount } from 'svelte';
	import { Application, Container, Sprite } from 'pixi.js';
	import { Camera, translationFunctions } from '../pixi/positioning';
	import { LANRouter } from '../mblock/global';
	import {
		createEntity,
		getTargets,
		type ParsedTarget,
		type TargetJSON,
	} from '../mblock/target';
	import type { Std } from '../mblock/targets/std';

	/* file picker */
	let showFilePicker = true;
	const lanRouter = new LANRouter();
	let targets: ParsedTarget[] = [];
	type Entities = {
		[index: symbol]: { name: string; entity: Std; pixi?: Sprite };
	};
	let entities: Entities = {};
	$: entitiesEntries = Reflect.ownKeys(entities).map((key) => {
		return {
			key: key as symbol,
			value: entities[key as symbol],
		};
	});

	/* targets and entities */
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
	const create = async (target: TargetJSON, name: string, amount: number) => {
		if (amount < 1) amount = 1;
		const newEntities: Entities = {};
		for (let i = 1; i <= amount; i++) {
			const newEntity = await createEntity(target, lanRouter);
			let sprite = undefined;
			if (newEntity.spriteImageName) {
				sprite = Sprite.from('/sprites/' + newEntity.spriteImageName);
				sprite.anchor.set(0.5);
				const { moveXY, rotate, getRotation } = translationFunctions(sprite);
				newEntity.registerSpriteMovement(moveXY, rotate, getRotation);
				map.addChild(sprite);
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
	let pixiApp: Application;
	let camera: Camera;
	const map = new Container();
	const resize = () => {
		pixiApp && pixiApp.renderer.resize(canvas.clientWidth, canvas.clientHeight);
	};
	onMount(() => {
		pixiApp = new Application({
			view: canvas,
			backgroundColor: 0xf5f5f5,
			antialias: true,
		});
		resize();
		window.addEventListener('resize', resize);
		pixiApp.stage.addChild(map);
		camera = new Camera(pixiApp, map);
		camera.focus(0, 0);
	});
</script>

{#if showFilePicker}
	<FilePicker
		on:choose={({ detail: { project } }) => {
			deleteAll();
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
			<Button backgroundColor={"yellow"} on:click={stopAll}>Stop All</Button>
			<Button backgroundColor={"red"} on:click={deleteAll}>Delete All Entities</Button>
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
			camera.scaleBy(ev.offsetX, ev.offsetY, ev.deltaY)}
		on:mousedown={(ev) => camera.startDrag(ev.offsetX, ev.offsetY)}
		on:mousemove={(ev) => camera.drag(ev.offsetX, ev.offsetY)}
		on:mouseup={() => camera.stopDrag()}
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
