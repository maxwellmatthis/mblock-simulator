import { LANRouter } from "./global";
import { createTarget, type TargetJSON } from "./target";
import type { Std } from "./targets/std";

export interface MBlockJSON {
  targets: TargetJSON[],
}

export function parse(mBlock: object): Std[] {
  if (!("targets" in mBlock)) throw new Error("mBlock file must contain a `targets` property.");
  else {
    const eventEmitter = new LANRouter();
    const targets = [];
    for (const target of (mBlock as MBlockJSON).targets) {
      try {
        const targetObj = createTarget(target, eventEmitter);
        targets.push(targetObj);
        eventEmitter.registerTarget(targetObj);
      } catch (error) {
        // TODO: better error handling
        console.error(error);
      }
    }
    return targets;
  }
}
