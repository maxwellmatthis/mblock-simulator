import type { Std } from "./targets/std";

export const globalVars = {};

export class LANRouter {
  private targets: Std[] = [];
  private broadcastValueStore: { [index: string]: string; } = {};

  public registerTarget(target: Std) {
    this.targets.push(target);
  }

  public broadcast(eventName: string, value?: any) {
    // TODO: test if this being set on receive also leads to race conditions in reality
    this.broadcastValueStore[eventName] = value;
    for (const target of this.targets) {
      target.runHatBlocks("cyberpi.cyberpi_wifi_broadcast_when_received_message", { eventName, value });
    }
  }

  public getValue(eventName: string) {
    return this.broadcastValueStore[eventName];
  }
}
