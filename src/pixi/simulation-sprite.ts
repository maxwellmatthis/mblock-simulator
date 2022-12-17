import { Container, Sprite } from "pixi.js";
import type { TargetId } from "../mblock/target";

export class SimulationSprite {
  public readonly container = new Container();
  private readonly simulatedObject: Sprite;

  public constructor(targetId: TargetId) {
    this.simulatedObject = Sprite.from('/simulator-sprites/' + targetId + '/sprite.png');
    this.simulatedObject.anchor.set(0.5);
    this.container.addChild(this.simulatedObject);
  }

  public translationFunctions() {
    return {
      moveXY: (x: number, y: number) => {
        this.container.position.x += x;
        this.container.position.y += y;
      },
      rotate: (degrees: number) => { this.simulatedObject.angle += degrees; },
      getRotation: () => this.simulatedObject.angle - 90,
    };
  };

  public destroy() {
    this.container.destroy();
  }
}
