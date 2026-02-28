// FocusSprintScreen — Timer-based deep work session with Shield interventions
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    DeviceEventEmitter,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { calculateFocusScore } from '../services/focusScore';
import { vibrateDeterrent, vibrateSuccess } from '../native/Vibration';
import { showOverlay } from '../native/Overlay';
import { UsageStats } from '../native/UsageStats';
import { supabase } from '../lib/supabase';

const DURATION_OPTIONS = [15, 25, 45, 60];

export default function FocusSprintScreen({ route, navigation }) {
    const task = route?.params?.task;
    const [selectedDuration, setSelectedDuration] = useState(25);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [focusResult, setFocusResult] = useState(null);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // Use refs so handleSessionComplete always reads the latest values
    const appSwitchesRef = useRef(0);
    const impulseOpensRef = useRef(0);
    const [appSwitchesDisplay, setAppSwitchesDisplay] = useState(0);
    const [impulseOpensDisplay, setImpulseOpensDisplay] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Native event listener for background distractions
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('onAppSwitchDetected', () => {
            if (isRunning) {
                // Background service already triggered the warning vibration,
                // we just need to update our JS state counts.
                handleAppSwitch();
            }
        });
        return () => subscription.remove();
    }, [isRunning]);

    // Timer logic
    useEffect(() => {
        if (isRunning && !isPaused && secondsLeft > 0) {
            timerRef.current = setInterval(() => {
                setSecondsLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSessionComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, isPaused]);

    const handleStart = () => {
        setSecondsLeft(selectedDuration * 60);
        setIsRunning(true);
        setIsPaused(false);
        appSwitchesRef.current = 0;
        impulseOpensRef.current = 0;
        setAppSwitchesDisplay(0);
        setImpulseOpensDisplay(0);
        setSessionComplete(false);
        setFocusResult(null);
        startTimeRef.current = new Date().toISOString();

        // Notify native service that a sprint has started
        UsageStats.setSprintActive(true);
    };

    const handlePause = () => {
        setIsPaused(!isPaused);
    };

    const handleStop = () => {
        clearInterval(timerRef.current);
        if (isRunning) {
            handleSessionComplete();
        }
    };

    const handleSessionComplete = () => {
        setIsRunning(false);
        setIsPaused(false);
        setSessionComplete(true);
        UsageStats.setSprintActive(false);
        vibrateSuccess();

        const totalSeconds = selectedDuration * 60;
        const elapsedSeconds = totalSeconds - secondsLeft;
        const elapsedMinutes = Math.round(elapsedSeconds / 60);

        const result = calculateFocusScore({
            deepWorkMinutes: Math.max(elapsedMinutes, 1),
            appSwitches: appSwitchesRef.current,
            impulseOpens: impulseOpensRef.current,
            linkedTask: task,
        });
        setFocusResult(result);

        // Persist session to Supabase
        persistSession(elapsedMinutes, result);
    };

    const persistSession = async (elapsedMinutes, result) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('focus_sessions').insert({
                user_id: user.id,
                linked_task_id: task?.id || null,
                start_time: startTimeRef.current,
                end_time: new Date().toISOString(),
                deep_work_minutes: elapsedMinutes,
                app_switches: appSwitchesRef.current,
                impulse_opens: impulseOpensRef.current,
                raw_score: result.rawScore,
                adjusted_score: result.adjustedScore,
                multipliers: result.multipliers,
            });
        } catch (error) {
            console.error('Failed to persist session:', error);
        }
    };

    const handleAppSwitch = () => {
        if (isRunning) {
            appSwitchesRef.current += 1;
            setAppSwitchesDisplay(appSwitchesRef.current);
            // Service handles vibration, but if triggered manually here we can do it:
            vibrateDeterrent();
        }
    };

    const handleImpulseOpen = () => {
        if (isRunning) {
            impulseOpensRef.current += 1;
            const count = impulseOpensRef.current;
            setImpulseOpensDisplay(count);

            // Escalating intervention stack
            if (count >= 3) {
                showOverlay('You\'ve opened flagged apps 3 times.\nYour workload is high — get back to work!', 'vibration');
                vibrateDeterrent();
            } else if (count >= 2) {
                showOverlay('Take a deep breath.\nYou\'re getting distracted.', 'greyscale');
            } else {
                showOverlay('Pause.\nIs this helping your assignment?', 'breathing');
            }
        }
    };

    // Timer display
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const progress = isRunning || sessionComplete
        ? 1 - secondsLeft / (selectedDuration * 60)
        : 0;

    // Circular progress
    const size = 260;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    const onRefresh = async () => {
        if (!isRunning) {
            setRefreshing(true);
            // Simulate fetch state or fetch recent data
            setTimeout(() => setRefreshing(false), 800);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent.blue} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Focus Sprint</Text>
                    {task && (
                        <View style={styles.taskRow}>
                            <Ionicons name="locate" size={14} color={Colors.accent.purple} />
                            <Text style={styles.taskName} numberOfLines={1}>
                                {' '}{task.title}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Timer ring */}
                <View style={styles.timerContainer}>
                    <Svg width={size} height={size}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={Colors.glass.highlight}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={isRunning ? Colors.accent.blue : Colors.accent.purple}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                    </Svg>
                    <View style={[styles.timerOverlay, { width: size, height: size }]}>
                        <Text style={styles.timerText}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </Text>
                        <Text style={styles.timerLabel}>
                            {isRunning ? (isPaused ? 'PAUSED' : 'FOCUSING') : sessionComplete ? 'COMPLETE' : 'READY'}
                        </Text>
                    </View>
                </View>

                {/* Duration selector (only before starting) */}
                {!isRunning && !sessionComplete && (
                    <View style={styles.durationRow}>
                        {DURATION_OPTIONS.map(dur => (
                            <TouchableOpacity
                                key={dur}
                                style={[
                                    styles.durationChip,
                                    selectedDuration === dur && styles.durationChipActive,
                                ]}
                                onPress={() => {
                                    setSelectedDuration(dur);
                                    setSecondsLeft(dur * 60);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.durationText,
                                        selectedDuration === dur && styles.durationTextActive,
                                    ]}
                                >
                                    {dur}m
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Session stats (during/after) */}
                {(isRunning || sessionComplete) && (
                    <GlassCard style={styles.statsCard}>
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{appSwitchesDisplay}</Text>
                                <Text style={styles.statLabel}>App Switches</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{impulseOpensDisplay}</Text>
                                <Text style={styles.statLabel}>Impulse Opens</Text>
                            </View>
                            {focusResult && (
                                <View style={styles.stat}>
                                    <Text style={[styles.statValue, { color: Colors.accent.gold }]}>
                                        {focusResult.adjustedScore}
                                    </Text>
                                    <Text style={styles.statLabel}>Focus Score</Text>
                                </View>
                            )}
                        </View>
                        {focusResult && focusResult.multipliers.length > 0 && (
                            <View style={styles.multiplierRow}>
                                {focusResult.multipliers.map(m => (
                                    <View key={m} style={styles.multiplierChip}>
                                        <Text style={styles.multiplierText}>{formatMultiplier(m)}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </GlassCard>
                )}

                {/* Controls */}
                <View style={styles.controls}>
                    {!isRunning && !sessionComplete && (
                        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
                            <Ionicons name="play" size={20} color={Colors.text.primary} />
                            <Text style={styles.startButtonText}>  START SPRINT</Text>
                        </TouchableOpacity>
                    )}
                    {isRunning && (
                        <View style={styles.runningControls}>
                            <TouchableOpacity style={styles.secondaryButton} onPress={handlePause}>
                                <Ionicons name={isPaused ? 'play' : 'pause'} size={18} color={Colors.accent.blue} />
                                <Text style={styles.secondaryButtonText}> {isPaused ? 'Resume' : 'Pause'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                                <Ionicons name="stop" size={18} color={Colors.text.primary} />
                                <Text style={styles.stopButtonText}> End</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {sessionComplete && (
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => {
                                setSessionComplete(false);
                                setSecondsLeft(selectedDuration * 60);
                            }}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="refresh" size={20} color={Colors.text.primary} />
                            <Text style={styles.startButtonText}>  NEW SPRINT</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Simulate buttons (dev only — in production, native module handles this) */}
                {isRunning && (
                    <View style={styles.simRow}>
                        <TouchableOpacity style={styles.simButton} onPress={handleAppSwitch}>
                            <Ionicons name="phone-portrait-outline" size={14} color={Colors.text.muted} />
                            <Text style={styles.simText}> Sim Switch</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.simButton} onPress={handleImpulseOpen}>
                            <Ionicons name="flash-outline" size={14} color={Colors.text.muted} />
                            <Text style={styles.simText}> Sim Impulse</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function formatMultiplier(m) {
    const labels = {
        red_priority: '1.5× Red Priority',
        quiz_task: '1.3× Quiz Task',
        deep_work: '1.1× Deep Work',
        zero_opens: '1.3× Zero Opens',
    };
    return labels[m] || m;
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        ...Typography.h2,
        color: Colors.text.primary,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    taskName: {
        ...Typography.caption,
        color: Colors.accent.purple,
    },
    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    timerOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        fontSize: 56,
        fontWeight: '200',
        color: Colors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        ...Typography.label,
        color: Colors.text.muted,
        marginTop: 4,
    },
    durationRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    durationChip: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.glass.bg,
        borderWidth: 1,
        borderColor: Colors.glass.border,
    },
    durationChipActive: {
        backgroundColor: Colors.accent.blue,
        borderColor: Colors.accent.blue,
    },
    durationText: {
        ...Typography.bodyBold,
        color: Colors.text.secondary,
    },
    durationTextActive: {
        color: Colors.text.primary,
    },
    statsCard: {
        width: '100%',
        marginBottom: Spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        ...Typography.metric,
        color: Colors.text.primary,
    },
    statLabel: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: 2,
    },
    multiplierRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.md,
        gap: Spacing.sm,
        flexWrap: 'wrap',
    },
    multiplierChip: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.glass.highlight,
    },
    multiplierText: {
        ...Typography.caption,
        color: Colors.accent.gold,
    },
    controls: {
        marginTop: Spacing.md,
        width: '100%',
    },
    startButton: {
        backgroundColor: Colors.accent.blue,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    startButtonText: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
        fontSize: 18,
    },
    runningControls: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.accent.blue,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        ...Typography.bodyBold,
        color: Colors.accent.blue,
    },
    stopButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        backgroundColor: Colors.priority.red,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    stopButtonText: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
    },
    simRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    simButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.glass.bg,
        borderWidth: 1,
        borderColor: Colors.glass.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    simText: {
        ...Typography.caption,
        color: Colors.text.muted,
    },
});
