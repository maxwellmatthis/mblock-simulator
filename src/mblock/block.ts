// See https://en.scratch-wiki.info/wiki/Scratch_File_Format for more information.

import type { Context } from "./context";
import type { Std } from "./targets/std";

export const noop = () => { };
export enum ScratchType {
  InputSameBlockShadow = 1,
  InputBlockNoShadow = 2,
  InputDiffBlockShadow = 3,
  Number = 4,
  PositiveNumber = 5,
  PositiveInteger = 6,
  Integer = 7,
  Angle = 8,
  Color = 9,
  String = 10,
  Broadcast = 11,
  Variable = 12,
  List = 13,
}
export type Input = [ScratchType, (string | Input), (string | undefined)];
type Inputs = { [index: string]: Input; };
export type Field = [string, string?];
type Fields = { [index: string]: Field; };
export type OpFn<Target extends Std> = (self: Target, stack: Context, block: Block, option: any) => any;
export type Ops<Target extends Std> = { [index: string]: OpFn<Target>; };

class Mutation {
  public static tagName = "mutation";
  public readonly children: [];
  public readonly procCode?: string;
  public readonly argumentIds?: string[];
  public readonly argumentNames?: string[];
  public readonly argumentDefaults?: (string | number | boolean)[];
  public readonly hasNext: boolean;

  public constructor(mutation: any) {
    this.children = mutation.children || [];
    this.procCode = mutation.proccode;
    if (mutation.argumentids) this.argumentIds = JSON.parse(mutation.argumentids);
    if (mutation.argumentnames) this.argumentNames = JSON.parse(mutation.argumentnames);
    if (mutation.argumentdefaults) this.argumentDefaults = JSON.parse(mutation.argumentdefaults);
    this.hasNext = mutation.hasnext || false;
  }
};

export class Block {
  public readonly id: string;
  public readonly opcode: string;
  public readonly next: string | null;
  public readonly inputs: Inputs;
  public readonly fields: Fields;
  public readonly mutation?: Mutation;

  public constructor(id: string, block: any) {
    this.id = id;
    this.opcode = block.opcode;
    this.next = block.next;
    this.inputs = block.inputs;
    this.fields = block.fields;
    if (block.mutation) this.mutation = new Mutation(block.mutation);
  }
}
