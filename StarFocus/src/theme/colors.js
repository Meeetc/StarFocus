// StarFocus Design System — Colors
// Premium Dark Blue Glassmorphism Palette
// Inspired by high-end fintech and music streaming apps

export const Colors = {
  // Backgrounds — deep navy / midnight
  bg: {
    primary: '#0F172A',       // Deep navy base
    secondary: '#131C31',     // Slightly lighter navy
    tertiary: '#162036',      // Card-level surfaces
    card: '#162036',          // Card background (before glass)
    elevated: '#1E293B',      // Elevated surfaces / inputs
    overlay: 'rgba(15, 23, 42, 0.90)',
  },

  // Accent Colors — muted, sophisticated
  accent: {
    green: '#10B981',         // Emerald — progress & success
    orange: '#F59E0B',        // Warm amber — urgency (muted)
    red: '#EF4444',           // Soft red — alerts only
    blue: '#3B82F6',          // Electric blue — primary accent
    gold: '#F59E0B',          // Achievement gold (matches amber)
    purple: '#818CF8',        // Soft indigo — streaks & specials
  },

  // Gradient pairs
  gradients: {
    background: ['#0F172A', '#1E293B'],       // Main bg gradient
    green: ['#10B981', '#059669'],             // Progress
    orange: ['#F59E0B', '#D97706'],            // Urgency
    blue: ['#3B82F6', '#2563EB'],              // Calm
    purple: ['#818CF8', '#6366F1'],            // Special
    gold: ['#F59E0B', '#D97706'],              // Achievement
    card: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'],
  },

  // Priority zones
  priority: {
    red: '#EF4444',
    amber: '#F59E0B',
    green: '#10B981',
    redBg: 'rgba(239, 68, 68, 0.10)',
    amberBg: 'rgba(245, 158, 11, 0.10)',
    greenBg: 'rgba(16, 185, 129, 0.10)',
  },

  // Text — high contrast
  text: {
    primary: 'rgba(255, 255, 255, 0.92)',     // Near-white
    secondary: 'rgba(255, 255, 255, 0.60)',   // Muted
    muted: 'rgba(255, 255, 255, 0.38)',       // Subtle
    inverse: '#0F172A',                        // Dark for light surfaces
    accent: '#3B82F6',                         // Blue links
  },

  // Glass surfaces — premium translucency
  glass: {
    bg: 'rgba(255, 255, 255, 0.07)',
    border: 'rgba(255, 255, 255, 0.10)',
    highlight: 'rgba(255, 255, 255, 0.04)',
    strong: 'rgba(255, 255, 255, 0.12)',
  },

  // Status
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

export default Colors;
