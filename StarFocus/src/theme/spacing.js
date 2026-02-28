// StarFocus Design System — Spacing & Layout
// 8px grid system with generous spacing for clarity

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,        // Cards (16–20px per guidelines)
    xl: 20,        // Larger cards
    full: 999,
};

export const Shadows = {
    // Soft shadow depth for floating cards
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 8,
    },
    // Subtle lift shadow
    subtle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    // Accent glow — use sparingly for focus elements
    glow: (color = '#3B82F6') => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    }),
};

// Animation durations per guidelines (200–350ms)
export const Motion = {
    fast: 200,
    normal: 280,
    slow: 350,
    spring: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },
};

export default { Spacing, BorderRadius, Shadows, Motion };
