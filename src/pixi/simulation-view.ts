import { Camera } from "./camera";
import { SimulationSprite } from "./simulation-sprite";
import { Application, Container } from "pixi.js";
import type { TargetId } from "../mblock/target";

export class SimulationView extends Application {
  private readonly map = new Container();
  public readonly camera: Camera;

  constructor(canvas: HTMLCanvasElement) {
    super({ view: canvas, backgroundColor: 0xf5f5f5, antialias: true });
    const resize = () => (this.renderer.resize(canvas.clientWidth, canvas.clientHeight));
    resize();
    window.addEventListener('resize', resize);
    this.stage.addChild(this.map);
    this.camera = new Camera(this, this.map);
    this.camera.focus(0, 0);
  }

  public addSprite(targetId: TargetId): SimulationSprite {
    const newSimulationSprite = new SimulationSprite(targetId);
    this.map.addChild(newSimulationSprite.container);
    return newSimulationSprite;
  }
}
