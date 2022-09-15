import { Block, type BlockJSON } from "./block";
import type { Std } from "./targets/std";
import { CyberPI } from "./targets/cyberpi";
import { MBot2 } from "./targets/mbot2";
import type { LANRouter } from "./global";

export interface TargetJSON {
  isStage: boolean,
  name: string,
  variables: object,
  lists: object,
  broadcasts: object,
  blocks: { [index: string]: BlockJSON; },
  deviceId?: string,
  loadedExtIds?: string[],
}

export function createTarget(target: TargetJSON, lanRouter: LANRouter): Std {
  if (target.isStage) throw new Error("Stages are not supported!");
  const targetObj = getTargetClass(lanRouter, target.name, target.deviceId, target.loadedExtIds);
  for (const [id, block] of Object.entries(target.blocks)) {
    try {
      targetObj.addBlock(id, new Block(block));
    } catch (error) {
      console.error(error);
    }
  }
  console.log(targetObj);
  return targetObj;
}

function getTargetClass(lanRouter: LANRouter, name?: string, deviceId?: string, loadedExtIds?: string[]): Std {
  if (deviceId === "cyberpi") {
    if (name?.search(/^cyberpi[0-9]*$/) === 0) return new CyberPI(lanRouter);
    if (name?.search(/^mbotneo[0-9]*$/) === 0 && loadedExtIds && extsLoaded(loadedExtIds, "mbot2", "cyberpi_mbuild_ultrasonic2", "mbuild_quad_color_sensor")) return new MBot2(lanRouter);
  }
  throw new Error(`Unknown target: ${name}.`);
}

function extsLoaded(loadedExtIds: string[], ...requiredExtensions: string[]): boolean {
  let loaded = new Set(loadedExtIds);
  let required = new Set(requiredExtensions);
  return required.size <= loaded.size && [...required].every((x) => loaded.has(x));
}
