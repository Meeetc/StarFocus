// DashboardScreen — The Heatmap Dashboard (Command Center)
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import TaskCard from '../components/TaskCard';
import WorkloadGauge from '../components/WorkloadGauge';
import { rankTasks } from '../services/priority';
import { calculateWorkloadScore } from '../services/workload';
import { getTasks, deleteTask, updateTaskCompletion, saveTask } from '../services/taskStorage';
import { fullSync } from '../services/classroom';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const FILTER_TABS = ['All', 'Classroom', 'Manual', 'Critical'];

export default function DashboardScreen({ navigation }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const loadTasks = async () => {
        try {
            const localTasks = await getTasks();
            setTasks(localTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const syncClassroom = async () => {
        try {
            setSyncing(true);
            const tokens = await GoogleSignin.getTokens();
            if (tokens.accessToken) {
                const classroomTasks = await fullSync(tokens.accessToken);
                const existing = await getTasks();
                const existingIds = new Set(existing.map(t => t.id));
                let addedCount = 0;
                for (const ct of classroomTasks) {
                    if (!existingIds.has(ct.id)) {
                        await saveTask({ ...ct, id: ct.id });
                        addedCount++;
                    }
                }
                if (addedCount > 0) {
                    await loadTasks();
                }
            }
        } catch (error) {
            console.error('Classroom sync failed:', error);
        } finally {
            setSyncing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadTasks().then(() => syncClassroom());
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTasks();
        await syncClassroom();
        setRefreshing(false);
    }, []);

    const rankedTasks = rankTasks(tasks);
    const workload = calculateWorkloadScore(rankedTasks);

    const filteredTasks = rankedTasks.filter(task => {
        switch (activeFilter) {
            case 'Classroom':
                return task.source === 'classroom';
            case 'Manual':
                return task.source === 'manual';
            case 'Critical':
                return task.priorityZone === 'red';
            default:
                return true;
        }
    });

    const handleStartFocus = (task) => {
        navigation.navigate('Focus', { screen: 'FocusSprintMain', params: { task } });
    };

    const handleDeleteTask = async (taskId) => {
        await deleteTask(taskId);
        await loadTasks();
    };

    const handleUpdateCompletion = async (taskId, completionPercent) => {
        await updateTaskCompletion(taskId, completionPercent);
        await loadTasks();
    };

    const redCount = rankedTasks.filter(t => t.priorityZone === 'red').length;
    const amberCount = rankedTasks.filter(t => t.priorityZone === 'amber').length;
    const greenCount = rankedTasks.filter(t => t.priorityZone === 'green').length;

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={Colors.accent.blue} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent.blue} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
                        <Text style={styles.subtitle}>Here's your academic landscape</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddTask')}
                        activeOpacity={0.8}
                    >
                        <MaterialCommunityIcons name="plus" size={22} color={Colors.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* Workload Score Gauge */}
                <GlassCard style={styles.gaugeCard}>
                    <WorkloadGauge score={workload.score} level={workload.level} />
                    <View style={styles.zoneCounters}>
                        <View style={styles.zoneCounter}>
                            <Text style={[styles.zoneCounterNum, { color: Colors.priority.red }]}>{redCount}</Text>
                            <Text style={styles.zoneCounterLabel}>Critical</Text>
                        </View>
                        <View style={styles.zoneCounter}>
                            <Text style={[styles.zoneCounterNum, { color: Colors.priority.amber }]}>{amberCount}</Text>
                            <Text style={styles.zoneCounterLabel}>Warming</Text>
                        </View>
                        <View style={styles.zoneCounter}>
                            <Text style={[styles.zoneCounterNum, { color: Colors.priority.green }]}>{greenCount}</Text>
                            <Text style={styles.zoneCounterLabel}>Stable</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Filter tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterRow}
                    contentContainerStyle={styles.filterContent}
                >
                    {FILTER_TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.filterTab,
                                activeFilter === tab && styles.filterTabActive,
                            ]}
                            onPress={() => setActiveFilter(tab)}
                        >
                            {tab === 'Critical' && (
                                <View style={styles.criticalDot} />
                            )}
                            <Text
                                style={[
                                    styles.filterTabText,
                                    activeFilter === tab && styles.filterTabTextActive,
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Task list */}
                <Text style={styles.sectionTitle}>
                    {activeFilter === 'All' ? 'Priority Ranked Tasks' : activeFilter}
                </Text>
                {filteredTasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onStartFocus={handleStartFocus}
                        onDelete={handleDeleteTask}
                        onUpdateCompletion={handleUpdateCompletion}
                    />
                ))}

                {filteredTasks.length === 0 && (
                    <GlassCard style={styles.emptyCard}>
                        <MaterialCommunityIcons name="check-circle-outline" size={36} color={Colors.text.muted} />
                        <Text style={styles.emptyText}>No tasks in this category</Text>
                    </GlassCard>
                )}

                {/* Bottom spacer for floating tab bar */}
                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    greeting: {
        ...Typography.h2,
        color: Colors.text.primary,
    },
    subtitle: {
        ...Typography.caption,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accent.blue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gaugeCard: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingVertical: Spacing.lg,
    },
    zoneCounters: {
        flexDirection: 'row',
        marginTop: Spacing.md,
        gap: Spacing.xl,
    },
    zoneCounter: {
        alignItems: 'center',
    },
    zoneCounterNum: {
        ...Typography.metric,
    },
    zoneCounterLabel: {
        ...Typography.caption,
        color: Colors.text.muted,
    },
    filterRow: {
        marginBottom: Spacing.md,
    },
    filterContent: {
        gap: Spacing.sm,
    },
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.glass.bg,
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    filterTabActive: {
        backgroundColor: Colors.accent.blue,
        borderColor: Colors.accent.blue,
    },
    criticalDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.priority.red,
    },
    filterTabText: {
        ...Typography.caption,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    filterTabTextActive: {
        color: Colors.text.primary,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.text.primary,
        marginBottom: Spacing.md,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.sm,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.text.muted,
    },
    loading: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
