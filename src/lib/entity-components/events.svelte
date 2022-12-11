<script lang="ts">
	import Button from '../button.svelte';
	import type { Std } from '../../mblock/targets/std';

	export let entity: Std;
	let events = entity.getEvents();
</script>

<div>
	<h3>Events</h3>
	{#if events.length > 0}
		{#each events as { opcode, option }}
			<div class="event">
				<Button
					fillParentWidth={true}
					on:click={() => entity.runHatBlocks(opcode, option)}
				>
					<div class="play">
						<img src="/icons/play.svg" alt="Play" />
						<span>
							{opcode}
							{#if option}
								{typeof option === 'string'
									? '"'
									: ''}{option}{typeof option === 'string' ? '"' : ''}
							{/if}
						</span>
					</div>
				</Button>
			</div>
		{/each}
	{:else}
		<p>This entity doesn't have any event activated code.</p>
	{/if}
</div>

<style lang="scss" scoped>
	div div.event {
		padding-bottom: var(--padding);
		div.play {
			display: flex;
			gap: 6px;
		}
	}
</style>
