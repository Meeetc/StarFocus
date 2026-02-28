// Overlay Module — In-app Alert-based deterrent overlays
// Replaces the bare NativeModule stub that required SYSTEM_ALERT_WINDOW permission.
// Uses React Native Alert for immediate compatibility without any native Kotlin code.
import { Alert } from 'react-native';
import { vibrateDeterrent } from './Vibration';

const LEVEL_CONFIG = {
    breathing: {
        title: '🧘 Take a Breath',
        buttonText: 'Back to Work',
    },
    greyscale: {
        title: '⚠️ Getting Distracted',
        buttonText: 'Refocus Now',
    },
    vibration: {
        title: '🚨 High Distraction!',
        buttonText: 'I\'ll Refocus',
    },
};

let _overlayVisible = false;

/**
 * Check if overlay permission is granted.
 * Always true for the Alert-based implementation.
 * @returns {Promise<boolean>}
 */
export async function hasOverlayPermission() {
    return true; // Alert needs no special permission
}

/**
 * No-op: No system permission needed for Alert overlays.
 */
export function requestOverlayPermission() {
    // Nothing needed
}

/**
 * Show a deterrent overlay as a blocking Alert.
 * @param {string} message - Message to display
 * @param {'breathing'|'greyscale'|'vibration'} level - Intervention level
 */
export function showOverlay(message, level = 'breathing') {
    if (_overlayVisible) return; // Prevent stacking alerts
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.breathing;

    if (level === 'vibration') {
        vibrateDeterrent();
    }

    _overlayVisible = true;
    Alert.alert(
        config.title,
        message,
        [{ text: config.buttonText, onPress: () => { _overlayVisible = false; } }],
        { cancelable: false }
    );
}

/**
 * Dismiss the overlay (no-op for Alert — user must tap the button).
 */
export function hideOverlay() {
    _overlayVisible = false;
}

/**
 * Check if overlay is currently visible.
 * @returns {Promise<boolean>}
 */
export async function isOverlayVisible() {
    return _overlayVisible;
}

export default {
    hasOverlayPermission,
    requestOverlayPermission,
    showOverlay,
    hideOverlay,
    isOverlayVisible,
};
