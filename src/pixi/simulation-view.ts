import { Camera } from "./camera";
import { Application, Container, Sprite } from "pixi.js";

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

  public addSprite(spriteImageName: string) {
    const sprite = Sprite.from('/sprites/' + spriteImageName);
    sprite.anchor.set(0.5);
    this.map.addChild(sprite);
    return sprite;
  }
}
