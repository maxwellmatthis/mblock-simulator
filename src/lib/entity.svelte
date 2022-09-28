<script lang="ts">
	import ButtonIcon from './button-icon.svelte';
	import Button from './button.svelte';
	import type { Std } from 'src/mblock/targets/std';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let name: string;
	export let entity: Std;
</script>

<div id="entity">
	<h2>
		<span>{name}</span>
		<ButtonIcon
			src="/icons/trash.svg"
			alt="del"
			on:click={() => dispatch('delete')}
		/>
	</h2>
	<div>
		<h3>Events</h3>
		{#each entity.getEvents() as { opcode, option }}
			<div class="event">
				<Button on:click={() => entity?.runHatBlocks(opcode, option)}>
					<div id="play-event">
						<img src="/icons/play.svg" alt="Play" />
						<span>
							{opcode}{#if option}({option}){/if}
						</span>
					</div>
				</Button>
			</div>
		{/each}
	</div>
</div>

<style lang="scss" scoped>
	div#entity {
		border-top: 1px solid var(--background-light);
		padding: var(--padding);
		h2 {
			display: flex;
			justify-content: space-between;
		}
		div.event {
			padding-bottom: var(--padding);
			div#play-event {
				display: flex;
				gap: 6px;
			}
		}
	}
</style>
