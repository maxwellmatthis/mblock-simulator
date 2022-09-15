<script lang="ts">
  import { parse } from "../mblock/parser";
  import project from "../test/embe/project.json";
  (async () => {
    const targets = parse(project);
    for (const target of targets) {
      target.activate();
    }
  })();
  import {Application, Sprite} from 'pixi.js';
  import { onMount } from 'svelte';
  import Fullscreen from '$lib/fullscreen.svelte';

  let canvas: HTMLCanvasElement;
  let pixiApp: Application;
  let isFullscreen: boolean;
  let canvasContainerWidth: number;
	let width: number;
	let height: number;

	const resize = () => {
		width = isFullscreen ? window.screen.availWidth : canvasContainerWidth;
		height = isFullscreen ? window.screen.availHeight : (width / 16) * 9;
		if (pixiApp) pixiApp.renderer.resize(width, height);
	};

  onMount(() => {
    pixiApp = new Application({
      view: canvas,
      backgroundColor: 0x000000,
      width,
      height,
    });
    resize();
    const sprite = Sprite.from('/sprites/hovercraft.png');
    pixiApp.stage.addChild(sprite);
  });
</script>

<main>
  <section bind:clientWidth={canvasContainerWidth}>
    <Fullscreen bind:isFullscreen on:fullscreenChange={resize}>
      <canvas slot="content" bind:this={canvas}></canvas>
    </Fullscreen>
  </section>
</main>
