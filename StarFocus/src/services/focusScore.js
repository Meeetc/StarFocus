// Focus Score Calculator
// FocusScore = deepWorkMinutes / (appSwitches + impulseOpens + 1) × multipliers

/**
 * Calculate the focus score for a session.
 * @param {Object} session
 * @param {number} session.deepWorkMinutes
 * @param {number} session.appSwitches
 * @param {number} session.impulseOpens
 * @param {Object} [session.linkedTask] - The task linked to this session
 * @returns {Object} { rawScore, multipliers, adjustedScore }
 */
export function calculateFocusScore(session) {
    const { deepWorkMinutes, appSwitches = 0, impulseOpens = 0, linkedTask } = session;

    // Base score
    const rawScore = deepWorkMinutes / (appSwitches + impulseOpens + 1);

    // Determine applicable multipliers
    const multipliers = [];
    let multiplierProduct = 1.0;

    // Working on a Red-priority task → 1.5×
    if (linkedTask && linkedTask.priorityZone === 'red') {
        multipliers.push('red_priority');
        multiplierProduct *= 1.5;
    }

    // Working on a quiz/assessment → 1.3×
    if (linkedTask && (linkedTask.workType === 'SHORT_ANSWER_QUESTION' || linkedTask.workType === 'MULTIPLE_CHOICE')) {
        multipliers.push('quiz_task');
        multiplierProduct *= 1.3;
    }

    // Deep work session (≥ 45 min) → 1.1×
    if (deepWorkMinutes >= 45) {
        multipliers.push('deep_work');
        multiplierProduct *= 1.1;
    }

    // Zero flagged app opens → 1.3×
    if (impulseOpens === 0) {
        multipliers.push('zero_opens');
        multiplierProduct *= 1.3;
    }

    const adjustedScore = Math.round(rawScore * multiplierProduct * 100) / 100;

    return {
        rawScore: Math.round(rawScore * 100) / 100,
        multipliers,
        adjustedScore,
    };
}

/**
 * Calculate daily aggregated score.
 * @param {Array} sessions - Array of session objects with adjustedScore and deepWorkMinutes
 * @returns {Object} Daily score summary
 */
export function calculateDailyScore(sessions) {
    if (!sessions || sessions.length === 0) {
        return {
            averageFocusScore: 0,
            totalFocusMinutes: 0,
            sessionsCount: 0,
        };
    }

    const totalFocusMinutes = sessions.reduce((sum, s) => sum + (s.deepWorkMinutes || 0), 0);
    const averageFocusScore = sessions.reduce((sum, s) => sum + (s.adjustedScore || 0), 0) / sessions.length;

    return {
        averageFocusScore: Math.round(averageFocusScore * 100) / 100,
        totalFocusMinutes,
        sessionsCount: sessions.length,
    };
}

export default {
    calculateFocusScore,
    calculateDailyScore,
};
