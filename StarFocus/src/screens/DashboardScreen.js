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
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import TaskCard from '../components/TaskCard';
import WorkloadGauge from '../components/WorkloadGauge';
import { rankTasks } from '../services/priority';
import { calculateWorkloadScore } from '../services/workload';
import { supabase } from '../lib/supabase';
import { fullSync } from '../services/classroom';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const FILTER_TABS = ['All', 'Classroom', 'Manual', '🔴 Critical'];

export default function DashboardScreen({ navigation }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const loadTasks = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch manual tasks from Supabase
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;

            // For the prototype, we merge manual tasks with classroom tasks if a token is available
            // In a real app, classroom tasks would be persisted in Supabase too
            setTasks(data || []);
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
            console.error('Classroom sync failed:', error);
        }
    };

    useEffect(() => {
        loadTasks().then(() => syncClassroom());
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTasks();
        await syncClassroom();
        setRefreshing(false);
    }, []);

    // Rank tasks through the priority engine
    const rankedTasks = rankTasks(tasks);
    const workload = calculateWorkloadScore(rankedTasks);

    // Filter tasks
    const filteredTasks = rankedTasks.filter(task => {
        switch (activeFilter) {
            case 'Classroom':
                return task.source === 'classroom';
            case 'Manual':
                return task.source === 'manual';
            case '🔴 Critical':
                return task.priorityZone === 'red';
            default:
                return true;
        }
    });

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
                        <Text style={styles.addButtonText}>➕</Text>
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
                    />
                ))}

                {filteredTasks.length === 0 && (
                    <GlassCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No tasks in this category 🎉</Text>
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
    addButtonText: {
        fontSize: 20,
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
