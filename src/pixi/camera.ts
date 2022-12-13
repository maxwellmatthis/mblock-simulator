import type { Application, Container } from "pixi.js";

export class Camera {
  private x = 0;
  private y = 0;
  private scale = 1;
  private app: Application;
  private map: Container;

  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  public constructor(app: Application, map: Container) {
    this.app = app;
    this.map = map;
  }

  public focus(x = this.x, y = this.y) {
    this.map.x = this.app.screen.width * (1 / this.scale) / 2 - x;
    this.map.y = this.app.screen.height * (1 / this.scale) / 2 - y;
    this.x = x;
    this.y = y;
  }

  public moveBy(dx: number, dy: number) {
    this.focus(this.x - dx * (1 / this.scale), this.y - dy * (1 / this.scale));
  }

  public setScale(x: number, y: number, scale: number) {
    this.app.stage.scale.set(scale);
    this.scale = scale;
    this.focus();
  }

  public scaleBy(x: number, y: number, dy: number) {
    this.setScale(x, y, Math.min(Math.max(0.01, this.scale + dy * -0.001), 4));
  }

  public startDrag(x: number, y: number) {
    this.lastX = x;
    this.lastY = y;
    this.dragging = true;
  }

  public drag(dx: number, dy: number) {
    if (this.dragging) this.moveBy(dx - this.lastX, dy - this.lastY);
    this.lastX = dx;
    this.lastY = dy;
  }

  public stopDrag() {
    this.dragging = false;
  }
}
