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
export type OpFn<Target> = (self: Target, block: Block, options: any) => any;
export type Ops<Target> = { [index: string]: OpFn<Target>; };

export interface BlockJSON {
  opcode: string,
  next: string | null,
  parent: string | null,
  inputs: Inputs,
  fields: Fields,
  shadow: boolean,
  topLevel: boolean,
}

export class Block {
  public readonly opcode: string;
  public readonly next: string | null;
  public readonly topLevel: boolean;
  public readonly inputs: Inputs;
  public readonly fields: Fields;

  public constructor(block: BlockJSON) {
    this.opcode = block.opcode;
    this.next = block.next;
    this.topLevel = block.topLevel;
    this.inputs = block.inputs;
    this.fields = block.fields;
  }
}
