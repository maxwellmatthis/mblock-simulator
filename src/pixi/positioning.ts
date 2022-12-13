import type { Sprite } from "pixi.js";

export function translationFunctions(sprite: Sprite) {
  return {
    moveXY: (x: number, y: number) => {
      sprite.position.x += x;
      sprite.position.y += y;
    },
    rotate: (degrees: number) => { sprite.angle += degrees; },
    getRotation: () => sprite.angle - 90,
  };
};
