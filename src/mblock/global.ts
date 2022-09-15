import type { Std } from "./targets/std";

export const globalVars = {};

export class LANRouter {
  private targets: Std[] = [];

  public registerTarget(target: Std) {
    this.targets.push(target);
  }
}
