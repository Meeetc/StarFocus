// DashboardScreen — The Heatmap Dashboard (Command Center)
import React, { useState, useEffect, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import TaskCard from '../components/TaskCard';
import WorkloadGauge from '../components/WorkloadGauge';
import { rankTasks, getTimeRemainingHours } from '../services/priority';
import { calculateWorkloadScore } from '../services/workload';
import { supabase } from '../lib/supabase';
import { fullSync } from '../services/classroom';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const FILTER_TABS = ['All', 'Classroom', 'Manual', 'Critical', 'Completed', 'Missed'];

export default function DashboardScreen({ navigation }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const loadTasks = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch tasks from Supabase
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            // Map Supabase columns to the format our services expect
            const mapped = (data || []).map(t => ({
                ...t,
                dueDate: t.due_date,
                workType: t.work_type || 'ASSIGNMENT',
                gradeWeightage: parseFloat(t.grade_weightage) || 0.5,
                completionPercent: t.completion_percent || 0,
                submissionStatus: t.submission_status || 'NEW',
                courseName: t.course_name,
                courseId: t.course_id,
                priorityScore: t.priority_score_manual,
            }));

            setTasks(mapped);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const syncClassroom = async () => {
        try {
            const tokens = await GoogleSignin.getTokens();
            if (tokens.accessToken) {
                const classroomTasks = await fullSync(tokens.accessToken);
                setTasks(prev => {
                    const manualTasks = prev.filter(t => t.source === 'manual');
                    return [...manualTasks, ...classroomTasks];
                });
            }
        } catch (error) {
            // Classroom sync is optional, don't crash
            console.log('Classroom sync skipped:', error.message);
        }
    };

    useEffect(() => {
        loadTasks().then(() => syncClassroom());
    }, []);

    // Reload when navigating back from AddTask
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadTasks();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTasks();
        await syncClassroom();
        setRefreshing(false);
    }, []);

    // Update task completion
    const handleUpdateCompletion = async (taskId, newPercent) => {
        // Update local state
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, completionPercent: newPercent, completion_percent: newPercent } : t
        ));

        // Persist to Supabase
        try {
            await supabase
                .from('tasks')
                .update({ completion_percent: newPercent, updated_at: new Date().toISOString() })
                .eq('id', taskId);
        } catch (error) {
            console.error('Failed to update completion:', error);
        }
    };

    // Separate completed and active tasks
    const allTasks = tasks.map(t => ({
        ...t,
        timeRemaining: getTimeRemainingHours(t.dueDate),
    }));

    const completedTasks = allTasks.filter(t =>
        (t.completionPercent || 0) >= 100 || t.submissionStatus === 'TURNED_IN'
    );

    const missedTasks = allTasks.filter(t =>
        t.timeRemaining <= 0 && t.dueDate && (t.completionPercent || 0) < 100 && t.submissionStatus !== 'TURNED_IN'
    );

    // Rank only active tasks (not completed, not missed for ranking purposes)
    const rankedTasks = rankTasks(tasks);
    const workload = calculateWorkloadScore(rankedTasks);

    // Filter tasks
    const getFilteredTasks = () => {
        switch (activeFilter) {
            case 'Classroom':
                return rankedTasks.filter(t => t.source === 'classroom');
            case 'Manual':
                return rankedTasks.filter(t => t.source === 'manual');
            case 'Critical':
                return rankedTasks.filter(t => t.priorityZone === 'red');
            case 'Completed':
                return completedTasks;
            case 'Missed':
                return missedTasks;
            default:
                return rankedTasks;
        }
    };

    const filteredTasks = getFilteredTasks();

    const handleStartFocus = (task) => {
        navigation.navigate('Focus', { screen: 'FocusSprintMain', params: { task } });
    };

    // Count tasks by zone
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
                        <Text style={styles.greeting}>Good {getTimeOfDay()} 👋</Text>
                        <Text style={styles.subtitle}>Here's your academic landscape</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddTask')}
                    >
                        <Ionicons name="add" size={24} color={Colors.text.primary} />
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
                        onUpdateCompletion={handleUpdateCompletion}
                    />
                ))}

                {filteredTasks.length === 0 && (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                            {activeFilter === 'Completed' ? 'No completed tasks yet' :
                                activeFilter === 'Missed' ? 'No missed tasks — great job!' :
                                    'No tasks in this category'}
                        </Text>
                    </GlassCard>
                )}

                {/* Bottom spacer */}
                <View style={{ height: 100 }} />
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
    },
    emptyText: {
        ...Typography.body,
        color: Colors.text.muted,
    },
    loading: {
        flex: 1,
        backgroundColor: '#0A0E1A',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
