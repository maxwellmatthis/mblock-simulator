import { Std, StdOps, INTERRUPT, StdHats } from "./std";
import { type Ops, noop, type Block } from "../block";
import type { Context } from "../context";

type Button = "a" | "b";
type Direction = "up" | "down" | "left" | "right" | "middle";
type Tilt = "is_waveright" | "is_waveleft" | "is_waveup" | "is_wavedown" | "is_clockwise" | "is_anticlockwise" | "is_freefall" | "is_shake";
// TODO: add other LED types
type LEDs = "all";

export const CyberPIOps: Ops<CyberPI> = {
  // Events
  "cyberpi.cyberpi_when_launch": noop,
  "cyberpi.cyberpi_when_button_press": (self, c, b, actual) => (c.decodeField(b.fields["fieldMenu_2"]).toLowerCase() !== actual.toLowerCase() ? INTERRUPT : null),
  "cyberpi.cyberpi_when_direction_key_press": (self, c, b, actual) => (c.decodeField(b.fields["fieldMenu_2"]).toLowerCase() !== actual.toLowerCase() ? INTERRUPT : null),
  "cyberpi.cyberpi_when_detect_action": (self, c, b, actual) => (c.decodeField(b.fields["tilt"]) !== actual ? INTERRUPT : null),
  "cyberpi.cyberpi_when_detect_attitude": (self, c, b) => { },
  "cyberpi.cyberpi_when_sensor_value_bigger_or_smaller_than": (self, c, b) => { },
  "cyberpi.cyberpi_wifi_broadcast_when_received_message": (self, c, b) => { },

  // Sensors
  "cyberpi.cyberpi_detect_attitude": (self, c, b) => { },
  "cyberpi.cyberpi_detect_action": (self, c, b) => { },
  "cyberpi.cyberpi_battery_macaddress_blename_and_so_on": (self, c, b) => { },
  "cyberpi.cyberpi_loudness": (self, c, b) => { },
  "cyberpi.cyberpi_brightness": (self, c, b) => { },
  "cyberpi.cyberpi_shaked_value": (self, c, b) => { },
  "cyberpi.cyberpi_wave_angle": (self, c, b) => { },
  "cyberpi.cyberpi_wave_speed": (self, c, b) => { },
  "cyberpi.cyberpi_tilt_degree": (self, c, b) => { },
  "cyberpi.cyberpi_axis_acceleration": (self, c, b) => { },
  "cyberpi.cyberpi_axis_angle_speed": (self, c, b) => { },
  "cyberpi.cyberpi_axis_rotation_angle": (self, c, b) => { },
  "cyberpi.cyberpi_button_press": (self, c, b) => { },
  "cyberpi.cyberpi_button_count": (self, c, b) => { },
  "cyberpi.cyberpi_direction_key_press": (self, c, b) => { },
  "cyberpi.cyberpi_direction_key_count": (self, c, b) => { },
  "cyberpi.cyberpi_reset_axis_rotation_angle": (self, c, b) => { },
  "cyberpi.cyberpi_reset_yaw": (self, c, b) => { },

  // Audio
  "cyberpi.cyberpi_get_volume": (self, c, b) => { },
  "cyberpi.cyberpi_set_volume": (self, c, b) => { },
  "cyberpi.cyberpi_add_volume": (self, c, b) => { },
  "cyberpi.cyberpi_get_audio_speed": (self, c, b) => { },
  "cyberpi.cyberpi_set_audio_speed": (self, c, b) => { },
  "cyberpi.cyberpi_add_audio_speed": (self, c, b) => { },
  "cyberpi.cyberpi_stop_audio": (self, c, b) => { },
  "cyberpi.cyberpi_play_buzzer_tone": (self, c, b) => { },
  "cyberpi.cyberpi_play_buzzer_tone_with_time": (self, c, b) => { },
  "cyberpi.cyberpi_play_audio_3": (self, c, b) => { },
  "cyberpi.cyberpi_play_audio_3_file_name_menu": (self, c, b) => { },
  "cyberpi.cyberpi_play_audio_until_3": (self, c, b) => { },
  "cyberpi.cyberpi_play_audio_until_3_file_name_menu": (self, c, b) => { },
  "cyberpi.cyberpi_play_music_with_tone_and_note_2": (self, c, b) => { },
  "note": (self, c, b) => { },
  "cyberpi.cyberpi_play_music_with_note": (self, c, b) => { },
  "cyberpi.cyberpi_play_music_with_note_fieldMenu_1_menu": (self, c, b) => { },
  "cyberpi.cyberpi_start_record": (self, c, b) => { },
  "cyberpi.cyberpi_stop_record": (self, c, b) => { },
  "cyberpi.cyberpi_play_record": (self, c, b) => { },
  "cyberpi.cyberpi_play_record_until": (self, c, b) => { },

  // LED
  "cyberpi.cyberpi_play_led_animation_until": (self, c, b) => { },
  "cyberpi.cyberpi_show_led": (self, c, b) => { },
  "cyberpi.cyberpi_led_show_single_with_color_2": (self, c, b) => { },
  "cyberpi.cyberpi_led_show_single_with_color_2_fieldMenu_1_menu": (self, c, b) => { },
  "cyberpi.cyberpi_led_show_single_with_color_and_time_2": (self, c, b) => { },
  "cyberpi.cyberpi_led_show_single_with_color_and_time_2_fieldMenu_1_menu": (self, c, b) => { },
  "cyberpi.cyberpi_led_show_single_with_rgb_2": (self, c, b) => { },
  "cyberpi.cyberpi_led_show_single_with_rgb_2_fieldMenu_1_menu": (self, c, b) => { },
  "cyberpi.cyberpi_led_show_single_with_rgb_and_time": (self, c, b) => { },
  "cyberpi.cyberpi_led_show_single_with_rgb_and_time_fieldMenu_1_menu": (self, c, b) => { },
  "cyberpi.cyberpi_led_off_2": (self, c, b) => { },
  "cyberpi.cyberpi_led_off_2_fieldMenu_1_menu": (self, c, b) => { },
  "cyberpi.cyberpi_move_led": (self, c, b) => { },
  "cyberpi.cyberpi_get_led_brightness": (self, c, b) => { },
  "cyberpi.cyberpi_set_led_brightness": (self, c, b) => { },
  "cyberpi.cyberpi_add_led_brightness": (self, c, b) => { },

  // Bottom light (RGB sensor)
  "mbuild_quad_color_sensor.BLOCK_1618382823173": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1618382823173_index_menu": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1620904215289": (self, c, b) => { },
  "mbuild_quad_color_sensor.BLOCK_1620904215289_index_menu": (self, c, b) => { },

  // Net
  "cyberpi.cyberpi_set_wifi_broadcast": (self, c, b) => { },
  "cyberpi.cyberpi_set_wifi_broadcast_with_value": (self, c, b) => { },
  "cyberpi.cyberpi_set_wifi_channels": (self, c, b) => { },
  "cyberpi.cyberpi_wifi_set": (self, c, b) => { },
  "cyberpi.cyberpi_wifi_is_connect": (self, c, b) => { },
  "cyberpi.cyberpi_wifi_reconnect": (self, c, b) => { },
  "cyberpi.cyberpi_wifi_disconnect": (self, c, b) => { },
  "cyberpi.cyberpi_wifi_broadcast_get_value": (self, c, b) => { },

  // MBot2
  "cyberpi.cyberpi_timer_reset": (self, c, b) => { },
  "cyberpi.cyberpi_timer_get": (self, c, b) => { },
  "cyberpi.cyberpi_name": (self, c, b) => { },

  // Display
  "cyberpi.cyberpi_display_println": async (self, c, b) => { console.log("println", await c.decodeInput(b.inputs["string_2"])); },
  "cyberpi.cyberpi_display_print": (self, c, b) => { },
  "cyberpi.cyberpi_console_set_font": (self, c, b) => { },
  "cyberpi.cyberpi_console_set_font_inputMenu_1_menu": (self, c, b) => { },
  "cyberpi.cyberpi_display_label_show_at_somewhere_with_size": (self, c, b) => { },
  "cyberpi.cyberpi_display_label_show_at_somewhere_with_size_inputMenu_4_menu": (self, c, b) => { },
  "cyberpi.cyberpi_display_label_show_label_xy_with_size": (self, c, b) => { },
  "cyberpi.cyberpi_display_label_show_label_xy_with_size_inputMenu_4_menu": (self, c, b) => { },
  "cyberpi.cyberpi_display_line_chart_add_data": (self, c, b) => { },
  "cyberpi.cyberpi_display_bar_chart_set_interval": (self, c, b) => { }, // not a typo
  "cyberpi.cyberpi_display_bar_chart_add_data": (self, c, b) => { },
  "cyberpi.cyberpi_display_table_add_data_at_row_column_2": (self, c, b) => { },
  "cyberpi.cyberpi_display_table_add_data_at_row_column_2_fieldMenu_1_menu": (self, c, b) => { },
  "cyberpi.cyberpi_display_set_brush_with_color": (self, c, b) => { },
  "cyberpi.cyberpi_display_set_brush_with_r_g_b": (self, c, b) => { },
  "cyberpi.cyberpi_display_clear": (self, c, b) => { },
  "cyberpi.cyberpi_display_rotate_to_2": (self, c, b) => { },
  "cyberpi.cyberpi_display_rotate_to_2_fieldMenu_1_menu": (self, c, b) => { },
};

