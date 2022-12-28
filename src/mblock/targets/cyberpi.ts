import { Std, StdOps, StdHats } from "./std";
import { type Ops, noop, type Block } from "../block";
import type { Context } from "../context";

export const CyberPIOps: Ops<CyberPI> = {
  // Events
  "cyberpi.cyberpi_when_launch": noop,
  "cyberpi.cyberpi_when_button_press": (_, c, b) => (c.decodeField(b.fields["fieldMenu_2"])),
  "cyberpi.cyberpi_when_direction_key_press": (_, c, b) => (c.decodeField(b.fields["fieldMenu_2"])),
  "cyberpi.cyberpi_when_detect_action": (_, c, b) => (c.decodeField(b.fields["tilt"])),
  "cyberpi.cyberpi_wifi_broadcast_when_received_message": async (_, c, b) => (await c.decodeInput(b.inputs["message"])),

  // Net
  "cyberpi.cyberpi_set_wifi_broadcast": async (self, c, b) => self.lanRouter.broadcast(await c.decodeInput(b.inputs["message"])),
  "cyberpi.cyberpi_set_wifi_broadcast_with_value": async (self, c, b) => self.lanRouter.broadcast(await c.decodeInput(b.inputs["message"]), await c.decodeInput(b.inputs["value"])),
  "cyberpi.cyberpi_wifi_broadcast_get_value": async (self, c, b) => self.lanRouter.getValue(await c.decodeInput(b.inputs["message"])),

  // Time
  "cyberpi.cyberpi_timer_reset": (self, c, b) => self.launchTime_unixMillis = Date.now(),
  "cyberpi.cyberpi_timer_get": (self, c, b) => (Date.now() - self.launchTime_unixMillis) / 1000,

  // Name
  "cyberpi.cyberpi_name": (self, c, b) => { },

  // Display
  "cyberpi.cyberpi_display_println": async (self, c, b) => { self.display.print(await c.decodeInput(b.inputs["string_2"]), true); },
  "cyberpi.cyberpi_display_print": async (self, c, b) => { self.display.print(await c.decodeInput(b.inputs["string_2"])); },
  "cyberpi.cyberpi_display_clear": (self, c, b) => { self.display.clear(); },

  // Util
  "cyberpi.cyberpi_operator_casts": async (_, c, b) => {
    const value = await c.decodeInput(b.inputs["string_2"]);
    switch (c.decodeField(b.fields["fieldMenu_1"])) {
      case "str": return String(value);
      case "float": return Number(value);
      case "int": return Number(value);
      default: return null;
    }
  }
};

const CyberPIHats = [
  "cyberpi.cyberpi_when_launch",
  "cyberpi.cyberpi_when_button_press",
  "cyberpi.cyberpi_when_direction_key_press",
  "cyberpi.cyberpi_when_detect_action",
  "cyberpi.cyberpi_when_detect_attitude",
  "cyberpi.cyberpi_when_sensor_value_bigger_or_smaller_than",
  "cyberpi.cyberpi_wifi_broadcast_when_received_message"
];

const ops = Object.assign(CyberPIOps, StdOps);
const hats = [...StdHats, ...CyberPIHats];
export class CyberPI extends Std {
  public launchTime_unixMillis = Date.now();
  public readonly audio = new Audio();
  public readonly led = new LED();
  public readonly display = new Display();

  protected opcodeSupported(opcode: string): boolean {
    return opcode in ops;
  }

  public async runOp(stack: Context, block: Block, option: any) {
    return await ops[block.opcode](this, stack, block, option);
  }

  protected isHat(opcode: string): boolean {
    return hats.includes(opcode);
  }

  public activate(): void {
    this.runHatBlocks("cyberpi.cyberpi_when_launch", null);
  }
}

class Audio {

}

class LED {

}

type PrintFn = (str: string, newLine?: true) => void;
type ClearFn = () => void;
class Display {
  private printFn: PrintFn = () => { };
  private clearFn: ClearFn = () => { };

  public registerDisplay(printFn: PrintFn, clearFn: ClearFn) {
    this.printFn = printFn;
    this.clearFn = clearFn;
  }

  public print(str: string, newLine?: true) {
    this.printFn(str, newLine);
  }

  public clear() {
    this.clearFn();
  }
}
