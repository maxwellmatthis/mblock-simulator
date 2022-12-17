import { Loop } from "./loop";
import type { Std } from "./targets/std";
import { ScratchType, type Input, type Field } from "./block";

export type ProcedureArgs = { [index: string]: any; };

export class Context {
  /**
   * A symbol to uniquely identify this context.
   */
  public readonly id = Symbol();
  /**
   * A reference to the parent target.
   */
  private readonly self: Std;
  /**
   * Whether the current context may continue running.
   */
  private active = true;
  /**
   * Whether the current context may continue running.
   */
  private isMainRunner = true;
  /**
   * Local variables of the context.
   */
  public readonly args: { [index: string]: any; };
  /**
   * Local variables of the context.
   */
  private readonly activeLoops: { [index: symbol]: Loop; } = {};

  /**
   * @param self The parent target.
   * @param args Arguments to be passed to the context.
   */
  public constructor(self: Std, args: { [index: string]: any; } = {}) {
    this.self = self;
    Object.freeze(args);
    this.args = args;
  }

  /**
   * Decodes a scratch input array based on its scratch datatype.
   * @param input An input array.
   * @param noEval Can be set to `true` to return the ID of the shadow block without running it.
   * @returns The input in the smartest format available.
   */
  public async decodeInput(input: Input, noEval?: true): Promise<any> {
    const [type, value, id] = input;
    if (
      type === ScratchType.InputSameBlockShadow &&
      typeof value === "object"
    ) {
      return this.decodeInput(value, noEval);
    } else if (
      type === ScratchType.InputBlockNoShadow ||
      type === ScratchType.InputDiffBlockShadow
    ) {
      if (typeof value === "object") return this.decodeInput(value, noEval);
      else {
        if (noEval) return value;
        else return (await this.evaluateBlock(value as string, noEval)).ret;
      }
    } else if (type === ScratchType.Broadcast) {
      return String(id);
    } else if (
      type === ScratchType.Variable ||
      type === ScratchType.List
    ) {
      return this.self.getVariable(id as string);
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
   * Decodes a scratch field array.
   * @param field A field array.
   * @returns The ID, otherwise the data saved in the field.
   */
  public decodeField(field: Field) {
    return field[1] || field[0];
  }

  /**
   * Runs an existing block.
   * @param id The block's ID.
   * @param option Options to pass to the block.
   * @returns The ID of the next block and the raw return value of the operation.
   */
  public async evaluateBlock(id: string, option?: any): Promise<{ nextId: string | null, ret: any; }> {
    const block = this.self.getBlock(id);
    let ret;
    try {
      ret = await this.self.runOp(this, block, option);
    } catch (error) {
      console.error(block, error);
    }
    return { nextId: block.next, ret };
  }

  /**
   * Run the block with ID `id` and all `next` blocks in parallel.
   * @param id The block's ID.
   * @param option Option to pass to the starting block.
   */
  public async runStartingAt(id: string, option?: any) {
    const isMainRunner = this.isMainRunner;
    if (isMainRunner) this.isMainRunner = false;
    try {
      let { nextId } = await this.evaluateBlock(id, option);
      while (nextId && this.active) {
        nextId = (await this.evaluateBlock(nextId, null)).nextId;
      }
    } catch (error) {
      console.error(error);
      // TODO: better error handling
    }
    if (isMainRunner) this.destroy();
  }

  /**
   * Runs a loop forever.
   * @param firstLoopBlockId The first block in the loop.
   */
  public async runLoopForever(firstLoopBlockId: string) {
    const ownLoop = Symbol();
    const newLoop = new Loop(this, firstLoopBlockId, ownLoop);
    this.activeLoops[ownLoop] = newLoop;
    await newLoop.forever();
  }

  /**
   * Runs a loop a certain amount of times.
   * @param firstLoopBlockId The first block in the loop.
   * @param times The amount of times to run the loop, if left undefined the loop will loop forever.
   */
  public async runLoopTimes(firstLoopBlockId: string, times: number) {
    const ownLoop = Symbol();
    const newLoop = new Loop(this, firstLoopBlockId, ownLoop);
    this.activeLoops[ownLoop] = newLoop;
    await newLoop.times(times);
  }

  /**
   * Runs a loop until a condition is met.
   * @param firstLoopBlockId The first block in the loop.
   * @param conditionBlockId The conditiona block that must become true for the loop to stop.
   */
  public async runLoopUntil(firstLoopBlockId: string, conditionBlockId: string) {
    const ownLoop = Symbol();
    const newLoop = new Loop(this, firstLoopBlockId, ownLoop);
    this.activeLoops[ownLoop] = newLoop;
    await newLoop.until(conditionBlockId);
  }

  /**
   * Deletes a loop by its symbol.
   * @param loop The symbol that identifies the loop.
   */
  public deleteLoop(loop: symbol) {
    if (this.activeLoops[loop]) delete this.activeLoops[loop];
  }

  /**
   * Stops the execution of everything in this context.
   */
  public stop() {
    this.active = false;
    for (const loop of Reflect.ownKeys(this.activeLoops)) {
      this.activeLoops[loop as symbol].stop();
    }
  }

  /**
   * Stop the execution and deletes the context.
   */
  public destroy() {
    this.stop();
    this.self.deleteContext(this.id);
  }
}
