// WorkloadGauge — Circular gauge with calm, minimal design
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../theme';

export default function WorkloadGauge({ score = 0, level = 'low', size = 160 }) {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    const LEVEL_COLORS = {
        low: Colors.accent.green,
        moderate: Colors.accent.orange,
        high: Colors.accent.red,
    };

    const LEVEL_LABELS = {
        low: 'Low Load',
        moderate: 'Moderate',
        high: 'High Load',
    };

    const color = LEVEL_COLORS[level] || LEVEL_COLORS.low;

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={Colors.glass.highlight}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            {/* Score text overlay */}
            <View style={[styles.scoreOverlay, { width: size, height: size }]}>
                <Text style={[styles.score, { color }]}>{score}</Text>
                <Text style={styles.label}>{LEVEL_LABELS[level]}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    score: {
        ...Typography.score,
    },
    label: {
        ...Typography.caption,
        color: Colors.text.secondary,
        marginTop: -4,
    },
});
