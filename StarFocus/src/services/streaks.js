// Streak Tracker
// Streaks require configurable daily minimum (default 30 min focus).
// Freeze tokens earned at 7-day milestones.

/**
 * Update streak data after a day's sessions.
 * @param {Object} currentStreak - Current streak state
 * @param {number} currentStreak.currentStreak - Days in current streak
 * @param {number} currentStreak.longestStreak - All-time longest
 * @param {number} currentStreak.freezeTokens - Available freeze tokens
 * @param {string} currentStreak.lastFocusDate - YYYY-MM-DD
 * @param {number} todayMinutes - Total focus minutes today
 * @param {number} [threshold=30] - Minimum minutes to count as a streak day
 * @returns {Object} Updated streak state
 */
export function updateStreak(currentStreak, todayMinutes, threshold = 30) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let { currentStreak: streak, longestStreak, freezeTokens, lastFocusDate } = currentStreak;

    if (todayMinutes >= threshold) {
        // Met the threshold today
        if (lastFocusDate === yesterday || lastFocusDate === today) {
            // Continue or same-day update
            if (lastFocusDate !== today) {
                streak += 1;
            }
        } else {
            // Streak broken, start new
            streak = 1;
        }
        lastFocusDate = today;
    } else if (lastFocusDate === yesterday && freezeTokens > 0) {
        // Missed today but have freeze token
        // Don't auto-use — user must explicitly activate
    } else if (lastFocusDate !== today && lastFocusDate !== yesterday) {
        // Streak broken
        streak = 0;
    }

    // Update longest
    longestStreak = Math.max(longestStreak, streak);

    // Award freeze token at 7-day milestones
    const newFreezeTokens = streak > 0 && streak % 7 === 0 ? freezeTokens + 1 : freezeTokens;

    return {
        currentStreak: streak,
        longestStreak,
        freezeTokens: newFreezeTokens,
        lastFocusDate,
    };
}

/**
 * Use a freeze token to preserve a streak.
 * @param {Object} streakData
 * @returns {Object} Updated streak data
 */
export function useFreezeToken(streakData) {
    if (streakData.freezeTokens <= 0) {
        return { ...streakData, error: 'No freeze tokens available' };
    }

    return {
        ...streakData,
        freezeTokens: streakData.freezeTokens - 1,
        lastFocusDate: new Date().toISOString().split('T')[0],
    };
}

/**
 * Check if a streak milestone has been reached.
 * @param {number} streakDays
 * @returns {Object|null} Milestone info or null
 */
export function checkMilestone(streakDays) {
    const milestones = [7, 14, 30, 60, 100];
    if (milestones.includes(streakDays)) {
        return {
            days: streakDays,
            message: `${streakDays}-day streak! You're on fire!`,
            freezeTokenAwarded: streakDays % 7 === 0,
        };
    }
    return null;
}

export default {
    updateStreak,
    useFreezeToken,
    checkMilestone,
};
