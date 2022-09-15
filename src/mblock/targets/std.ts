import { ScratchType, type PrimitiveDef, type Block, type Ops } from "../block";
import type { LANRouter } from "../global";

/**
 * Return this symbol from any operation function to interrupt the
 * further execution of the stack that the operation function is called from.
 */
export const INTERRUPT = Symbol();

type StopOption = "all" | "this script" | "other scripts in sprite";
type MathOp = "abs" | "floor" | "ceil" | "sqrt" | "sin" | "cos" | "tan" | "asin" | "acos" | "atan" | "ln" | "log" | "e ^" | "10 ^";

/**
 * The basic operation handler that every target must implement.
 */
export const StdOps: Ops<Std> = {
  // Events
  "event_whenbroadcastreceived": async (self, b, broadcastId) => (await self.decodePrimitive(b.fields["BROADCAST_OPTION"]) !== broadcastId ? INTERRUPT : null),
  "event_broadcast": async (self, b) => (self.runHatBlocks("event_whenbroadcastreceived", await self.decodePrimitive(b.inputs["BROADCAST_INPUT"]))),

  // Control
  "control_wait": async (self, b) => new Promise(async (resolve, _) => setTimeout(resolve, await self.decodePrimitive(b.inputs["DURATION"]))),
  "control_repeat": async (self, b) => (self.runLoopTimes(await self.decodePrimitive(b.inputs["SUBSTACK"]), await self.decodePrimitive(b.inputs["TIMES"]))),
  "control_forever": async (self, b) => (self.runLoopForever(await self.decodePrimitive(b.inputs["SUBSTACK"]))),
  "control_if": async (self, b) => (await self.decodePrimitive(b.inputs["CONDITIONS"]) && self.runNextsFromBlock(await self.decodePrimitive(b.inputs["SUBSTACK"]))),
  "control_if_else": async (self, b) => (
    await self.decodePrimitive(b.inputs["CONDITIONS"])
      ? self.runNextsFromBlock(await self.decodePrimitive(b.inputs["SUBSTACK1"]))
      : self.runNextsFromBlock(await self.decodePrimitive(b.inputs["SUBSTACK2"]))
  ),
  "control_wait_until": async (self, b) => { },
  "control_repeat_until": async (self, b) => (self.runLoopUntil(await self.decodePrimitive(b.inputs["SUBSTACK"]), await self.decodePrimitive(b.inputs["CONDITION"]))),
  "control_stop": async (self, b) => {
    const stopOption = await self.decodePrimitive(b.fields["STOP_OPTION"]) as StopOption;
    switch (stopOption) {
      case "all": self.stopAllLoops();
      default: throw new Error(`"control_stop" option "${stopOption}" is not supported.`);
    }
  },

  // Operators
  "operator_add": async (self, b) => (await self.decodePrimitive(b.inputs["NUM1"]) + await self.decodePrimitive(b.inputs["NUM2"])),
  "operator_subtract": async (self, b) => (await self.decodePrimitive(b.inputs["NUM1"]) - await self.decodePrimitive(b.inputs["NUM2"])),
  "operator_multiply": async (self, b) => (await self.decodePrimitive(b.inputs["NUM1"]) * await self.decodePrimitive(b.inputs["NUM2"])),
  "operator_divide": async (self, b) => (await self.decodePrimitive(b.inputs["NUM1"]) / await self.decodePrimitive(b.inputs["NUM2"])),
  "operator_random": async (self, b) => {
    const min = await self.decodePrimitive(b.inputs["FROM"]);
    const max = await self.decodePrimitive(b.inputs["TO"]);
    return Math.floor(min + Math.random() * (max - min + 1));
  },
  "operator_gt": async (self, b) => (await self.decodePrimitive(b.inputs["OPERAND1"]) > await self.decodePrimitive(b.inputs["OPERAND2"])),
  "operator_lt": async (self, b) => (await self.decodePrimitive(b.inputs["OPERAND1"]) < await self.decodePrimitive(b.inputs["OPERAND2"])),
  "operator_equals": async (self, b) => (await self.decodePrimitive(b.inputs["OPERAND1"]) === await self.decodePrimitive(b.inputs["OPERAND2"])),
  "operator_and": async (self, b) => (await self.decodePrimitive(b.inputs["OPERAND1"]) && await self.decodePrimitive(b.inputs["OPERAND2"])),
  "operator_or": async (self, b) => (await self.decodePrimitive(b.inputs["OPERAND1"]) || await self.decodePrimitive(b.inputs["OPERAND2"])),
  "operator_not": async (self, b) => (!await self.decodePrimitive(b.inputs["OPERAND"])),
  "operator_join": async (self, b) => (await self.decodePrimitive(b.inputs["STRING1"]) + await self.decodePrimitive(b.inputs["STRING2"])),
  "operator_letter_of": async (self, b) => ((await self.decodePrimitive(b.inputs["STRING"]) as string).charAt(await self.decodePrimitive(b.inputs["LETTER"]))),
  "operator_length": async (self, b) => ((await self.decodePrimitive(b.inputs["STRING"]) as string).length),
  "operator_contains": async (self, b) => ((await self.decodePrimitive(b.inputs["STRING1"]) as string).includes(await self.decodePrimitive(b.inputs["STRING2"]))),
  "operator_mod": async (self, b) => (await self.decodePrimitive(b.inputs["NUM1"]) % await self.decodePrimitive(b.inputs["NUM2"])),
  "operator_round": async (self, b) => (Math.round(await self.decodePrimitive(b.inputs["NUM"]))),
  "operator_mathop": async (self, b) => {
    const op = await self.decodePrimitive(b.fields["OPERATOR"]) as MathOp;
    const n = await self.decodePrimitive(b.inputs["NUM"]);
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
  "data_variable": async (self, b) => { },
  "data_setvariableto": async (self, b) => (self.setVariable(await self.decodePrimitive(b.fields["VARIABLE"]), await self.decodePrimitive(b.inputs["VALUE"]))),
  "data_changevariableby": async (self, b) => { },
  "data_showvariable": async (self, b) => { },
  "data_hidevariable": async (self, b) => { },
  "data_listcontents": async (self, b) => { },
  "data_addtolist": async (self, b) => { },
  "data_deleteoflist": async (self, b) => { },
  "data_deletealloflist": async (self, b) => { },
  "data_insertatlist": async (self, b) => { },
  "data_replaceitemoflist": async (self, b) => { },
  "data_itemoflist": async (self, b) => { },
  "data_itemnumoflist": async (self, b) => { },
  "data_lengthoflist": async (self, b) => { },
  "data_listcontainsitem": async (self, b) => { },
  "data_showlist": async (self, b) => { },
  "data_hidelist": async (self, b) => { },

  // Custom Functions
  "procedures_definition": async (self, b) => { },
  "procedures_prototype": async (self, b) => { },
  "argument_reporter_boolean": async (self, b) => { },
  "argument_reporter_string_number": async (self, b) => { },
  "procedures_call": async (self, b) => { },
};

/**
 * Hat Blocks implemented by the 
 */
export const StdHats = [
  "event_whengreaterthan",
  "event_whenbroadcastreceived",
  "event_broadcast",
  "event_broadcastandwait"
];

/**
 * A base class for targets that implements the 
 */
export abstract class Std {
  /**
   * The physical size of the target's diameter in centimeters
   * to be used in rendering and collision calculation.
   */
  protected abstract physicalDiameterCm: number;
  /**
   * A map of hat opcodes mapped to all blocks with the same opcode.
   */
  private hatBlockIdsByEvent: { [index: string]: string[]; } = {};
  /**
   * A map of block IDs mapped to their respective blocks.
   */
  private blocks: { [index: string]: Block; } = {};
  /**
   * Local variables of the target.
   */
  protected variables: { [index: string]: any; } = {};
  /**
   * Local variables of the target.
   */
  private activeLoops: { [index: symbol]: Loop; } = {};
  /**
   * The time interval to wait between each iteration of the loop.
   */
  private loopIterationWait = 0;
  /**
   * The global event emitter.
   */
  private lanRouter: LANRouter;

  public constructor(lanRouter: LANRouter) {
    this.lanRouter = lanRouter;
  }

  /**
   * Adds a block to the target.
   * @param id The block's ID.
   * @param block The block itself.
   */
  public addBlock(id: string, block: Block) {
    if (!this.opcodeSupported(block.opcode)) throw new Error(`Opcode "${block.opcode}" is not supported on target "${this.constructor.name}".`);
    this.blocks[id] = block;
    if (this.isHat(block.opcode)) this.registerHatBlockId(block.opcode, id);
  }

  /**
   * Gets a block from the internal block storage.
   * @param id The block's ID.
   * @returns A readonly version of the block.
   */
  public getBlock(id: string): Readonly<Block> {
    return this.blocks[id];
  }

  public async decodePrimitive(def: PrimitiveDef): Promise<any> {
    console.log("Decoding:", def);
    const [type, value, id] = def;
    if (type === ScratchType.InputBlockNoShadow ||
      type === ScratchType.InputDiffBlockShadow
    ) {
      return (await this.evaluateBlock(value as string)).ret;
    } else if (type === ScratchType.InputSameBlockShadow && typeof value === "object") {
      return this.decodePrimitive(value);
    } else if (
      type === ScratchType.Broadcast ||
      type === ScratchType.Variable ||
      type === ScratchType.List
    ) {
      return String(id);
    } else if (
      type === ScratchType.Number ||
      type === ScratchType.PositiveNumber ||
      type === ScratchType.PositiveInteger ||
      type === ScratchType.Integer ||
      type === ScratchType.Angle
    ) {
      return Number(value);
    } else return String(value);
  }

  /**
   * Runs an existing block.
   * @param id The block's ID.
   * @param options Options to pass to the operation handler.
   * @returns The ID of the next block and the raw return value of the operation.
   */
  public async evaluateBlock(id: string, options?: any): Promise<{ nextId: string | null, ret: any; }> {
    const block = this.blocks[id];
    // DEBUG
    console.log("Running block: ", block);
    const ret = await this.runOp(block, options);
    console.log("Ret: ", ret);
    return { nextId: ret === INTERRUPT ? null : block.next, ret };
  }

  /**
   * Saves a hat block as a block that may be triggered by an event.
   * @param eventOpcode The opcode of the hat block.
   * @param id The block's ID.
   */
  private registerHatBlockId(eventOpcode: string, id: string) {
    if (!(eventOpcode in this.hatBlockIdsByEvent)) this.hatBlockIdsByEvent[eventOpcode] = [];
    this.hatBlockIdsByEvent[eventOpcode].push(id);
  }

  /**
   * Run the block with ID `id` and all `next` blocks in parallel.
   * @param id The block's ID.
   * @param options Options to pass to the operation handler.
   */
  public runNextsFromBlock(id: string, options?: any) {
    // Use as much async code as possible for the highest level of
    // parallelization, especially in forever loops.
    (async () => {
      try {
        let { nextId } = await this.evaluateBlock(id, options);
        while (true) {
          if (nextId) nextId = (await this.evaluateBlock(nextId, null)).nextId;
          else break;
        }
      } catch (error) {
        console.error(error);
        // TODO: better error handling
      }
    })();
  }

  /**
   * Gets the available events.
   * @returns The list of events that are being listened for.
   */
  public getEvents(): string[] {
    return Object.keys(this.hatBlockIdsByEvent);
  };

  /**
   * Runs all hat blocks with a certain opcode.
   * @param eventOpcode The opcode of the hat block.
   * @param options Options to pass to the operation handler.
   */
  public runHatBlocks(eventOpcode: string, options?: any) {
    if (!this.hatBlockIdsByEvent[eventOpcode]) return;
    for (const eventBlockId of this.hatBlockIdsByEvent[eventOpcode]) {
      this.runNextsFromBlock(eventBlockId, options);
    }
  }

  /**
   * Runs a loop forever.
   * @param firstLoopBlockId The first block in the loop.
   */
  public runLoopForever(firstLoopBlockId: string) {
    const ownLoop = Symbol();
    const newLoop = new Loop(this, firstLoopBlockId, this.loopIterationWait).forever();
    this.activeLoops[ownLoop] = newLoop;
  }

  /**
   * Runs a loop a certain amount of times.
   * @param firstLoopBlockId The first block in the loop.
   * @param times The amount of times to run the loop, if left undefined the loop will loop forever.
   */
  public runLoopTimes(firstLoopBlockId: string, times: number) {
    const ownLoop = Symbol();
    const newLoop = new Loop(this, firstLoopBlockId, this.loopIterationWait).times(times);
    this.activeLoops[ownLoop] = newLoop;
  }

  /**
   * Runs a loop until a condition is met.
   * @param firstLoopBlockId The first block in the loop.
   * @param conditionBlockId The conditiona block that must become true for the loop to stop.
   */
  public runLoopUntil(firstLoopBlockId: string, conditionBlockId: string) {
    const ownLoop = Symbol();
    const newLoop = new Loop(this, firstLoopBlockId, this.loopIterationWait).until(this, conditionBlockId);
    this.activeLoops[ownLoop] = newLoop;
  }

  /**
   * Stops all loops.
   */
  public stopAllLoops() {
    for (const loop of Reflect.ownKeys(this.activeLoops)) {
      this.activeLoops[loop as symbol].stop();
      delete this.activeLoops[loop as symbol];
    }
  }

  /**
   * Changes the cooldown time between each iteration of the loops.
   * @param timeMs The new cooldown time between each iteration of the loops in milliseconds.
   */
  public setLoopIterationWait(timeMs: number) {
    this.loopIterationWait = timeMs;
    for (const loop of Reflect.ownKeys(this.activeLoops)) {
      this.activeLoops[loop as symbol].adjustLoopSpeed(this.loopIterationWait);
    }
  }

  public setVariable(id: string, value: any) {
    this.variables[id] = value;
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
   * @param block The block to execute.
   * @param options Options to pass to the operation handler.
   * @returns This function may return `any` value to be processed by
   * the caller of this function. If the operation wishes to terminate
   */
  protected runOp(block: Block, options?: any): Promise<void | null | symbol | any> {
    return StdOps[block.opcode](this, block, options);
  };

  /**
   * Runs the activation event.
   * 
   * For example: For a sprite this would be the 'green flag pressed' event.
   */
  public abstract activate(): void;
}

class Loop {
  private interval?: NodeJS.Timer;
  private loopIterationWait: number;
  private runIteration: Function;

  constructor(self: Std, firstLoopBlockId: string, loopIterationWait: number) {
    this.runIteration = () => self.runNextsFromBlock(firstLoopBlockId);
    this.loopIterationWait = loopIterationWait;
  }

  /**
   * Run the loop forever.
   * @chainable
   */
  public forever(): this {
    this.stop();
    this.start();
    return this;
  }

  /**
   * Runs the loop `times` times.
   * @param times The amount of times to run the loop.
   * @chainable
   */
  public times(times: number): this {
    this.stop();
    this.runIteration = () => {
      if (times === 0) this.stop();
      this.runIteration();
      if (times) times--;
    };
    this.start();
    return this;
  }

  /**
   * Runs the loop until the condition is met.
   * @param self The target object that initiated the loop.
   * @param conditionBlockId The conditiona block that must become true for the loop to stop.
   * @chainable
   */
  public until(self: Std, conditionBlockId: string): this {
    this.stop();
    this.runIteration = async () => {
      if ((await self.evaluateBlock(conditionBlockId)).ret) this.stop();
      this.runIteration();
    };
    this.start();
    return this;
  }

  public adjustLoopSpeed(newLoopIterationWait: number) {
    this.loopIterationWait = newLoopIterationWait;
    this.stop();
    this.start();
  }

  private start() {
    this.interval = setInterval(() => this.runIteration, this.loopIterationWait);
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }
}
