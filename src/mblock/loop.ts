import type { Context } from "./context";

export class Loop {
  private running = true;
  private runIteration: Function;
  private context: Context;
  private ownLoopSymbol: symbol;

  /**
   * Creates a new loop.
   * @param context The context in which to evaluate the block.
   * @param firstLoopBlockId The ID of the first block in the loop.
   */
  constructor(context: Context, firstLoopBlockId: string, ownLoopSymbol: symbol) {
    this.context = context;
    this.runIteration = async () => await new Promise<any>(async (resolve, _) => {
      setTimeout(async () => {
        await context.runStartingAt(firstLoopBlockId);
        resolve(null);
      }, 0);
    });
    this.ownLoopSymbol = ownLoopSymbol;
  }

  /**
   * Runs the loop forever.
   */
  public async forever() {
    while (this.running) {
      await this.runIteration();
    }
    this.destroy();
  }

  /**
   * Runs the loop `times` times.
   * @param times The amount of times to run the loop.
   */
  public async times(times: number) {
    for (let i = 0; this.running && i < times; i++) {
      await this.runIteration();
    }
    this.destroy();
  }

  /**
   * Runs the loop until the condition is met.
   * @param conditionBlockId The conditiona block that must become true for the loop to stop.
   */
  public async until(conditionBlockId: string) {
    while (this.running && !(await this.context.evaluateBlock(conditionBlockId)).ret) {
      await this.runIteration();
    }
    this.destroy();
  }

  /**
   * Prevent the loop from starting a new iteration.
   */
  public stop() {
    this.running = false;
  }

  /**
   * Stop the loop and delete it from its host's `activeLoops` map.
   */
  private destroy() {
    this.stop();
    this.context.deleteLoop(this.ownLoopSymbol);
  }
}
