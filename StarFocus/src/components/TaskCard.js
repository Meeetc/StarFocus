// TaskCard — Priority-aware task card with completion slider
import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, PanResponder } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

const ZONE_CONFIG = {
    red: { accent: Colors.priority.red, bg: Colors.priority.redBg, label: 'Urgent' },
    amber: { accent: Colors.priority.amber, bg: Colors.priority.amberBg, label: 'Soon' },
    green: { accent: Colors.priority.green, bg: Colors.priority.greenBg, label: 'On Track' },
};

export default function TaskCard({ task, onStartFocus, onPress, onDelete, onUpdateCompletion }) {
    const zone = ZONE_CONFIG[task.priorityZone] || ZONE_CONFIG.green;

    // Local state for immediate slider feedback
    const [localCompletion, setLocalCompletion] = useState(task.completionPercent || 0);
    const trackWidthRef = useRef(0);
    const isDragging = useRef(false);

    // Sync if parent updates the value externally
    useEffect(() => {
        if (!isDragging.current) {
            setLocalCompletion(task.completionPercent || 0);
        }
    }, [task.completionPercent]);

    const calcPct = (x) => Math.max(0, Math.min(100, Math.round((x / (trackWidthRef.current || 1)) * 100)));

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => !!onUpdateCompletion,
        onMoveShouldSetPanResponder: () => !!onUpdateCompletion,
        onPanResponderGrant: (evt) => {
            isDragging.current = true;
            setLocalCompletion(calcPct(evt.nativeEvent.locationX));
        },
        onPanResponderMove: (evt) => {
            setLocalCompletion(calcPct(evt.nativeEvent.locationX));
        },
        onPanResponderRelease: (evt) => {
            const pct = calcPct(evt.nativeEvent.locationX);
            setLocalCompletion(pct);
            onUpdateCompletion?.(task.taskId || task.id, pct);
            isDragging.current = false;
        },
        onPanResponderTerminate: () => {
            isDragging.current = false;
        },
    })).current;

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

    const hoursLeft = task.timeRemaining;
    let timeLabel = null;
    if (hoursLeft != null) {
        if (hoursLeft <= 0) timeLabel = '⚠️ Missed';
        else if (hoursLeft < 1) timeLabel = 'Due < 1h';
        else if (hoursLeft < 24) timeLabel = `${Math.round(hoursLeft)}h left`;
        else timeLabel = `${Math.round(hoursLeft / 24)}d left`;
    }

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

                {/* Meta row */}
                <View style={styles.metaRow}>
                    {timeLabel && (
                        <Text style={[
                            styles.metaText,
                            { color: hoursLeft <= 0 ? Colors.accent.red : zone.accent }
                        ]}>
                            {timeLabel}
                        </Text>
                    )}
                    <Text style={[styles.metaText, styles.pctLabel]}>{localCompletion}%</Text>
                    {onStartFocus && (
                        <TouchableOpacity
                            style={[styles.focusButton, { backgroundColor: zone.bg }]}
                            onPress={() => onStartFocus(task)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.focusButtonText, { color: zone.accent }]}>⚡ Focus</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Draggable completion slider */}
                <View
                    {...panResponder.panHandlers}
                    onLayout={(e) => { trackWidthRef.current = e.nativeEvent.layout.width; }}
                    style={styles.sliderTrack}
                    hitSlop={{ top: 10, bottom: 10 }}
                >
                    <View style={[styles.sliderFill, { width: `${localCompletion}%`, backgroundColor: zone.accent }]} />
                    {/* Thumb */}
                    <View style={[styles.sliderThumb, {
                        left: `${localCompletion}%`,
                        backgroundColor: zone.accent,
                        transform: [{ translateX: -6 }],
                    }]} />
                </View>
                {onUpdateCompletion && (
                    <Text style={styles.sliderHint}>← drag to update progress →</Text>
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
    priorityIndicator: { width: 4 },
    content: { flex: 1, padding: Spacing.md },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: Spacing.sm,
    },
    title: { ...Typography.bodyBold, color: Colors.text.primary, flex: 1 },
    zoneBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.sm },
    zoneText: { fontSize: 11, fontWeight: '600' },
    courseName: { ...Typography.caption, color: Colors.text.muted, marginTop: 4 },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        gap: Spacing.md,
    },
    metaText: { ...Typography.caption, color: Colors.text.secondary },
    pctLabel: { flex: 1, fontWeight: '600', color: Colors.text.primary },
    focusButton: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full },
    focusButtonText: { fontSize: 12, fontWeight: '700' },
    sliderTrack: {
        height: 8,
        backgroundColor: Colors.glass.highlight,
        borderRadius: 4,
        marginTop: Spacing.sm,
        overflow: 'visible',
    },
    sliderFill: { height: '100%', borderRadius: 4 },
    sliderThumb: {
        position: 'absolute',
        top: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.bg.primary,
    },
    sliderHint: {
        ...Typography.label,
        color: Colors.text.muted,
        textAlign: 'center',
        marginTop: 6,
        textTransform: 'none',
        letterSpacing: 0,
        fontSize: 10,
    },
});
