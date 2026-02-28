// UsageStats Module — Graceful no-op shim for Expo builds
// The real Android UsageStatsManager API requires a native Kotlin module and the
// PACKAGE_USAGE_STATS permission, which requires manual user approval in Settings.
// This shim keeps all call sites working while the app tracks focus in-session
// via the sim buttons (or a future native implementation).

/**
 * Check if usage stats permission is granted.
 * @returns {Promise<boolean>} Always false in this shim.
 */
export async function hasUsagePermission() {
    return false;
}

/**
 * Open system settings to grant usage access.
 * No-op in this shim.
 */
export function requestUsagePermission() {
    // Requires native Kotlin integration to open Settings.ACTION_USAGE_ACCESS_SETTINGS
    console.warn('[UsageStats] Native usage stats not available in this build.');
}

/**
 * Get app usage stats for the given time interval.
 * @returns {Promise<Array>} Empty array in this shim.
 */
export async function getUsageStats(_intervalMs) {
    return [];
}

/**
 * Get the currently foreground app.
 * @returns {Promise<Object>} Unknown package in this shim.
 */
export async function getForegroundApp() {
    return { packageName: 'unknown', lastTimeUsed: Date.now() };
}

/**
 * Get total screen time today in minutes.
 * @returns {Promise<number>} Always 0 in this shim.
 */
export async function getTodayScreenTime() {
    return 0;
}

export default {
    hasUsagePermission,
    requestUsagePermission,
    getUsageStats,
    getForegroundApp,
    getTodayScreenTime,
};
