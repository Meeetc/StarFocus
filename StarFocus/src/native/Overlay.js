// JavaScript Bridge — Overlay Native Module
import { NativeModules, Platform } from 'react-native';

const { OverlayModule } = NativeModules;

/**
 * Check if overlay permission is granted.
 * @returns {Promise<boolean>}
 */
export async function hasOverlayPermission() {
    if (Platform.OS !== 'android') return false;
    return await OverlayModule.hasPermission();
}

/**
 * Open system settings to request overlay permission.
 */
export function requestOverlayPermission() {
    if (Platform.OS !== 'android') return;
    OverlayModule.requestPermission();
}

/**
 * Show a deterrent overlay on screen.
 * @param {string} message - Message to display
 * @param {'breathing'|'greyscale'|'vibration'} level - Intervention level
 */
export function showOverlay(message, level = 'breathing') {
    if (Platform.OS !== 'android' || !OverlayModule) return;
    OverlayModule.showOverlay(message, level);
}

/**
 * Hide the deterrent overlay.
 */
export function hideOverlay() {
    if (Platform.OS !== 'android' || !OverlayModule) return;
    OverlayModule.hideOverlay();
}

/**
 * Check if overlay is currently visible.
 * @returns {Promise<boolean>}
 */
export async function isOverlayVisible() {
    if (Platform.OS !== 'android') return false;
    return await OverlayModule.isVisible();
}

export default {
    hasOverlayPermission,
    requestOverlayPermission,
    showOverlay,
    hideOverlay,
    isOverlayVisible,
};
