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

export const MBot2Ops: Ops<MBot2> = {
  "mbot2.mbot2_set_para": (self, c, b) => { },

  // Quad Color Sensor
  "mbuild_quad_color_sensor.BLOCK_1626250042594": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1626250042594_index_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1618397596925": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1618397596925_index_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1618397679204": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1618397679204_index_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_get_rgb_gray_light": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_get_rgb_gray_light_index_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_get_rgb_gray_light_inputMenu_2_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_get_rgb_gray_light_inputMenu_3_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_get_off_track": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_get_off_track_index_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_get_sta_with_inputMenu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_get_sta_with_inputMenu_index_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_get_sta_with_inputMenu_inputMenu_2_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1618364921511": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1618364921511_index_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1618364921511_inputMenu_2_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_is_line_and_background": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_is_line_and_background_index_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_is_line_and_background_inputMenu_2_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.mbuild_quad_color_sensor_is_line_and_background_inputMenu_3_menu": (self, c, b) => { },

  // Ultrasonic Sensor
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_get_distance": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_get_distance_index_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_out_of_range": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_out_of_range_index_menu": (self, c, b) => { },

  // Ultrasonic Sensor Ambient Light
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_set_bri": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_set_bri_index_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_set_bri_order_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_add_bri": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_add_bri_index_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_add_bri_order_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_get_bri": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_get_bri_index_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_get_bri_order_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_off_led": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_off_led_index_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_off_led_inputMenu_3_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_show_emotion": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_show_emotion_index_menu": (self, c, b) => { },
  "cyberpi_mbuild_ultrasonic2.mbuild_ultrasonic2_show_emotion_emotion_menu": (self, c, b) => { },

  // Motors
  "mbot2.mbot2_move_direction_with_rpm": (self, c, b) => { },
  "mbot2.mbot2_move_direction_with_time": (self, c, b) => { },
  "mbot2.mbot2_move_straight_with_cm_and_inch": async (self, c, b) => {
    const distance = await c.decodeInput(b.inputs["POWER"]);
    // possible directions are "forward" and "backward"
    const directionFactor = c.decodeField(b.fields["DIRECTION"]) === "forward" ? 1 : -1;
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
  "mbot2.mbot2_encoder_motor_set": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_set_inputMenu_1_menu": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_set_with_time": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_set_with_time_fieldMenu_1_menu": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_stop": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_reset_angle": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_reset_angle_inputMenu_1_menu": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_lock_and_unlock": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_lock_and_unlock_inputMenu_1_menu": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_set_with_time_angle_and_circle": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_set_with_time_angle_and_circle_fieldMenu_1_menu": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_get_speed": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_get_speed_inputMenu_2_menu": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_get_angle": (self, c, b) => { },
  "mbot2.mbot2_encoder_motor_get_angle_inputMenu_1_menu": (self, c, b) => { },
};

const ops = Object.assign(MBot2Ops, CyberPIOps);
export class MBot2 extends CyberPI {
  public readonly spriteImageName = "mbot2.png";
  public readonly physicalLengthCm = 17;
  public readonly physicalWidthCm = 17;
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
