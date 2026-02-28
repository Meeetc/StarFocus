// GlassCard — Redesigned per design guidelines
// Translucent cards with soft depth, floating above background
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../theme';

export default function GlassCard({ children, style, glowColor, noPadding }) {
    return (
        <View
            style={[
                styles.card,
                glowColor ? Shadows.glow(glowColor) : Shadows.subtle,
                noPadding ? null : styles.padding,
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.glass.bg,
        borderWidth: 1,
        borderColor: Colors.glass.border,
        borderRadius: BorderRadius.xl,   // 20px per guidelines
        overflow: 'hidden',
    },
    padding: {
        padding: Spacing.md,
    },
});
