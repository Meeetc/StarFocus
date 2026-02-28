// AssignmentsScreen — Classroom tasks grouped by course
import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import GlassCard from '../components/GlassCard';
import { getTasks } from '../services/taskStorage';
import { getAbsolutePriorityZone, getTimeRemainingHours } from '../services/priority';

const ZONE_COLORS = {
    red: Colors.priority.red,
    amber: Colors.priority.amber,
    green: Colors.priority.green,
};

function formatDue(dueDate, hoursLeft) {
    if (!dueDate) return 'No due date';
    if (hoursLeft <= 0) return 'Missed';
    if (hoursLeft < 1) return 'Due < 1h';
    if (hoursLeft < 24) return `Due in ${Math.round(hoursLeft)}h`;
    const days = Math.round(hoursLeft / 24);
    return `Due in ${days}d`;
}

function formatStatus(task) {
    if (task.submissionStatus === 'TURNED_IN') return 'Turned In';
    if ((task.completionPercent || 0) > 0) return `${task.completionPercent}% done`;
    return 'Not started';
}

export default function AssignmentsScreen() {
    const navigation = useNavigation();
    const [grouped, setGrouped] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(useCallback(() => { loadTasks(); }, []));

    const loadTasks = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const all = await getTasks();
            const classroom = all.filter(t => t.source === 'classroom');
            const groups = {};
            for (const task of classroom) {
                const course = task.courseName || 'Other';
                if (!groups[course]) groups[course] = [];
                groups[course].push({
                    ...task,
                    hoursLeft: getTimeRemainingHours(task.dueDate),
                    zone: getAbsolutePriorityZone(task),
                });
            }
            for (const course in groups) {
                groups[course].sort((a, b) => a.hoursLeft - b.hoursLeft);
            }
            setGrouped(groups);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleStartFocus = (task) => {
        navigation.navigate('FocusTab', {
            screen: 'FocusSprint',
            params: { task },
        });
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.accent.blue} />
            </View>
        );
    }

    const courseNames = Object.keys(grouped);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadTasks(true)}
                        tintColor={Colors.accent.blue}
                    />
                }
            >
                <Text style={styles.title}>Assignments</Text>
                <Text style={styles.subtitle}>From Google Classroom  ·  Pull to sync</Text>

                {courseNames.length === 0 ? (
                    <GlassCard style={styles.emptyCard}>
                        <MaterialCommunityIcons name="folder-open-outline" size={40} color={Colors.text.muted} />
                        <Text style={styles.emptyText}>
                            No assignments yet. Sync with Classroom from the Dashboard.
                        </Text>
                    </GlassCard>
                ) : (
                    courseNames.map(course => (
                        <View key={course} style={styles.courseGroup}>
                            {/* Course header */}
                            <View style={styles.courseHeader}>
                                <View style={styles.courseDot} />
                                <Text style={styles.courseName} numberOfLines={1}>{course}</Text>
                                <Text style={styles.courseCount}>{grouped[course].length}</Text>
                            </View>

                            {/* Assignment cards */}
                            {grouped[course].map(task => {
                                const zoneColor = ZONE_COLORS[task.zone] || Colors.accent.green;
                                const dueText = formatDue(task.dueDate, task.hoursLeft);
                                const isMissed = task.hoursLeft <= 0;
                                const isTurnedIn = task.submissionStatus === 'TURNED_IN';

                                return (
                                    <GlassCard
                                        key={task.id}
                                        style={[styles.assignmentCard, isTurnedIn && styles.doneCard]}
                                    >
                                        {/* Zone left stripe */}
                                        <View style={[styles.stripe, { backgroundColor: isTurnedIn ? Colors.accent.green : zoneColor }]} />

                                        <View style={styles.assignmentContent}>
                                            <View style={styles.assignmentTop}>
                                                <Text style={[styles.assignmentTitle, isTurnedIn && styles.doneText]} numberOfLines={2}>
                                                    {task.title}
                                                </Text>
                                                {!isTurnedIn && (
                                                    <TouchableOpacity
                                                        style={[styles.focusBtn, { backgroundColor: `${zoneColor}18` }]}
                                                        onPress={() => handleStartFocus(task)}
                                                    >
                                                        <MaterialCommunityIcons name="timer-outline" size={12} color={zoneColor} />
                                                        <Text style={[styles.focusBtnText, { color: zoneColor }]}> Focus</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            <View style={styles.assignmentMeta}>
                                                <View style={styles.statusBadge}>
                                                    {isTurnedIn ? (
                                                        <MaterialCommunityIcons name="check-circle-outline" size={13} color={Colors.accent.green} />
                                                    ) : isMissed ? (
                                                        <MaterialCommunityIcons name="alert-circle-outline" size={13} color={Colors.accent.red} />
                                                    ) : null}
                                                    <Text style={[
                                                        styles.dueText,
                                                        isMissed && styles.missedText,
                                                        isTurnedIn && { color: Colors.accent.green },
                                                    ]}>
                                                        {isTurnedIn ? 'Turned In' : dueText}
                                                    </Text>
                                                </View>
                                                {!isTurnedIn && (
                                                    <Text style={styles.statusText}>{formatStatus(task)}</Text>
                                                )}
                                            </View>

                                            {/* Progress bar */}
                                            {!isTurnedIn && (
                                                <View style={styles.progressTrack}>
                                                    <View style={[
                                                        styles.progressFill,
                                                        {
                                                            width: `${task.completionPercent || 0}%`,
                                                            backgroundColor: zoneColor,
                                                        }
                                                    ]} />
                                                </View>
                                            )}
                                        </View>
                                    </GlassCard>
                                );
                            })}
                        </View>
                    ))
                )}
                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
    container: { flex: 1 },
    content: { padding: Spacing.md },
    center: { flex: 1, backgroundColor: Colors.bg.primary, alignItems: 'center', justifyContent: 'center' },
    title: { ...Typography.h1, color: Colors.text.primary },
    subtitle: { ...Typography.caption, color: Colors.text.muted, marginBottom: Spacing.lg, marginTop: 4 },
    emptyCard: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
    emptyText: { ...Typography.body, color: Colors.text.muted, textAlign: 'center' },
    courseGroup: { marginBottom: Spacing.lg },
    courseHeader: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: Spacing.sm, paddingHorizontal: 4,
    },
    courseDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: Colors.accent.blue, marginRight: Spacing.sm,
    },
    courseName: { ...Typography.h3, color: Colors.text.primary, flex: 1 },
    courseCount: {
        ...Typography.label, color: Colors.text.muted,
        backgroundColor: Colors.glass.bg, paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: BorderRadius.full,
    },
    assignmentCard: {
        flexDirection: 'row', overflow: 'hidden',
        marginBottom: Spacing.sm, padding: 0,
    },
    doneCard: { opacity: 0.6 },
    stripe: { width: 3, borderRadius: 2 },
    assignmentContent: { flex: 1, padding: Spacing.md },
    assignmentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.sm },
    assignmentTitle: { ...Typography.bodyBold, color: Colors.text.primary, flex: 1 },
    doneText: { textDecorationLine: 'line-through', color: Colors.text.muted },
    focusBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm, paddingVertical: 4,
        borderRadius: BorderRadius.full,
    },
    focusBtnText: { fontSize: 12, fontWeight: '700' },
    assignmentMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dueText: { ...Typography.caption, color: Colors.text.secondary },
    missedText: { color: Colors.accent.red, fontWeight: '600' },
    statusText: { ...Typography.caption, color: Colors.text.muted },
    progressTrack: {
        height: 3, backgroundColor: Colors.glass.highlight,
        borderRadius: 2, marginTop: Spacing.sm, overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 2 },
});
