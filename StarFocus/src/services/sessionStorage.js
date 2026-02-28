// Focus Session Storage Service — AsyncStorage-based persistence
// Stores focus sprint sessions locally for stats, charts, and streaks
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@starfocus_sessions';
const STREAK_KEY = '@starfocus_streak';

// ──────────────── Session CRUD ────────────────

/**
 * Get all saved focus sessions.
 * @returns {Promise<Array>}
 */
export async function getSessions() {
    try {
        const json = await AsyncStorage.getItem(SESSIONS_KEY);
        return json ? JSON.parse(json) : [];
    } catch (error) {
        console.error('Failed to load sessions:', error);
        return [];
    }
}

/**
 * Save a completed focus session.
 * @param {Object} session
 * @returns {Promise<Object>} The saved session with generated ID
 */
export async function saveSession(session) {
    try {
        const sessions = await getSessions();
        const newSession = {
            id: `session_${Date.now()}`,
            ...session,
            savedAt: new Date().toISOString(),
        };
        sessions.push(newSession);
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
        return newSession;
    } catch (error) {
        console.error('Failed to save session:', error);
        throw error;
    }
}

// ──────────────── Aggregated Stats ────────────────

/**
 * Get profile stats computed from all sessions.
 * @returns {Promise<Object>}
 */
export async function getProfileStats() {
    const sessions = await getSessions();
    const totalSprints = sessions.length;
    const totalFocusMinutes = sessions.reduce((sum, s) => sum + (s.deepWorkMinutes || 0), 0);
    const totalFocusHours = Math.round(totalFocusMinutes / 60 * 10) / 10; // 1 decimal

    return {
        totalSprints,
        totalFocusMinutes,
        totalFocusHours,
    };
}

/**
 * Get sessions grouped by date for charts.
 * @param {number} days - Number of past days to include
 * @returns {Promise<Object>} { labels, scores, minutes }
 */
export async function getSessionsByDay(days = 7) {
    const sessions = await getSessions();
    const now = new Date();
    const labels = [];
    const scores = [];
    const minutes = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const daySessions = sessions.filter(s => {
            const sDate = (s.startTime || s.savedAt || '').split('T')[0];
            return sDate === dateStr;
        });

        labels.push(dayNames[date.getDay()]);
        const dayScore = daySessions.length > 0
            ? Math.round(daySessions.reduce((sum, s) => sum + (s.adjustedScore || 0), 0) / daySessions.length)
            : 0;
        scores.push(dayScore);
        minutes.push(daySessions.reduce((sum, s) => sum + (s.deepWorkMinutes || 0), 0));
    }

    return { labels, scores, minutes };
}

/**
 * Get heatmap data for the contribution graph.
 * @param {number} days - Number of past days
 * @returns {Promise<Array>} Array of { date, count }
 */
export async function getHeatmapData(days = 90) {
    const sessions = await getSessions();
    const counts = {};

    sessions.forEach(s => {
        const date = (s.startTime || s.savedAt || '').split('T')[0];
        if (date) {
            counts[date] = (counts[date] || 0) + 1;
        }
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

// ──────────────── Streak Persistence ────────────────

/**
 * Get current streak data.
 * @returns {Promise<Object>}
 */
export async function getStreakData() {
    try {
        const json = await AsyncStorage.getItem(STREAK_KEY);
        return json ? JSON.parse(json) : {
            currentStreak: 0,
            longestStreak: 0,
            freezeTokens: 0,
            lastFocusDate: null,
        };
    } catch (error) {
        console.error('Failed to load streak:', error);
        return { currentStreak: 0, longestStreak: 0, freezeTokens: 0, lastFocusDate: null };
    }
}

/**
 * Save updated streak data.
 * @param {Object} streakData
 */
export async function saveStreakData(streakData) {
    try {
        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
    } catch (error) {
        console.error('Failed to save streak:', error);
    }
}

export default {
    getSessions,
    saveSession,
    getProfileStats,
    getSessionsByDay,
    getHeatmapData,
    getStreakData,
    saveStreakData,
};
