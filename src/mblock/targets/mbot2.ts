import { MINUTE_MS, DEG_TO_RAD_FACTOR, CM_TO_PIXEL_FACTOR } from "../physics-constants";
import type { MoveXYFn, RotateFn, GetRotationFn } from "./std";
import { CyberPI, CyberPIOps } from "./cyberpi";
import type { Block, Ops } from "../block";
import type { Context } from "../context";

const DRIVE_DELTA_MS = 30;
const DRIVE_DELTAS_PER_MINUTE_MS = MINUTE_MS / DRIVE_DELTA_MS;
const TURN_TIME_PER_DEGREE_MS = 10;
const WHEEL_CIRCUMFRENCE_CM = 6 * Math.PI;
const DEFAULT_RPM = 16;

function directionToFactor(direction: string): number {
  return direction === "forward" ? 1 : -1;
}

export const MBot2Ops: Ops<MBot2> = {
  // Motors
  "mbot2.mbot2_move_direction_with_rpm": async (self, c, b) => self.motors.setRPMs(await c.decodeInput(b.inputs["POWER"]) * directionToFactor(c.decodeField(b.fields["DIRECTION"]))),
  "mbot2.mbot2_move_direction_with_time": async (self, c, b) => {
    self.motors.setRPMs(await c.decodeInput(b.inputs["POWER"]) * directionToFactor(c.decodeField(b.fields["DIRECTION"])));
    setTimeout(() => self.motors.setRPMs(0), await c.decodeInput(b.inputs["TIME"]) * 1000);
  },
  "mbot2.mbot2_move_straight_with_cm_and_inch": async (self, c, b) => {
    const distance = await c.decodeInput(b.inputs["POWER"]);
    // possible directions are "forward" and "backward"
    const directionFactor = directionToFactor(c.decodeField(b.fields["DIRECTION"]));
    // possible unit are cm and inch
    const unitFactor = c.decodeField(b.fields["fieldMenu_3"]) === "cm" ? 1 : 2.54;
    self.motors.setRPMs(DEFAULT_RPM * directionFactor);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        self.motors.setRPMs(0);
        resolve();
      }, (distance * unitFactor) / (DEFAULT_RPM * WHEEL_CIRCUMFRENCE_CM) * MINUTE_MS);
    });
  },
  "mbot2.mbot2_cw_and_ccw_with_angle": async (self, c, b) => {
    await self.motors.rotateOnTheSpot(
      Math.abs(await c.decodeInput(b.inputs["ANGLE"])),
      c.decodeField(b.fields["fieldMenu_1"]) === "ccw"
    );
  },
  "mbot2.mbot2_encoder_motor_drive_speed2": async (self, c, b) => {
    const leftPower = await c.decodeInput(b.inputs["LEFT_POWER"]);
    // The right encoder motor spins backwards relative to the forward direction
    // of travel and is multiplied by `-1` to normalize the spin again.
    const rightPower = await c.decodeInput(b.inputs["RIGHT_POWER"]) * -1;
    self.motors.setRPMs(leftPower, rightPower);
  },
};

const ops = Object.assign(MBot2Ops, CyberPIOps);
export class MBot2 extends CyberPI {
  public readonly physicsEnabled = true;
  public readonly motors = new Motors();

  protected opcodeSupported(opcode: string): boolean {
    return opcode in ops;
  }

  public async runOp(stack: Context, block: Block, option: any) {
    return await ops[block.opcode](this, stack, block, option);
  }

  public registerSpriteMovement(moveXY: MoveXYFn, rotate: RotateFn, getRotation: GetRotationFn) {
    this.motors.registerSpriteMovement(moveXY, rotate, getRotation);
  }

  protected stopCustom(): void {
    this.motors.clearRotationInterval();
  }
}

class Motors {
  private rotationInterval: NodeJS.Timer | undefined;
  public moveXY: MoveXYFn = () => { };
  public rotate: RotateFn = () => { };
  public getRotation: GetRotationFn = () => 0;

  public registerSpriteMovement(moveXY: MoveXYFn, rotate: RotateFn, getRotation: GetRotationFn) {
    this.moveXY = moveXY;
    this.rotate = rotate;
    this.getRotation = getRotation;
  }

  public clearRotationInterval() {
    clearInterval(this.rotationInterval);
  }

  public replaceRotationInterval(interval: NodeJS.Timer) {
    this.clearRotationInterval();
    this.rotationInterval = interval;
  }

  public async rotateOnTheSpot(degrees: number, counterClockWise: boolean) {
    return new Promise<void>((resolve) => {
      const signedDegree = counterClockWise ? 1 : -1;
      let degreesLeft = degrees;
      this.replaceRotationInterval(setInterval(() => {
        if (degreesLeft === 0) {
          this.clearRotationInterval();
          resolve();
        } else {
          this.rotate(signedDegree);
          degreesLeft -= 1;
        }
      }, TURN_TIME_PER_DEGREE_MS));
    });
  }

  /**
   * Sets the rotations per minute of the encoder motors.
   * @param leftRPM The speed of the left motor.
   * @param rightRPM The speed of the right motor.
   * 
   * If `rightRPM` is not specified it will be set to `leftRPM`.
   */
  public setRPMs(leftRPM: number, rightRPM?: number) {
    if (typeof rightRPM === "undefined") rightRPM = leftRPM;
    const leftDistancePerDriveDelta = (leftRPM * WHEEL_CIRCUMFRENCE_CM) / DRIVE_DELTAS_PER_MINUTE_MS;
    const rightDistancePerDriveDelta = (rightRPM * WHEEL_CIRCUMFRENCE_CM) / DRIVE_DELTAS_PER_MINUTE_MS;
    this.replaceRotationInterval(setInterval(() => {
      const rotationRadians = this.getRotation() * DEG_TO_RAD_FACTOR;
      const rotationRadiansCosine = Math.cos(rotationRadians);
      const rotationRadiansSine = Math.sin(rotationRadians);

      const left_dx = rotationRadiansCosine * leftDistancePerDriveDelta;
      const left_dy = rotationRadiansSine * leftDistancePerDriveDelta;
      const right_dx = rotationRadiansCosine * rightDistancePerDriveDelta;
      const right_dy = rotationRadiansSine * rightDistancePerDriveDelta;

      // TODO: handle unequal RPM resulting in rotation
      // const left_dxy_squared = left_dx ** 2 + left_dy ** 2;
      // const right_dxy_squared = right_dx ** 2 + right_dy ** 2;
      // if (left_dxy_squared > right_dxy_squared) this.rotate(Math.sqrt(left_dxy_squared) - Math.sqrt(right_dxy_squared));
      // else if (right_dxy_squared > left_dxy_squared) this.rotate(-1 * (Math.sqrt(right_dxy_squared) - Math.sqrt(left_dxy_squared)));
      this.moveXY(Math.min(left_dx, right_dx) * CM_TO_PIXEL_FACTOR, Math.min(left_dy, right_dy) * CM_TO_PIXEL_FACTOR);
    }, DRIVE_DELTA_MS));
  }
}
