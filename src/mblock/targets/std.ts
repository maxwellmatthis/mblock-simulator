import type { Input, Block, Ops } from "../block";
import type { LANRouter } from "../global";
import { Context } from "../context";

type StopOption = "all" | "this script" | "other scripts in sprite";
type MathOp = "abs" | "floor" | "ceil" | "sqrt" | "sin" | "cos" | "tan" | "asin" | "acos" | "atan" | "ln" | "log" | "e ^" | "10 ^";

/**
 * The basic operation handler that every target must implement.
 */
export const StdOps: Ops<Std> = {
  // Events
  "event_whenbroadcastreceived": async (_, c, b) => (c.decodeField(b.fields["BROADCAST_OPTION"])),
  "event_broadcast": async (self, c, b) => (self.runHatBlocks("event_whenbroadcastreceived", await c.decodeInput(b.inputs["BROADCAST_INPUT"]))),

  // Control
  "control_wait": async (_, c, b) => (await new Promise(async (resolve, _) => setTimeout(resolve, await c.decodeInput(b.inputs["DURATION"]) * 1000))),
  "control_repeat": async (_, c, b) => (await c.runLoopTimes(await c.decodeInput(b.inputs["SUBSTACK"], true), await c.decodeInput(b.inputs["TIMES"]))),
  "control_forever": async (_, c, b) => (await c.runLoopForever(await c.decodeInput(b.inputs["SUBSTACK"], true))),
  "control_if": async (_, c, b) => (await c.decodeInput(b.inputs["CONDITION"]) && await c.runStartingAt(await c.decodeInput(b.inputs["SUBSTACK"], true))),
  "control_if_else": async (_, c, b) => (
    await c.decodeInput(b.inputs["CONDITIONS"])
      ? await c.runStartingAt(await c.decodeInput(b.inputs["SUBSTACK1"], true))
      : await c.runStartingAt(await c.decodeInput(b.inputs["SUBSTACK2"], true))
  ),
  "control_wait_until": async (_, c, b) => (await new Promise(async (resolve, _) => setInterval(async () => (await c.decodeInput(b.inputs["CONDITION"])) && resolve(null), 10))),
  "control_repeat_until": async (_, c, b) => (await c.runLoopUntil(await c.decodeInput(b.inputs["SUBSTACK"], true), await c.decodeInput(b.inputs["CONDITION"], true))),
  "control_stop": async (self, c, b) => {
    const stopOption = c.decodeField(b.fields["STOP_OPTION"]) as StopOption;
    switch (stopOption) {
      case "all": self.stopAll(); break;
      case "this script": c.destroy(); break;
      case "other scripts in sprite": self.stopAll(c.id); break;
      default: throw new Error(`"control_stop" option "${stopOption}" is not supported.`);
    }
  },

  // Operators
  "operator_add": async (_, c, b) => (await c.decodeInput(b.inputs["NUM1"]) + await c.decodeInput(b.inputs["NUM2"])),
  "operator_subtract": async (_, c, b) => (await c.decodeInput(b.inputs["NUM1"]) - await c.decodeInput(b.inputs["NUM2"])),
  "operator_multiply": async (_, c, b) => (await c.decodeInput(b.inputs["NUM1"]) * await c.decodeInput(b.inputs["NUM2"])),
  "operator_divide": async (_, c, b) => (await c.decodeInput(b.inputs["NUM1"]) / await c.decodeInput(b.inputs["NUM2"])),
  "operator_random": async (_, c, b) => {
    const min = await c.decodeInput(b.inputs["FROM"]);
    const max = await c.decodeInput(b.inputs["TO"]);
    return Math.floor(min + Math.random() * (max - min + 1));
  },
  "operator_gt": async (_, c, b) => (await c.decodeInput(b.inputs["OPERAND1"]) > await c.decodeInput(b.inputs["OPERAND2"])),
  "operator_lt": async (_, c, b) => (await c.decodeInput(b.inputs["OPERAND1"]) < await c.decodeInput(b.inputs["OPERAND2"])),
  "operator_equals": async (_, c, b) => (await c.decodeInput(b.inputs["OPERAND1"]) === await c.decodeInput(b.inputs["OPERAND2"])),
  "operator_and": async (_, c, b) => (await c.decodeInput(b.inputs["OPERAND1"]) && await c.decodeInput(b.inputs["OPERAND2"])),
  "operator_or": async (_, c, b) => (await c.decodeInput(b.inputs["OPERAND1"]) || await c.decodeInput(b.inputs["OPERAND2"])),
  "operator_not": async (_, c, b) => (!await c.decodeInput(b.inputs["OPERAND"])),
  "operator_join": async (_, c, b) => (await c.decodeInput(b.inputs["STRING1"]) + await c.decodeInput(b.inputs["STRING2"])),
  "operator_letter_of": async (_, c, b) => ((await c.decodeInput(b.inputs["STRING"]) as string).charAt(await c.decodeInput(b.inputs["LETTER"]))),
  "operator_length": async (_, c, b) => ((await c.decodeInput(b.inputs["STRING"]) as string).length),
  "operator_contains": async (_, c, b) => ((await c.decodeInput(b.inputs["STRING1"]) as string).includes(await c.decodeInput(b.inputs["STRING2"]))),
  "operator_mod": async (_, c, b) => (await c.decodeInput(b.inputs["NUM1"]) % await c.decodeInput(b.inputs["NUM2"])),
  "operator_round": async (_, c, b) => (Math.round(await c.decodeInput(b.inputs["NUM"]))),
  "operator_mathop": async (_, c, b) => {
    const op = c.decodeField(b.fields["OPERATOR"]) as MathOp;
    const n = await c.decodeInput(b.inputs["NUM"]);
    switch (op) {
      case "abs": return Math.abs(n);
      case "floor": return Math.floor(n);
      case "ceil": return Math.ceil(n);
      case "sqrt": return Math.sqrt(n);
      case "sin": return Math.sin(n);
      case "cos": return Math.cos(n);
      case "tan": return Math.tan(n);
      case "asin": return Math.asin(n);
      case "acos": return Math.acos(n);
      case "atan": return Math.atan(n);
      case "ln": return Math.log(n);
      case "log": return Math.log10(n);
      case "e ^": return Math.pow(n, Math.E);
      case "10 ^": return Math.pow(n, 10);
      default: throw new Error(`Unsupported math operation: ${op}`);
    }
  },

  // Data
  "data_variable": async (self, c, b) => { },
  "data_setvariableto": async (self, c, b) => (self.setVariable(c.decodeField(b.fields["VARIABLE"]), await c.decodeInput(b.inputs["VALUE"]))),
  "data_changevariableby": async (self, c, b) => (self.changeVariableBy(c.decodeField(b.fields["VARIABLE"]), await c.decodeInput(b.inputs["VALUE"]))),
  "data_showvariable": async (self, c, b) => { },
  "data_hidevariable": async (self, c, b) => { },
  "data_listcontents": async (self, c, b) => { },
  "data_addtolist": async (self, c, b) => { },
  "data_deleteoflist": async (self, c, b) => { },
  "data_deletealloflist": async (self, c, b) => { },
  "data_insertatlist": async (self, c, b) => { },
  "data_replaceitemoflist": async (self, c, b) => { },
  "data_itemoflist": async (self, c, b) => { },
  "data_itemnumoflist": async (self, c, b) => { },
  "data_lengthoflist": async (self, c, b) => { },
  "data_listcontainsitem": async (self, c, b) => { },
  "data_showlist": async (self, c, b) => { },
  "data_hidelist": async (self, c, b) => { },

  // Custom Functions
  "procedures_definition": async (self, c, b, args) => {
    const procedureContext = (await c.evaluateBlock(await c.decodeInput(b.inputs["custom_block"], true), args)).ret as Context;
    if (b.next) {
      self.saveContext(procedureContext);
      await procedureContext.runStartingAt(b.next);
    }
  },
  "procedures_prototype": async (self, c, b, args) => {
    const transformedArgs: { [index: string]: any; } = {};
    for (const [argId, input] of Object.entries(args)) {
      const argsName = c.decodeField(self.getBlock(await c.decodeInput(b.inputs[argId], true)).fields["VALUE"]);
      transformedArgs[argsName] = await c.decodeInput(input as Input);
    };
    return new Context(self, transformedArgs);
  },
  "argument_reporter_boolean": async (_, c, b) => (c.args[b.id]),
  "argument_reporter_string_number": async (_, c, b) => {
    return (c.args[c.decodeField(b.fields["VALUE"])]);
  },
  "procedures_call": async (self, c, b) => {
    if (b.mutation?.procCode) return await c.evaluateBlock(self.getProcId(b.mutation?.procCode), b.inputs);
  },
};

