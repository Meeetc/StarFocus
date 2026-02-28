// TaskCard — Priority-aware task card with completion slider
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

const ZONE_CONFIG = {
    red: { accent: Colors.priority.red, bg: Colors.priority.redBg, label: 'Urgent' },
    amber: { accent: Colors.priority.amber, bg: Colors.priority.amberBg, label: 'Soon' },
    green: { accent: Colors.priority.green, bg: Colors.priority.greenBg, label: 'On Track' },
};

export default function TaskCard({ task, onStartFocus, onPress, onUpdateCompletion }) {
    const zone = ZONE_CONFIG[task.priorityZone] || ZONE_CONFIG.green;
    const [sliderValue, setSliderValue] = useState(task.completionPercent || 0);

    const isCompleted = (task.completionPercent || 0) >= 100 || task.submissionStatus === 'TURNED_IN';
    const isPastDue = task.timeRemaining != null && task.timeRemaining <= 0 && task.dueDate;

    const getTimeLabel = () => {
        if (isCompleted) return { text: 'Completed', color: Colors.accent.green };
        if (isPastDue) return { text: 'Missed', color: Colors.priority.red };
        if (task.timeRemaining == null) return null;
        if (task.timeRemaining < 1) return { text: 'Due now', color: zone.accent };
        if (task.timeRemaining < 24) return { text: `${Math.round(task.timeRemaining)}h left`, color: zone.accent };
        return { text: `${Math.round(task.timeRemaining / 24)}d left`, color: zone.accent };
    };

    const timeInfo = getTimeLabel();

    const handleSliderComplete = (value) => {
        const rounded = Math.round(value);
        setSliderValue(rounded);
        if (onUpdateCompletion) {
            onUpdateCompletion(task.id, rounded);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, Shadows.subtle]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            {/* Priority indicator line */}
            <View style={[styles.priorityIndicator, { backgroundColor: zone.accent }]} />

            <View style={styles.content}>
                {/* Top row: Title + Zone badge */}
                <View style={styles.topRow}>
                    <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
                    <View style={[styles.zoneBadge, { backgroundColor: zone.bg }]}>
                        <Text style={[styles.zoneText, { color: zone.accent }]}>{zone.label}</Text>
                    </View>
                </View>

                {/* Course name */}
                {task.courseName && (
                    <Text style={styles.courseName} numberOfLines={1}>{task.courseName}</Text>
                )}

                {/* Bottom row: Time + Focus CTA */}
                <View style={styles.bottomRow}>
                    <View style={styles.metaRow}>
                        {timeInfo && (
                            <Text style={[styles.metaText, { color: timeInfo.color }]}>{timeInfo.text}</Text>
                        )}
                        <Text style={styles.metaText}>
                            {sliderValue}% done
                        </Text>
                    </View>

                    {onStartFocus && !isCompleted && (
                        <TouchableOpacity
                            style={[styles.focusButton, { backgroundColor: zone.bg }]}
                            onPress={() => onStartFocus(task)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.focusBtnRow}>
                                <Ionicons name="flash" size={12} color={zone.accent} />
                                <Text style={[styles.focusButtonText, { color: zone.accent }]}>
                                    {' '}Focus
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Completion Slider */}
                {onUpdateCompletion && !isCompleted && (
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={100}
                            step={5}
                            value={sliderValue}
                            onValueChange={setSliderValue}
                            onSlidingComplete={handleSliderComplete}
                            minimumTrackTintColor={zone.accent}
                            maximumTrackTintColor={Colors.glass.highlight}
                            thumbTintColor={zone.accent}
                        />
                    </View>
                )}

                {/* Progress bar (static display for cards without slider) */}
                {!onUpdateCompletion && (
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${task.completionPercent}%`,
                                    backgroundColor: isCompleted ? Colors.accent.green : zone.accent,
                                },
                            ]}
                        />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.glass.bg,
        borderWidth: 1,
        borderColor: Colors.glass.border,
        borderRadius: BorderRadius.xl,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    priorityIndicator: {
        width: 4,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    title: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
        flex: 1,
    },
    zoneBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: BorderRadius.sm,
    },
    zoneText: {
        fontSize: 11,
        fontWeight: '600',
    },
    courseName: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    metaText: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    focusButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    focusBtnRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    focusButtonText: {
        fontSize: 12,
        fontWeight: '700',
    },
    sliderContainer: {
        marginTop: Spacing.xs,
    },
    slider: {
        width: '100%',
        height: 32,
    },
    progressTrack: {
        height: 3,
        backgroundColor: Colors.glass.highlight,
        borderRadius: 2,
        marginTop: Spacing.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
