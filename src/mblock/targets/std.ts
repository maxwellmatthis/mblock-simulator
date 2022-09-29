import type { Input, Inputs, Block, Ops } from "../block";
import type { LANRouter } from "../global";
import { Context, type ProcedureArgs } from "../context";

export type ArgType = "number" | "string" | "boolean";
export type ArgDefs = { name: string, type: ArgType; }[];
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
    await c.decodeInput(b.inputs["CONDITION"])
      ? await c.runStartingAt(await c.decodeInput(b.inputs["SUBSTACK"], true))
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

  // Custom Procedures
  /** Creates a new Context and runs the function in it. */
  "procedures_definition": async (self, _, b, args: ProcedureArgs) => {
    const procedureContext = new Context(self, args);
    if (b.next) {
      self.saveContext(procedureContext);
      await procedureContext.runStartingAt(b.next);
    }
  },
  /** Transforms `procedures_call` inputs into `ProcedureArgs`. */
  "procedures_prototype": async (self, c, b, inputs: Inputs) => {
    const transformedArgs: ProcedureArgs = {};
    for (const [argId, input] of Object.entries(inputs)) {
      const argName = c.decodeField(self.getBlock(await c.decodeInput(b.inputs[argId], true)).fields["VALUE"]);
      transformedArgs[argName] = await c.decodeInput(input as Input);
    };
    return transformedArgs;
  },
  /** Returns the value stored in the reporter. */
  "argument_reporter_boolean": async (_, c, b) => (c.args[c.decodeField(b.fields["VALUE"])]),
  /** Returns the value stored in the reporter. */
  "argument_reporter_string_number": async (_, c, b) => (c.args[c.decodeField(b.fields["VALUE"])]),
  /** Calls the procedure with the inputs of the `procedure_call` block. */
  "procedures_call": async (self, c, b) => {
    const procCode = b.mutation?.procCode;
    if (procCode) {
      const definitionBlock = self.getBlock(self.getProcId(procCode));
      const prototypeBlockId = await c.decodeInput(definitionBlock.inputs["custom_block"], true);
      const args = (await c.evaluateBlock(prototypeBlockId, b.inputs)).ret as object;
      return await self.callProcedure(procCode, args, c);
    }
  },
};

/**
 * Standard hat blocks. 
 */
export const StdHats = ["event_whenbroadcastreceived"];

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
  private readonly defaultContext = new Context(this);
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
   * @param block The block to add to the target.
   */
  public async addBlock(block: Block) {
    this.blocks[block.id] = block;
  }

  /**
   * Processes all added blocks.
   * 
   * This is where all the opcodes are checked for support and hat blocks are registered.
   */
  public async processBlocks() {
    for (const block of Object.values(this.blocks)) {
      try {
        if (!this.opcodeSupported(block.opcode)) throw new Error(`Opcode "${block.opcode}" is not supported on target "${this.constructor.name}".`);
        if (this.isHat(block.opcode)) await this.registerEventBlock(block);
        if (block.opcode === "procedures_definition") await this.registerProcedureBlock(block);
      } catch (error) {
        console.error(error);
      }
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
   * Saves the event block to the events register.
   * @param block The event block.
   */
  private async registerEventBlock(block: Block) {
    const { opcode, id } = block;
    if (!(opcode in this.hatBlocksByEvent)) this.hatBlocksByEvent[opcode] = [];
    const ret = (await this.defaultContext.evaluateBlock(id)).ret;
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

  /**
   * Saves the procedure definition to the procedure register.
   * @param block The `procedure_definition` block. 
   */
  public async registerProcedureBlock(block: Block) {
    const prototypeBlockId = await this.defaultContext.decodeInput(block.inputs["custom_block"], true);
    const procCode = this.getBlock(prototypeBlockId).mutation?.procCode;
    if (procCode) this.procedureDefinitionIdsByProcCode[procCode] = block.id;

  }

  /**
   * Gets the block ID of the procedure definition block by its procedure code.
   * @param procCode The procedure code.
   * @returns The block ID of the procedure definition block.
   */
  public getProcId(procCode: string): string {
    return this.procedureDefinitionIdsByProcCode[procCode];
  }

  /**
   * Calls a procedure.
   * @param procCode The procedure code.
   * @param args The procedure arguments.
   * @param context Optionally the current execution context. Not needed when calling the procedure manually.
   */
  public async callProcedure(procCode: string, args: ProcedureArgs, context?: Context) {
    return await (context || this.defaultContext).evaluateBlock(this.getProcId(procCode), args);
  }

  /**
   * Get the all procedure codes and their corresponding arguments.
   * @returns The procedures and arguments.
   */
  public async getProcedures() {
    /**
     * Extracts the types from the procedure code.
     * 
     * Example:
     * ```ts
     * console.log(getArgTypes("myProcedure %s %b %n %s"));
     * // output:
     * [ 'string', 'boolean', 'number', 'string' ]
     * ```
     * @param procCode The procedure code to extract the types from.
     * @returns A list of argument types in the correct order.
     */
    function getArgTypes(procCode: string): ArgType[] {
      const parts = procCode.split(" ");
      const types: ArgType[] = [];
      for (const part of parts) {
        if (part.search(/^%[snb]$/) === 0) {
          switch (part.split("")[1]) {
            case "s": types.push("string"); break;
            case "n": types.push("number"); break;
            case "b": types.push("boolean"); break;
          }
        }
      }
      return types;
    };

    const procedures: { procCode: string, argDefs: ArgDefs; }[] = [];
    for (const [procCode, definitionId] of Object.entries(this.procedureDefinitionIdsByProcCode)) {
      const definitionBlock = this.getBlock(definitionId);
      const prototypeBlock = this.getBlock(await this.defaultContext.decodeInput(definitionBlock.inputs["custom_block"], true));
      if (!prototypeBlock.mutation?.argumentIds) {
        console.log(new Error(`Property "mutation.argumentIds" is undefined for block "${prototypeBlock.id}".`));
        continue;
      }

      const argTypes = getArgTypes(procCode);
      const argumentIds = prototypeBlock.mutation.argumentIds;
      const argDefs: ArgDefs = [];
      for (let i = 0; i < argumentIds.length; i++) {
        const argId = argumentIds[i];
        const type = argTypes[i];
        const reporter = this.getBlock(await this.defaultContext.decodeInput(prototypeBlock.inputs[argId], true));
        const name = this.defaultContext.decodeField(reporter.fields["VALUE"]);
        argDefs.push({ name, type });
      }
      procedures.push({ procCode, argDefs });
    }
    return procedures;
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
