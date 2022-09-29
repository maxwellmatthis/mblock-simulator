<script lang="ts">
	import Button from '../button.svelte';
	import type { ArgDefs, ArgType, Std } from 'src/mblock/targets/std';
	import type { ProcedureArgs } from 'src/mblock/context';

	export let entity: Std;
	let procedures: { procCode: string; argDefs: ArgDefs }[] = [];
	(async () => (procedures = await entity.getProcedures()))();

	let customArguments: ProcedureArgs = {};
	const setArg = (name: string, type: ArgType, e: Event) => {
		let value: string | number | boolean = (e.target as HTMLInputElement).value;
		// (type: "string") is the default and therefore already covered.
		if (type === 'number') value = Number(value);
		else if (type === 'boolean') value = (value === 'true');
		customArguments = Object.assign({}, customArguments, { [name]: value });
	};
</script>

<div>
	<h3>Procedures</h3>
	{#if procedures.length > 0}
		{#each procedures as { procCode, argDefs } (procCode)}
			<div class="procedure">
				<Button
					fillParentWidth={true}
					on:click={() => entity.callProcedure(procCode, customArguments)}
				>
					<div class="play">
						<img src="/icons/play.svg" alt="Play" />
						<div class="play-info">
							<span>{procCode}</span>
							{#if argDefs}
								{#each argDefs as { name, type } (name)}
									<div class="argument">
										<label for={name}>{name}</label>
										<input
											id={name}
											type="text"
											placeholder={name}
											on:click|stopPropagation
											on:input={(e) => setArg(name, type, e)}
											on:change={(e) => setArg(name, type, e)}
										/>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				</Button>
			</div>
		{/each}
	{:else}
		<p>This entity doesn't have any procedures.</p>
	{/if}
</div>

<style lang="scss" scoped>
	div div.procedure {
		padding-bottom: var(--padding);
		div.play {
			display: flex;
			gap: 6px;
			div.play-info {
				flex-grow: 1;
				text-align: left;
				div.argument {
					display: grid;
					grid-template-columns: 40% 60%;
					input {
						width: 100%;
						border: none;
					}
				}
			}
		}
	}
</style>
