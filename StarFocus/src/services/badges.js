// Badge Evaluator
// Deterministic badge conditions — evaluated after each session/daily update

export const BADGE_DEFINITIONS = [
    {
        id: 'streak_master',
        name: 'Streak Master',
        emoji: '🔥',
        description: '7-day consecutive Focus Sprint streak',
        evaluate: (stats) => stats.currentStreak >= 7,
    },
    {
        id: 'comeback_king',
        name: 'Comeback King',
        emoji: '👑',
        description: 'Highest week-over-week improvement in study group',
        evaluate: (stats) => stats.weeklyImprovement && stats.weeklyImprovement >= stats.groupMaxImprovement,
    },
    {
        id: 'deep_diver',
        name: 'Deep Diver',
        emoji: '🏅',
        description: '4+ hours uninterrupted deep work',
        evaluate: (stats) => stats.longestSessionMinutes >= 240,
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        emoji: '🌅',
        description: '5 sprints before 8 AM in one week',
        evaluate: (stats) => stats.earlySprintsThisWeek >= 5,
    },
    {
        id: 'team_player',
        name: 'Team Player',
        emoji: '🤝',
        description: 'Top 3 study group contributor for 2+ consecutive weeks',
        evaluate: (stats) => stats.consecutiveWeeksTop3 >= 2,
    },
    {
        id: 'sprint_royalty',
        name: 'Sprint Royalty',
        emoji: '⚡',
        description: '100 total Focus Sprints completed',
        evaluate: (stats) => stats.totalSprints >= 100,
    },
    {
        id: 'diamond_focus',
        name: 'Diamond Focus',
        emoji: '💎',
        description: 'Weekly score ≥ 90 for 4 consecutive weeks',
        evaluate: (stats) => stats.consecutiveWeeksAbove90 >= 4,
    },
    {
        id: 'freeze_saver',
        name: 'Freeze Saver',
        emoji: '❄️',
        description: 'Used a freeze token and maintained a 14+ day streak',
        evaluate: (stats) => stats.usedFreezeAndStreakAbove14,
    },
];

/**
 * Evaluate which new badges a user has earned.
 * @param {Object} userStats - Aggregated stats for the user
 * @param {Array} existingBadges - Array of badge IDs already earned
 * @returns {Array} Newly earned badge definitions
 */
export function evaluateBadges(userStats, existingBadges = []) {
    const newBadges = BADGE_DEFINITIONS.filter(badge => {
        // Skip if already earned
        if (existingBadges.includes(badge.id)) return false;
        // Check if condition is met
        try {
            return badge.evaluate(userStats);
        } catch {
            return false;
        }
    });

    return newBadges;
}

/**
 * Get all badge definitions with earned status.
 * @param {Array} earnedBadgeIds - Array of earned badge IDs
 * @returns {Array} All badges with `earned` boolean
 */
export function getAllBadgesWithStatus(earnedBadgeIds = []) {
    return BADGE_DEFINITIONS.map(badge => ({
        ...badge,
        earned: earnedBadgeIds.includes(badge.id),
        evaluate: undefined, // Remove function for serialization
    }));
}

export default {
    BADGE_DEFINITIONS,
    evaluateBadges,
    getAllBadgesWithStatus,
};
