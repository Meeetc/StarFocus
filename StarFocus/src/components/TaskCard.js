// TaskCard — Priority-aware task card with calm, minimal design
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

const ZONE_CONFIG = {
    red: { accent: Colors.priority.red, bg: Colors.priority.redBg, label: 'Urgent' },
    amber: { accent: Colors.priority.amber, bg: Colors.priority.amberBg, label: 'Soon' },
    green: { accent: Colors.priority.green, bg: Colors.priority.greenBg, label: 'On Track' },
};

export default function TaskCard({ task, onStartFocus, onPress, onDelete, onUpdateCompletion }) {
    const zone = ZONE_CONFIG[task.priorityZone] || ZONE_CONFIG.green;

    const handleLongPress = () => {
        if (!onDelete) return;
        Alert.alert(
            'Delete Task',
            `Remove "${task.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.taskId || task.id) },
            ]
        );
    };

    const handleCompletionTap = () => {
        if (!onUpdateCompletion) return;
        const current = task.completionPercent || 0;
        const next = current >= 100 ? 0 : Math.min(current + 25, 100);
        onUpdateCompletion(task.taskId || task.id, next);
    };

    const timeLabel = task.timeRemaining != null
        ? task.timeRemaining < 1 ? 'Due now'
            : task.timeRemaining < 24 ? `${Math.round(task.timeRemaining)}h left`
                : `${Math.round(task.timeRemaining / 24)}d left`
        : null;

    return (
        <TouchableOpacity
            style={[styles.card, Shadows.subtle]}
            onPress={onPress}
            onLongPress={handleLongPress}
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

                {/* Bottom row: Time + Completion + Focus CTA */}
                <View style={styles.bottomRow}>
                    <View style={styles.metaRow}>
                        {timeLabel && (
                            <Text style={[styles.metaText, { color: zone.accent }]}>{timeLabel}</Text>
                        )}
                        <TouchableOpacity onPress={handleCompletionTap} activeOpacity={0.7}>
                            <Text style={[styles.metaText, styles.completionText]}>
                                {task.completionPercent}% done ✏️
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {onStartFocus && (
                        <TouchableOpacity
                            style={[styles.focusButton, { backgroundColor: zone.bg }]}
                            onPress={() => onStartFocus(task)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.focusButtonText, { color: zone.accent }]}>
                                ⚡ Focus
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${task.completionPercent}%`,
                                backgroundColor: zone.accent,
                            },
                        ]}
                    />
                </View>
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
    completionText: {
        textDecorationLine: 'underline',
    },
    focusButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    focusButtonText: {
        fontSize: 12,
        fontWeight: '700',
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
