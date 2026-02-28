// StarFocus Design System — Spacing & Layout
// 8px grid system, premium radii, deep floating shadows

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
    lg: 16,
    xl: 20,        // Standard cards
    xxl: 24,       // Hero cards & modals
    full: 999,
};

export const Shadows = {
    // Deep floating shadow for glass cards
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.30,
        shadowRadius: 32,
        elevation: 10,
    },
    // Subtle lift
    subtle: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.20,
        shadowRadius: 16,
        elevation: 6,
    },
    // Accent glow
    glow: (color = '#3B82F6') => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
    }),
};

// Animation durations
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