const CyberPIHats = [
  "cyberpi.cyberpi_when_launch",
  "cyberpi.cyberpi_when_button_press",
  "cyberpi.cyberpi_when_direction_key_press",
  "cyberpi.cyberpi_when_detect_action",
  "cyberpi.cyberpi_when_detect_attitude",
  "cyberpi.cyberpi_when_sensor_value_bigger_or_smaller_than",
  "cyberpi.cyberpi_wifi_broadcast_when_received_message"
];

const ops = Object.assign(CyberPIOps, StdOps);
const hats = [...StdHats, ...CyberPIHats];
export class CyberPI extends Std {
  // TODO: measure
  protected physicalDiameterCm = 5;
  public readonly audio = new Audio();
  public readonly led = new LED();
  public readonly display = new Display();
  public readonly motionSensing = new MotionSensing();
  public readonly sensing = new Sensing();

  protected opcodeSupported(opcode: string): boolean {
    return opcode in ops;
  }

  public async runOp(stack: Context, block: Block, options: any) {
    return await ops[block.opcode](this, stack, block, options);
  }

  protected isHat(opcode: string): boolean {
    return hats.includes(opcode);
  }

  public activate(): void {
    this.runHatBlocks("cyberpi.cyberpi_when_launch", null);
  }
}

class Audio {

}

class LED {

}

class Display {

}

class MotionSensing {

}

class Sensing {

}
