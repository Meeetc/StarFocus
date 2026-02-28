// Priority Ranking Engine
// Deterministic formula: no LLM dependency
//
// Priority = (gradeWeightage × (1 − completionPercent)) / max(timeRemainingHours, 1) × quizPrepMultiplier
//
// ZONES are time-based (absolute), NOT relative to other tasks.
// This prevents one task's update from shifting another task's zone.

/**
 * Calculate raw priority score for a single task.
 */
export function calculateRawPriority(task) {
    const { gradeWeightage, completionPercent, dueDate, workType, source, priorityScore } = task;

    if (source === 'manual') {
        const normalizedPriority = (priorityScore || 5) / 10;
        const completionFactor = 1 - (completionPercent || 0) / 100;
        const timeRemaining = getTimeRemainingHours(dueDate);
        return (normalizedPriority * completionFactor) / Math.max(timeRemaining, 1);
    }

    const completionFactor = 1 - (completionPercent || 0) / 100;
    const timeRemaining = getTimeRemainingHours(dueDate);
    const quizMultiplier = getQuizPrepMultiplier(workType);
    return ((gradeWeightage || 0.5) * completionFactor) / Math.max(timeRemaining, 1) * quizMultiplier;
}

/**
 * Get hours remaining until deadline.
 * Returns negative values for overdue tasks.
 */
export function getTimeRemainingHours(dueDate) {
    if (!dueDate) return 168; // Default 1 week if no deadline
    const diffMs = new Date(dueDate) - new Date();
    return diffMs / (1000 * 60 * 60); // Can be negative (overdue)
}

/**
 * Get the quiz prep multiplier based on work type.
 */
export function getQuizPrepMultiplier(workType) {
    switch (workType) {
        case 'SHORT_ANSWER_QUESTION':
        case 'MULTIPLE_CHOICE':
            return 1.5;
        default:
            return 1.0;
    }
}

/**
 * Assign priority zone using ABSOLUTE time-based thresholds.
 * This is independent per task — updating one task NEVER changes another's zone.
 *
 * For classroom tasks: based on time remaining
 *   Red    → overdue OR < 24 hours
 *   Amber  → 24 – 96 hours (4 days)
 *   Green  → > 96 hours
 *
 * For manual tasks: based on user-set priority score (1–10)
 *   Red    → 8–10
 *   Amber  → 4–7
 *   Green  → 1–3
 */
export function getAbsolutePriorityZone(task) {
    const hoursLeft = getTimeRemainingHours(task.dueDate || task.deadline);

    if (task.source === 'manual') {
        const p = task.priorityScore || task.priorityScore_manual || 5;
        if (p >= 8) return 'red';
        if (p >= 4) return 'amber';
        return 'green';
    }

    // Also bump urgently-incomplete tasks with little time
    if (hoursLeft <= 0) return 'red';        // Overdue
    if (hoursLeft <= 24) return 'red';       // Due today
    if (hoursLeft <= 96) return 'amber';     // Due within 4 days
    return 'green';
}

/**
 * Compute a normalized priority score (0–1) for SORTING only.
 * Zones are assigned independently via getAbsolutePriorityZone.
 */
export function normalizePriorities(tasks) {
    if (tasks.length === 0) return [];

    const rawScores = tasks.map(t => t.rawPriority);
    const min = Math.min(...rawScores);
    const max = Math.max(...rawScores);
    const range = max - min || 1;

    return tasks.map(task => {
        const priorityScore = (task.rawPriority - min) / range;
        const priorityZone = getAbsolutePriorityZone(task); // absolute, not relative

        return {
            ...task,
            priorityScore,
            priorityZone,
            timeRemaining: getTimeRemainingHours(task.dueDate || task.deadline),
        };
    });
}

/**
 * Process and rank all tasks.
 */
export function rankTasks(tasks) {
    const activeTasks = tasks.filter(t =>
        (t.completionPercent || 0) < 100 &&
        t.submissionStatus !== 'TURNED_IN'
    );

    const withRaw = activeTasks.map(task => ({
        ...task,
        rawPriority: calculateRawPriority(task),
    }));

    const ranked = normalizePriorities(withRaw);

    // Sort: Red first, then Amber, then Green, within each zone by time remaining (ascending)
    const zoneOrder = { red: 0, amber: 1, green: 2 };
    return ranked.sort((a, b) => {
        const zoneDiff = zoneOrder[a.priorityZone] - zoneOrder[b.priorityZone];
        if (zoneDiff !== 0) return zoneDiff;
        return a.timeRemaining - b.timeRemaining; // sooner deadline first
    });
}

export default {
    calculateRawPriority,
    getTimeRemainingHours,
    getQuizPrepMultiplier,
    getAbsolutePriorityZone,
    normalizePriorities,
    rankTasks,
};
