// JavaScript Bridge — UsageStats Native Module
import { NativeModules, Platform } from 'react-native';

const { UsageStatsModule } = NativeModules;

/**
 * Check if usage stats permission is granted.
 * @returns {Promise<boolean>}
 */
export async function hasUsagePermission() {
    if (Platform.OS !== 'android') return false;
    return await UsageStatsModule.hasPermission();
}

/**
 * Open system settings to grant usage access.
 */
export function requestUsagePermission() {
    if (Platform.OS !== 'android') return;
    UsageStatsModule.requestPermission();
}

/**
 * Get app usage stats for the given time interval.
 * @param {number} intervalMs - Duration in ms (default 24 hours)
 * @returns {Promise<Array>} Array of { packageName, totalTimeMs, totalTimeMinutes, lastTimeUsed }
 */
export async function getUsageStats(intervalMs = 24 * 60 * 60 * 1000) {
    if (Platform.OS !== 'android') return [];
    return await UsageStatsModule.getUsageStats(intervalMs);
}

/**
 * Get the currently foreground app.
 * @returns {Promise<Object>} { packageName, lastTimeUsed }
 */
export async function getForegroundApp() {
    if (Platform.OS !== 'android') return { packageName: 'unknown' };
    return await UsageStatsModule.getForegroundApp();
}
export const UsageStats = {
    /**
     * Check if usage stats permission is granted.
     * @returns {Promise<boolean>}
     */
    hasPermission: async () => {
        if (Platform.OS !== 'android') return false;
        return await UsageStatsModule.hasPermission();
    },

    /**
     * Open system settings to grant usage access.
     */
    requestPermission: () => {
        if (Platform.OS !== 'android') return;
        UsageStatsModule.requestPermission();
    },

    /**
     * Get app usage stats for the given time interval.
     * @param {number} intervalMs - Duration in ms (default 24 hours)
     * @returns {Promise<Array>} Array of { packageName, totalTimeMs, totalTimeMinutes, lastTimeUsed }
     */
    getUsageStats: async (intervalMs = 24 * 60 * 60 * 1000) => {
        if (Platform.OS !== 'android') return [];
        return await UsageStatsModule.getUsageStats(intervalMs);
    },

    /**
     * Get the currently foreground app.
     * @returns {Promise<Object>} { packageName, lastTimeUsed }
     */
    getForegroundApp: async () => {
        if (Platform.OS !== 'android') return { packageName: 'unknown' };
        return await UsageStatsModule.getForegroundApp();
    },

    /**
     * Get total screen time today in minutes.
     * @returns {Promise<number>}
     */
    getTodayScreenTime: async () => {
        if (Platform.OS !== 'android') return 0;
        return await UsageStatsModule.getTodayScreenTime();
    },

    /**
     * Set sprint active status.
     * @param {boolean} active - Whether the sprint is active.
     */
    setSprintActive: (active) => {
        if (Platform.OS !== 'android') return;
        UsageStatsModule.setSprintActive(active);
    },
};

export default UsageStats;
