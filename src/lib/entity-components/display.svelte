<script lang="ts">
	import type { CyberPI } from '../../mblock/targets/cyberpi';

	let display: HTMLDivElement;
	let sticky = true;
	const scrolled = (
		e: UIEvent & {
			currentTarget: EventTarget & HTMLDivElement;
		}
	) => {
		sticky =
			display.scrollTop + display.clientHeight >= display.scrollHeight - 10;
	};

	let historyLines: string[] = [];
	let currentLine = '';
	const printFn = (str: string, newLine?: true) => {
		currentLine += str;
		if (newLine) {
			historyLines = [...historyLines, currentLine];
			currentLine = '';
		}
	};

	export let entity: CyberPI;
	entity.display.registerDisplay(printFn);
</script>

<div>
	<h3>Display</h3>
	<div id="display" class:sticky bind:this={display} on:scroll={scrolled}>
		{#each historyLines as line, i (i)}
			<span>{line}</span>
		{/each}
		<span>{currentLine}</span>
	</div>
</div>

<style lang="scss" scoped>
	div div#display {
		background-color: var(--background-light);
		border-radius: var(--radius);
		height: 150px;
		overflow-y: auto;
		overscroll-behavior-y: contain;
		scroll-snap-type: y mandatory;
		span {
			display: block;
		}
	}
	div div#display.sticky {
		> span:last-child {
			scroll-snap-align: start;
		}
	}
</style>
