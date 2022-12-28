import type { Std } from "./targets/std";

export class LANRouter {
  private targets: Set<Std> = new Set();
  private broadcastValueStore: { [index: string]: string; } = {};

  public registerTarget(target: Std) {
    this.targets.add(target);
  }

  public unregisterTarget(target: Std) {
    this.targets.delete(target);
  }

  public broadcast(eventName: string, value?: any) {
    // TODO: test if this being set on receive also leads to race conditions in reality
    this.broadcastValueStore[eventName] = value;
    for (const target of this.targets) {
      target.runHatBlocks("cyberpi.cyberpi_wifi_broadcast_when_received_message", eventName);
    }
  }

  public getValue(eventName: string) {
    return this.broadcastValueStore[eventName];
  }
}
