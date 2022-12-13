<script lang="ts">
	import Button from '../button.svelte';
	import type {
		ArgType,
		ProcedureDefinition,
		Std,
	} from '../../mblock/targets/std';
	import type { ProcedureArgs } from '../../mblock/context';

	export let entity: Std;
	let procedures: ProcedureDefinition[] = [];
	let args: { [index: string]: ProcedureArgs } = {};
	(async () => {
		procedures = await entity.getProcedures();
		for (const { procCode, argDefs } of procedures) {
			args[procCode] = {};
			for (const { name, default_ } of argDefs) {
				args[procCode][name] = default_;
			}
		}
		args = args;
	})();

	const setArg = (procCode: string, name: string, type: ArgType, e: Event) => {
		const target = e.target as HTMLInputElement;
		let value: string | number | boolean = target.value;
		if (type === 'number') value = Number(value);
		else if (type === 'boolean') value = target.checked;
		args[procCode] = { ...args[procCode], [name]: value};
		args = args;
	};
</script>

<div>
	<h3>Procedures</h3>
	{#if procedures.length > 0}
		{#each procedures as { procCode, argDefs } (procCode)}
			<div class="procedure">
				<Button
					fillParentWidth={true}
					on:click={() => entity.callProcedure(procCode, args[procCode])}
				>
					<div class="play">
						<img src="/icons/play.svg" alt="Play" />
						<div class="play-info">
							<span>{procCode}</span>
							{#if argDefs}
								{#each argDefs as { name, type } (name)}
									<div class="argument">
										<label for={name}>{name}</label>
										<div>
											<input
												id={name}
												type={type === 'string'
													? 'text'
													: type === 'number'
													? 'number'
													: 'checkbox'}
												placeholder={name}
												class={type === 'boolean' ? '' : 'max-width'}
												on:click|stopPropagation
												on:input={(e) => setArg(procCode, name, type, e)}
												on:change={(e) => setArg(procCode, name, type, e)}
											/>
											{#if type === 'boolean'}
												<span> -> {args[procCode][name] || false}</span>
											{/if}
										</div>
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
				overflow: auto;
				div.argument {
					display: grid;
					grid-template-columns: 40% 60%;
					div {
						input {
							border: none;
						}
						input.max-width {
							width: 100%;
						}
					}
				}
			}
		}
	}
</style>