/**
 * Standard hat blocks. 
 */
export const StdHats = [
  "event_whenbroadcastreceived",
];

/**
 * A base class for targets that implements all standard blocks.
 */
export abstract class Std {
  /**
   * The physical size of the target's diameter in centimeters
   * to be used in rendering and collision calculation.
   */
  protected abstract physicalDiameterCm: number;
  /**
   * The name of the target.
   */
  public readonly name: string;
  /**
   * A map of hat opcodes mapped to all blocks with the same opcode.
   */
  private readonly hatBlocksByEvent: { [index: string]: { id: string, option: any; }[]; } = {};
  /**
   * A map of hat opcodes mapped to all blocks with the same opcode.
   */
  private readonly procedureDefinitionIdsByProcCode: { [index: string]: string; } = {};
  /**
   * A map of block IDs mapped to their respective blocks.
   */
  private readonly blocks: { [index: string]: Block; } = {};
  /**
   * Local variables of the target.
   */
  private readonly variables: { [index: string]: any; } = {};
  /**
   * Stacks of the target.
   */
  private readonly contexts: { [index: symbol]: Context; } = {};
  /**
   * An empty context in which to deserialize data when
   * there is no other context available yet.
   */
  private readonly emptyContext = new Context(this);
  /**
   * The network.
   */
  private readonly lanRouter: LANRouter;

