import { CyberPI, CyberPIOps } from "./cyberpi";
import type { Block, Ops } from "../block";
import type { Context } from "../context";

// TODO: check validity
type Direction = 'forward' | 'backward';

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
  "mbot2.mbot2_move_straight_with_cm_and_inch": (self, c, b) => { },
  "mbot2.mbot2_cw_and_ccw_with_angle": (self, c, b) => { },
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
  // TODO: measure
  protected physicalDiameterCm = 15;

  protected opcodeSupported(opcode: string): boolean {
    return opcode in ops;
  }

  public async runOp(stack: Context, block: Block, options: any) {
    return await MBot2Ops[block.opcode](this, stack, block, options);
  }
}
