import { Block } from "./block";
import type { Std } from "./targets/std";
import { CyberPI } from "./targets/cyberpi";
import { MBot2 } from "./targets/mbot2";
import type { LANRouter } from "./global";

export interface MBlockJSON {
  targets: TargetJSON[],
}

export interface TargetJSON {
  isStage: boolean,
  name: string,
  variables: object,
  lists: object,
  broadcasts: object,
  blocks: { [index: string]: any; },
  deviceId?: string,
  loadedExtIds?: string[],
}

export type ParsedTarget = { target: TargetJSON, error?: string; };

export function getTargets(mBlock: object): ParsedTarget[] {
  if (!("targets" in mBlock)) throw new Error("mBlock file must contain a `targets` property.");
  else {
    const targets: ParsedTarget[] = [];
    for (const target of (mBlock as MBlockJSON).targets) {
      try {
        getTargetId(target);
        targets.push({ target });
      } catch (error) {
        targets.push({ target, error: String(error) });
      }
    }
    return targets;
  }
}

export enum TargetId {
  CyberPI = "cyberpi",
  MBot2 = "mbot2"
}

export function getTargetId(target: TargetJSON): TargetId {
  if (target.isStage) throw new Error("Stages are not supported!");
  if (target.deviceId === "cyberpi") {
    if (target.name?.search(/^cyberpi[0-9]*$/) === 0) return TargetId.CyberPI;
    if (
      target.name?.search(/^mbotneo[0-9]*$/) === 0 && target.loadedExtIds &&
      extsLoaded(target.loadedExtIds, "mbot2", "cyberpi_mbuild_ultrasonic2", "mbuild_quad_color_sensor")
    ) return TargetId.MBot2;
  }
  throw new Error(`Unsupported target: ${target.name}.`);
}

function extsLoaded(loadedExtIds: string[], ...requiredExtensions: string[]): boolean {
  let loaded = new Set(loadedExtIds);
  let required = new Set(requiredExtensions);
  return required.size <= loaded.size && [...required].every((x) => loaded.has(x));
}

export async function createEntity(target: TargetJSON, lanRouter: LANRouter, name: string): Promise<Std> {
  const targetId = getTargetId(target);
  const entity = newEntity(targetId, lanRouter, name);
  for (const [id, block] of Object.entries(target.blocks)) {
    entity.addBlock(new Block(id, block));
  }
  await entity.processBlocks();
  return entity;
}

function newEntity(targetId: TargetId, lanRouter: LANRouter, name: string): Std {
  switch (targetId) {
    case TargetId.CyberPI: return new CyberPI(targetId, lanRouter, name);
    case TargetId.MBot2: return new MBot2(targetId, lanRouter, name);
    default: throw new Error(`Unknown target: ${name}.`);
  }
}
