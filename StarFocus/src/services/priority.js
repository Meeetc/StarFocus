// Priority Ranking Engine
// Deterministic formula: no LLM dependency
//
// Priority = (gradeWeightage × (1 − completionPercent)) / max(timeRemainingHours, 1) × quizPrepMultiplier

/**
 * Calculate raw priority score for a single task.
 * @param {Object} task
 * @param {number} task.gradeWeightage - 0.0 to 1.0
 * @param {number} task.completionPercent - 0 to 100
 * @param {string} task.dueDate - ISO 8601 datetime
 * @param {string} task.workType - ASSIGNMENT | SHORT_ANSWER_QUESTION | MULTIPLE_CHOICE
 * @param {string} task.source - classroom | manual
 * @param {number} [task.priorityScore] - 1–10 for manual tasks
 * @returns {number} Raw priority score (unbounded)
 */
export function calculateRawPriority(task) {
    const { gradeWeightage, completionPercent, dueDate, workType, source, priorityScore } = task;

    // Manual tasks use user-set priority score (normalized to 0–1)
    if (source === 'manual') {
        const normalizedPriority = (priorityScore || 5) / 10;
        const completionFactor = 1 - (completionPercent || 0) / 100;
        const timeRemaining = getTimeRemainingHours(dueDate);
        return (normalizedPriority * completionFactor) / Math.max(timeRemaining, 1);
    }

    // Classroom tasks use the deterministic formula
    const completionFactor = 1 - (completionPercent || 0) / 100;
    const timeRemaining = getTimeRemainingHours(dueDate);
    const quizMultiplier = getQuizPrepMultiplier(workType);

    return ((gradeWeightage || 0.5) * completionFactor) / Math.max(timeRemaining, 1) * quizMultiplier;
}

/**
 * Get hours remaining until deadline.
 * @param {string} dueDate - ISO 8601 datetime
 * @returns {number} Hours remaining (minimum 0)
 */
export function getTimeRemainingHours(dueDate) {
    if (!dueDate) return 168; // Default 1 week if no deadline
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    return Math.max(diffMs / (1000 * 60 * 60), 0);
}

/**
 * Get the quiz prep multiplier based on work type.
 * @param {string} workType
 * @returns {number} Multiplier (1.0, 1.5, or 1.8)
 */
export function getQuizPrepMultiplier(workType) {
    switch (workType) {
        case 'SHORT_ANSWER_QUESTION':
        case 'MULTIPLE_CHOICE':
            return 1.5;
        // Single-attempt quizzes get 1.8× — detected via additional metadata
        default:
            return 1.0;
    }
}

/**
 * Normalize priorities across all tasks using min-max normalization.
 * @param {Array} tasks - Array of tasks with rawPriority
 * @returns {Array} Tasks with normalized priorityScore (0.0–1.0) and priorityZone
 */
export function normalizePriorities(tasks) {
    if (tasks.length === 0) return [];

    const rawScores = tasks.map(t => t.rawPriority);
    const min = Math.min(...rawScores);
    const max = Math.max(...rawScores);
    const range = max - min || 1; // Avoid division by zero

    return tasks.map(task => {
        const normalizedScore = (task.rawPriority - min) / range;

        // Override: quizzes with < 24 hours → always Red
        const timeRemaining = getTimeRemainingHours(task.dueDate);
        const isUrgentQuiz = timeRemaining < 24 &&
            (task.workType === 'SHORT_ANSWER_QUESTION' || task.workType === 'MULTIPLE_CHOICE');

        const priorityScore = isUrgentQuiz ? Math.max(normalizedScore, 0.75) : normalizedScore;
        const priorityZone = getPriorityZone(priorityScore);

        return {
            ...task,
            priorityScore,
            priorityZone,
            timeRemaining: Math.round(timeRemaining),
        };
    });
}

/**
 * Assign priority zone based on normalized score.
 * @param {number} score - 0.0 to 1.0
 * @returns {string} red | amber | green
 */
export function getPriorityZone(score) {
    if (score > 0.7) return 'red';
    if (score >= 0.3) return 'amber';
    return 'green';
}

/**
 * Process and rank all tasks.
 * @param {Array} tasks - Array of raw task objects
 * @returns {Array} Sorted array with priority scores and zones
 */
export function rankTasks(tasks) {
    // Filter out completed tasks
    const activeTasks = tasks.filter(t =>
        (t.completionPercent || 0) < 100 &&
        t.submissionStatus !== 'TURNED_IN'
    );

    // Calculate raw priorities
    const withRaw = activeTasks.map(task => ({
        ...task,
        rawPriority: calculateRawPriority(task),
    }));

    // Normalize and assign zones
    const ranked = normalizePriorities(withRaw);

    // Sort by priority score descending (highest priority first)
    return ranked.sort((a, b) => b.priorityScore - a.priorityScore);
}

export default {
    calculateRawPriority,
    getTimeRemainingHours,
    getQuizPrepMultiplier,
    normalizePriorities,
    getPriorityZone,
    rankTasks,
};
