// FocusSprintScreen — Timer-based deep work session with Shield interventions
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { calculateFocusScore } from '../services/focusScore';
import { vibrateDeterrent, vibrateSuccess } from '../native/Vibration';
import { showOverlay } from '../native/Overlay';
import { saveSession, getStreakData, saveStreakData } from '../services/sessionStorage';
import { updateStreak } from '../services/streaks';

const DURATION_OPTIONS = [15, 25, 45, 60];

export default function FocusSprintScreen({ route, navigation }) {
    const task = route?.params?.task;
    const [selectedDuration, setSelectedDuration] = useState(25);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(25 * 60);
    const [appSwitches, setAppSwitches] = useState(0);
    const [impulseOpens, setImpulseOpens] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [focusResult, setFocusResult] = useState(null);
    const timerRef = useRef(null);

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

    // ── Auto-detect app switches via AppState ──
    const appStateRef = useRef(AppState.currentState);

    useEffect(() => {
        if (!isRunning || isPaused) return;

        const subscription = AppState.addEventListener('change', nextAppState => {
            // App came back to foreground from background/inactive
            if (
                appStateRef.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // Increment app switch counter
                setAppSwitches(prev => prev + 1);

                // Increment impulse counter + escalating interventions
                setImpulseOpens(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 3) {
                        showOverlay('You\'ve left the app ' + newCount + ' times.\nYour workload is high — get back to work!', 'vibration');
                    } else if (newCount >= 2) {
                        showOverlay('Take a deep breath.\nYou\'re getting distracted.', 'greyscale');
                    } else {
                        showOverlay('🧘 Pause.\nIs this helping your assignment?', 'breathing');
                    }
                    return newCount;
                });

                // Haptic deterrent on every return
                vibrateDeterrent();
            }
            appStateRef.current = nextAppState;
        });

        return () => subscription.remove();
    }, [isRunning, isPaused]);

    const handleStart = () => {
        setSecondsLeft(selectedDuration * 60);
        setIsRunning(true);
        setIsPaused(false);
        setAppSwitches(0);
        setImpulseOpens(0);
        setSessionComplete(false);
        setFocusResult(null);
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

    const handleSessionComplete = async () => {
        setIsRunning(false);
        setIsPaused(false);
        setSessionComplete(true);
        vibrateSuccess(); // Native haptic for completion

        const elapsedMinutes = selectedDuration - secondsLeft / 60;
        const deepWorkMins = Math.max(1, Math.round(elapsedMinutes));
        const result = calculateFocusScore({
            deepWorkMinutes: deepWorkMins,
            appSwitches,
            impulseOpens,
            linkedTask: task,
        });
        setFocusResult(result);

        // ── Persist the session ──
        try {
            const now = new Date();
            await saveSession({
                linkedTaskId: task?.id || null,
                startTime: new Date(now.getTime() - deepWorkMins * 60000).toISOString(),
                endTime: now.toISOString(),
                deepWorkMinutes: deepWorkMins,
                appSwitches,
                impulseOpens,
                rawScore: result.rawScore,
                multipliers: result.multipliers,
                adjustedScore: result.adjustedScore,
            });

            // ── Update streak via streaks.js (30-min daily threshold) ──
            const currentStreak = await getStreakData();
            const updatedStreak = updateStreak(currentStreak, deepWorkMins, 30);
            await saveStreakData(updatedStreak);
        } catch (error) {
            console.error('Failed to save session:', error);
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Focus Sprint</Text>
                    {task && (
                        <Text style={styles.taskName} numberOfLines={1}>
                            🎯 {task.title}
                        </Text>
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
                                <Text style={styles.statValue}>{appSwitches}</Text>
                                <Text style={styles.statLabel}>App Switches</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statValue}>{impulseOpens}</Text>
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
                            <Text style={styles.startButtonText}>▶ START SPRINT</Text>
                        </TouchableOpacity>
                    )}
                    {isRunning && (
                        <View style={styles.runningControls}>
                            <TouchableOpacity style={styles.secondaryButton} onPress={handlePause}>
                                <Text style={styles.secondaryButtonText}>{isPaused ? '▶ Resume' : '⏸ Pause'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                                <Text style={styles.stopButtonText}>⏹ End</Text>
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
                            <Text style={styles.startButtonText}>🔄 NEW SPRINT</Text>
                        </TouchableOpacity>
                    )}
                </View>


            </View>
        </SafeAreaView>
    );
}

function formatMultiplier(m) {
    const labels = {
        red_priority: '🔴 1.5×',
        quiz_task: '📝 1.3×',
        deep_work: '🧠 1.1×',
        zero_opens: '✨ 1.3×',
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
    taskName: {
        ...Typography.caption,
        color: Colors.accent.purple,
        marginTop: 4,
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
    },
    stopButtonText: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
    },

});
