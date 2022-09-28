<script lang="ts">
	import ButtonIcon from './button-icon.svelte';
	import { createEventDispatcher } from 'svelte';
	import { ZipReader, BlobReader, BlobWriter } from '@zip.js/zip.js';
	const dispatch = createEventDispatcher();

	let dropClass = '';
	const dragStart = () => {
		dropClass = 'dragover';
	};
	const dragEnd = () => {
		dropClass = '';
	};

	const choose = async (e: Event) => {
		const event = e as InputEvent | DragEvent;
		if (event.dataTransfer) {
			const entries = new ZipReader(
				new BlobReader(event.dataTransfer.files[0])
			).getEntries();
			for (const entry of await entries) {
				if (entry.filename === 'project.json' && entry.getData) {
					dispatch('choose', {
						project: JSON.parse(
							await (await entry.getData(new BlobWriter())).text()
						),
					});
				}
			}
		}
	};
</script>

<div id="file-picker-background" on:click={() => dispatch('hide')}>
	<div
		id="drop-zone"
		class={dropClass}
		on:drag|preventDefault
		on:dragstart|preventDefault
		on:dragover|preventDefault={dragStart}
		on:dragenter|preventDefault={dragStart}
		on:dragleave|preventDefault={dragEnd}
		on:dragend|preventDefault={dragEnd}
		on:drop|preventDefault={choose}
		on:click|stopPropagation
	>
		<div id="button">
			<ButtonIcon
				src="/icons/x.svg"
				alt="X"
				on:click={() => dispatch('hide')}
			/>
		</div>
		<div id="input-container">
			<div id="input">
				<h2>Load mBlock File</h2>
				<label for="file">Choose an mBlock file or drop it here.</label>
				<div>
					<input type="file" accept=".mblock" on:change={choose} />
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss" scoped>
	div#file-picker-background {
		z-index: 999;
		background-color: hsla(0, 0%, 0%, 0.4);
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		#drop-zone {
			width: 40vw;
			min-width: 320px;
			height: 200px;
			border-radius: 0.4em;
			background-color: var(--primary);
			padding: var(--padding);
			display: flex;
			flex-direction: column;
			div#button {
				display: flex;
				justify-content: right;
			}
			div#input-container {
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				div#input {
					text-align: center;
					margin-bottom: 1em;
					div {
						display: flex;
						justify-content: center;
					}
				}
			}
		}
	}
</style>
