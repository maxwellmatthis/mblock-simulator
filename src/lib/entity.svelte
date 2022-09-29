<script lang="ts">
	import ButtonIcon from './button-icon.svelte';
	import Events from './entity-components/events.svelte';
	import Procedures from './entity-components/procedures.svelte';
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
	<Events {entity} />
	<Procedures {entity} />
</div>

<style lang="scss" scoped>
	div#entity {
		border-top: 1px solid var(--background-light);
		padding: var(--padding);
		h2 {
			display: flex;
			justify-content: space-between;
		}
	}
</style>
