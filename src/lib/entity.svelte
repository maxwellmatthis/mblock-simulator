<script lang="ts">
	import Button from './button.svelte';
	import type { Std } from 'src/mblock/targets/std';

	export let name: string;
	export let entity: Std;
</script>

<div id="entity">
	<h2>{name}</h2>
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
		div.event {
			padding-bottom: var(--padding);
			div#play-event {
				display: flex;
				gap: 6px;
			}
		}
	}
</style>
