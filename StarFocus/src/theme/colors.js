// StarFocus Design System — Colors
// Aligned with Design Guidelines: Modern • Minimal • Glassmorphism • High Clarity
// Dark mode default — students use apps at night

export const Colors = {
  // Backgrounds — deep charcoal / midnight blue
  bg: {
    primary: '#0B0F14',       // Deepest background
    secondary: '#111827',     // Slightly lighter
    tertiary: '#0F172A',      // Midnight blue variant
    card: '#111827',          // Card background (before glass)
    elevated: '#1A2332',      // Elevated surfaces
    overlay: 'rgba(11, 15, 20, 0.85)',
  },

  // Accent Colors — use sparingly
  accent: {
    green: '#22C55E',         // Focus Green → productivity & progress
    orange: '#F97316',        // Urgency Orange → approaching deadlines
    red: '#EF4444',           // Alert Red → immediate action
    blue: '#3B82F6',          // Focus Blue → calm interaction
    gold: '#FBBF24',          // Achievement gold
    purple: '#8B5CF6',        // Streak & special moments
  },

  // Gradient pairs
  gradients: {
    background: ['#0B0F14', '#0F172A'],      // Main bg gradient
    green: ['#22C55E', '#16A34A'],            // Progress
    orange: ['#F97316', '#EA580C'],           // Urgency
    blue: ['#3B82F6', '#2563EB'],             // Calm
    purple: ['#8B5CF6', '#7C3AED'],           // Special
    gold: ['#FBBF24', '#F59E0B'],             // Achievement
    card: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.03)'],
  },

  // Priority zones — mapped to accent colors
  priority: {
    red: '#EF4444',
    amber: '#F97316',
    green: '#22C55E',
    redBg: 'rgba(239, 68, 68, 0.12)',
    amberBg: 'rgba(249, 115, 22, 0.12)',
    greenBg: 'rgba(34, 197, 94, 0.12)',
  },

  // Text — high contrast for readability
  text: {
    primary: '#F9FAFB',       // Near-white
    secondary: '#9CA3AF',     // Muted
    muted: '#6B7280',         // Subtle
    inverse: '#0B0F14',       // Dark for light surfaces
    accent: '#3B82F6',        // Blue links/highlights
  },

  // Glass surfaces — translucent cards
  glass: {
    bg: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.08)',
    highlight: 'rgba(255, 255, 255, 0.04)',
    strong: 'rgba(255, 255, 255, 0.10)',
  },

  // Status
  status: {
    success: '#22C55E',
    warning: '#F97316',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

export default Colors;