  public constructor(name: string, lanRouter: LANRouter) {
    this.name = name;
    this.lanRouter = lanRouter;
  }

  public setVariable(id: string, value: any) {
    this.variables[id] = value;
  }

  public changeVariableBy(id: string, value: number) {
    this.variables[id] += value;
  }

  public getVariable(id: string) {
    return this.variables[id];
  }

  /**
   * Adds a block to the target.
   * @param id The block's ID.
   * @param block The block itself.
   */
  public async addBlock(id: string, block: Block) {
    if (!this.opcodeSupported(block.opcode)) throw new Error(`Opcode "${block.opcode}" is not supported on target "${this.constructor.name}".`);
    this.blocks[id] = block;
    if (this.isHat(block.opcode)) await this.registerHatBlock(block);
    if (block.opcode === "procedures_definition") {
      const procCode = this.getBlock(await this.emptyContext.decodeInput(block.inputs["custom_block"], true)).mutation?.procCode;
      if (procCode) this.procedureDefinitionIdsByProcCode[procCode] = id;
    }
  }

  /**
   * Gets a block from the internal block storage.
   * @param id The block's ID.
   * @returns A readonly version of the block.
   */
  public getBlock(id: string): Readonly<Block> {
    return this.blocks[id];
  }

  /**
   * Saves a hat block as a block that may be triggered by an event.
   * @param block The hat block.
   */
  private async registerHatBlock(block: Block) {
    const { opcode, id } = block;
    if (!(opcode in this.hatBlocksByEvent)) this.hatBlocksByEvent[opcode] = [];
    const ret = (await this.emptyContext.evaluateBlock(id)).ret;
    this.hatBlocksByEvent[opcode].push({ id, option: ret });
  }

  /**
   * Gets the available events.
   * @returns The list of events that are being listened for.
   */
  public getEvents(): { opcode: string, option: any; }[] {
    const events = [];
    for (const [opcode, blocks] of Object.entries(this.hatBlocksByEvent)) {
      for (const { option } of blocks) {
        if (!Object.values(events).some((event) => event.opcode === opcode && event.option === option)) {
          events.push({ opcode, option });
        }
      }
    }
    return events;
  }

  /**
   * Runs all hat blocks with a certain opcode.
   * @param eventOpcode The opcode of the hat block.
   * @param option Option to pass to the hat block.
   */
  public runHatBlocks(eventOpcode: string, option?: any) {
    if (!this.hatBlocksByEvent[eventOpcode]) return;
    for (const hatBlock of this.hatBlocksByEvent[eventOpcode]) {
      if (hatBlock.option == option) {
        const newContext = new Context(this);
        this.saveContext(newContext);
        newContext.runStartingAt(hatBlock.id);
      }
    }
  }

  /**
   * Saves a reference to a context belonging to this target.
   * @param context The context to be saved.
   */
  public saveContext(context: Context) {
    this.contexts[context.id] = context;
  }

  public getProcId(procCode: string) {
    return this.procedureDefinitionIdsByProcCode[procCode];
  }

  /**
   * Deletes a context by its symbol.
   * @param context The symbol that identifies the context.
   */
  public deleteContext(context: symbol) {
    if (this.contexts[context]) delete this.contexts[context];
  }

  /**
   * Stops everything.
   * @param exceptContext The context of the loop to skip and keep running.
   */
  public stopAll(exceptContext?: symbol) {
    for (const context of Reflect.ownKeys(this.contexts)) {
      if (context === exceptContext) continue;
      this.contexts[context as symbol].stop();
    }
  }

  /**
   * Checks if an opcode is supported on the target.
   * @param opcode The opcode to check support for.
   */
  protected opcodeSupported(opcode: string): boolean {
    return opcode in StdOps;
  };

  /**
   * Checks if an opcode belongs to a block that may be triggered by an event.
   * @param opcode The opcode to check.
   */
  protected isHat(opcode: string): boolean {
    return StdHats.includes(opcode);
  };

  /**
   * Executes an operation based on the block and the target.
   * @param context The context in which to run the operation.
   * @param block The block to execute.
   * @param option Option to pass to the operation handler.
   * @returns This function may return `any` value to be processed by
   * the caller of this function.
   */
  public async runOp(context: Context, block: Block, option?: any): Promise<void | null | symbol | any> {
    return await StdOps[block.opcode](this, context, block, option);
  };

  /**
   * Runs the activation event.
   * 
   * For example: For a sprite this would be the 'green flag pressed' event.
   */
  public abstract activate(): void;
}
