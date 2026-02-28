// Vibration Module — Uses expo-haptics for tactile feedback
// Replaces the bare NativeModule stub which had no Kotlin implementation.
import * as Haptics from 'expo-haptics';

/**
 * Vibrate with a custom waveform pattern.
 * Falls back to repeated heavy impacts on Expo.
 * @param {number[]} pattern - Alternating wait/vibrate durations in ms
 */
export function vibrateWaveform(pattern = [], _amplitudes, _repeat) {
    // Expo Haptics doesn't support arbitrary waveforms; use a heavy impact.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/**
 * Single pulse vibration.
 * @param {number} durationMs - Ignored on Expo (haptics are fixed-duration)
 * @param {number} amplitude - Maps to Light/Medium/Heavy
 */
export function vibratePulse(durationMs = 200, amplitude = 128) {
    const style = amplitude > 180
        ? Haptics.ImpactFeedbackStyle.Heavy
        : amplitude > 80
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light;
    Haptics.impactAsync(style);
}

/**
 * Uncomfortable escalating vibration for distraction deterrence.
 * Simulates urgency with notification feedback.
 */
export function vibrateDeterrent() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/**
 * Gentle success haptic feedback.
 */
export function vibrateSuccess() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Cancel any ongoing vibration (no-op on Expo — haptics are fire-and-forget).
 */
export function cancelVibration() {
    // Expo Haptics are instantaneous; nothing to cancel.
}

export default {
    vibrateWaveform,
    vibratePulse,
    vibrateDeterrent,
    vibrateSuccess,
    cancelVibration,
};
