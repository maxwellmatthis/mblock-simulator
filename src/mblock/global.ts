import type { Std } from "./targets/std";

export const globalVars = {};

export class LANRouter {
  private targets: Std[] = [];

  public registerTarget(target: Std) {
    this.targets.push(target);
  }

  public broadcast(message: string, value?: any) {
    for (const target of this.targets) {
      target.runHatBlocks("cyberpi.cyberpi_wifi_broadcast_when_received_message", { message, value });
    }
  }
}
