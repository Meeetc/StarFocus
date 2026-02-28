// Workload Score Calculator
// Workload = Σ(priority_i × (1 − completion_i)) normalized to 0–100

/**
 * Calculate the workload score from all active tasks.
 * @param {Array} tasks - Array of task objects with priorityScore and completionPercent
 * @returns {Object} { score, level }
 */
export function calculateWorkloadScore(tasks) {
    if (!tasks || tasks.length === 0) {
        return { score: 0, level: 'low' };
    }

    // Sum weighted incompleteness
    const rawScore = tasks.reduce((sum, task) => {
        const priority = task.priorityScore || 0;
        const completionFactor = 1 - (task.completionPercent || 0) / 100;
        return sum + priority * completionFactor;
    }, 0);

    // Normalize to 0–100 using average priority weighted by task count
    const avgPriority = rawScore / tasks.length;
    const countFactor = Math.min(tasks.length / 8, 1); // More tasks = higher load, caps at 8
    const score = Math.min(Math.round(avgPriority * countFactor * 100), 100);

    return {
        score,
        level: getWorkloadLevel(score),
        timestamp: new Date().toISOString(),
    };
}

/**
 * Get workload level string from score.
 * @param {number} score - 0 to 100
 * @returns {string} low | moderate | high
 */
export function getWorkloadLevel(score) {
    if (score >= 60) return 'high';
    if (score >= 30) return 'moderate';
    return 'low';
}

/**
 * Get intervention timer thresholds based on workload level.
 * Returns thresholds in minutes.
 * @param {string} level - low | moderate | high
 * @returns {Object} { breathing, greyscale, vibration }
 */
export function getInterventionThresholds(level) {
    switch (level) {
        case 'high':
            return { breathing: 30, greyscale: 60, vibration: 90 };
        case 'moderate':
            return { breathing: 45, greyscale: 90, vibration: 135 };
        case 'low':
        default:
            return { breathing: 60, greyscale: 120, vibration: 180 };
    }
}

export default {
    calculateWorkloadScore,
    getWorkloadLevel,
    getInterventionThresholds,
};
