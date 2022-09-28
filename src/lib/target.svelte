<script lang="ts">
	import Button from './button.svelte';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import type { TargetJSON } from 'src/mblock/target';

	export let target: TargetJSON;
	export let error: string | undefined = undefined;
	let name: string = target.name;
	let amount: number = 1;
</script>

<div id="target">
	<h2>{target.name}</h2>
	{#if error}
		<div id="error">
			<img src="icons/error.svg" alt="!" />
			<span>{error}</span>
		</div>
	{:else}
		<h3>Create</h3>
		<div id="create">
			<div id="create-labels">
				<label for="name">Name</label>
				<label for="amount">Amount</label>
			</div>
			<div id="create-form">
				<input id="name" type="text" placeholder="name" bind:value={name} />
				<input
					id="amount"
					type="number"
					placeholder="amount"
					bind:value={amount}
				/>
				<Button leftBorderRadius={false} on:click={() => dispatch('create', { target, name, amount })}
					>Create</Button
				>
			</div>
		</div>
	{/if}
</div>

<style lang="scss" scoped>
	div#target {
		border-top: 1px solid var(--background-light);
		padding: var(--padding);
		div#error {
			display: flex;
			gap: 6px;
		}
		div#create > div {
			display: grid;
			grid-template-columns: 40% 30% 30%;
			input#name {
				border: none;
				border-top-left-radius: var(--radius);
				border-bottom-left-radius: var(--radius);
			}
		}
	}
</style>
