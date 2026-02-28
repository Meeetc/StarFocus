// JavaScript Bridge — Vibration Native Module
import { NativeModules, Platform } from 'react-native';

const { VibrationModule } = NativeModules;

/**
 * Vibrate with a custom waveform pattern.
 * @param {number[]} pattern - Alternating wait/vibrate durations in ms
 * @param {number[]} amplitudes - Amplitude for each segment (0=off, 1-255)
 * @param {number} repeat - Index to repeat from (-1 for no repeat)
 */
export function vibrateWaveform(pattern, amplitudes, repeat = -1) {
    if (Platform.OS !== 'android' || !VibrationModule) return;
    VibrationModule.vibrateWaveform(pattern, amplitudes, repeat);
}

/**
 * Single pulse vibration.
 * @param {number} durationMs - Duration in milliseconds
 * @param {number} amplitude - Intensity 1–255
 */
export function vibratePulse(durationMs = 200, amplitude = 128) {
    if (Platform.OS !== 'android' || !VibrationModule) return;
    VibrationModule.vibratePulse(durationMs, amplitude);
}

/**
 * Uncomfortable escalating vibration for distraction deterrence.
 */
export function vibrateDeterrent() {
    if (Platform.OS !== 'android' || !VibrationModule) return;
    VibrationModule.vibrateDeterrent();
}

/**
 * Gentle success haptic feedback.
 */
export function vibrateSuccess() {
    if (Platform.OS !== 'android' || !VibrationModule) return;
    VibrationModule.vibrateSuccess();
}

/**
 * Cancel any ongoing vibration.
 */
export function cancelVibration() {
    if (Platform.OS !== 'android' || !VibrationModule) return;
    VibrationModule.cancel();
}

export default {
    vibrateWaveform,
    vibratePulse,
    vibrateDeterrent,
    vibrateSuccess,
    cancelVibration,
};
