// ProgressScreen — Real charts from saved focus sessions
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, BarChart, ContributionGraph } from 'react-native-chart-kit';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { getSessionsByDay, getHeatmapData, getProfileStats } from '../services/sessionStorage';

const screenWidth = Dimensions.get('window').width - Spacing.md * 2;

const chartConfig = {
    backgroundGradientFrom: Colors.bg.tertiary,
    backgroundGradientTo: Colors.bg.tertiary,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalCount: 0,
    propsForLabels: { fontSize: 11, fill: Colors.text.muted },
    propsForDots: { r: '5', strokeWidth: '2', stroke: Colors.accent.blue },
};

export default function ProgressScreen() {
    const [weeklyData, setWeeklyData] = useState(null);
    const [heatmap, setHeatmap] = useState([]);
    const [summary, setSummary] = useState({ totalSprints: 0, totalFocusHours: 0 });

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const sessions = await getSessionsByDay(7);
            setWeeklyData(sessions);
            const heat = await getHeatmapData(90);
            setHeatmap(heat);
            const stats = await getProfileStats();
            setSummary(stats);
        } catch (error) {
            console.error('Failed to load progress data:', error);
        }
    };

    const hasData = weeklyData && weeklyData.scores.some(s => s > 0);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>Your Progress</Text>

                {/* Summary cards */}
                <View style={styles.summaryRow}>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={[styles.summaryValue, { color: Colors.accent.blue }]}>{summary.totalSprints}</Text>
                        <Text style={styles.summaryLabel}>Total Sprints</Text>
                    </GlassCard>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={[styles.summaryValue, { color: Colors.accent.purple }]}>{summary.totalFocusHours}h</Text>
                        <Text style={styles.summaryLabel}>Focus Hours</Text>
                    </GlassCard>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={[styles.summaryValue, { color: Colors.accent.gold }]}>{summary.totalSprints > 0 ? Math.round(summary.totalFocusMinutes / summary.totalSprints) : 0}m</Text>
                        <Text style={styles.summaryLabel}>Avg Session</Text>
                    </GlassCard>
                </View>

                {/* Weekly Focus Score */}
                <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="chart-line" size={18} color={Colors.accent.blue} />
                    <Text style={styles.sectionTitle}>Weekly Focus Score</Text>
                </View>
                <GlassCard>
                    {hasData ? (
                        <LineChart
                            data={{
                                labels: weeklyData.labels,
                                datasets: [{ data: weeklyData.scores.map(s => Math.max(s, 0.1)) }],
                            }}
                            width={screenWidth - Spacing.lg * 2}
                            height={200}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    ) : (
                        <View style={styles.emptyChart}>
                            <MaterialCommunityIcons name="target" size={36} color={Colors.text.muted} />
                            <Text style={styles.emptyText}>Complete a focus sprint to see your score chart</Text>
                        </View>
                    )}
                </GlassCard>

                {/* Daily Focus Minutes */}
                <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.accent.green} />
                    <Text style={styles.sectionTitle}>Daily Focus Minutes</Text>
                </View>
                <GlassCard>
                    {hasData ? (
                        <BarChart
                            data={{
                                labels: weeklyData.labels,
                                datasets: [{ data: weeklyData.minutes.map(m => Math.max(m, 0.1)) }],
                            }}
                            width={screenWidth - Spacing.lg * 2}
                            height={200}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                            }}
                            style={styles.chart}
                        />
                    ) : (
                        <View style={styles.emptyChart}>
                            <MaterialCommunityIcons name="clock-outline" size={36} color={Colors.text.muted} />
                            <Text style={styles.emptyText}>Your daily focus minutes will appear here after sessions</Text>
                        </View>
                    )}
                </GlassCard>

                {/* Activity Heatmap */}
                <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="calendar-month-outline" size={18} color={Colors.accent.purple} />
                    <Text style={styles.sectionTitle}>Activity Heatmap</Text>
                </View>
                <GlassCard>
                    {heatmap.length > 0 ? (
                        <ContributionGraph
                            values={heatmap}
                            endDate={new Date()}
                            numDays={90}
                            width={screenWidth - Spacing.lg * 2}
                            height={200}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                            }}
                            style={styles.chart}
                        />
                    ) : (
                        <View style={styles.emptyChart}>
                            <MaterialCommunityIcons name="calendar-month-outline" size={36} color={Colors.text.muted} />
                            <Text style={styles.emptyText}>Your focus activity heatmap will build up over time</Text>
                        </View>
                    )}
                </GlassCard>

                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
    container: { flex: 1 },
    content: { padding: Spacing.md },
    header: { ...Typography.h1, color: Colors.text.primary, marginBottom: Spacing.lg },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm, marginTop: Spacing.md },
    sectionTitle: { ...Typography.h3, color: Colors.text.primary },
    summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
    summaryCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm },
    summaryValue: { ...Typography.metric },
    summaryLabel: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
    chart: { borderRadius: BorderRadius.md, marginVertical: Spacing.xs },
    emptyChart: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
    emptyText: { ...Typography.body, color: Colors.text.muted, textAlign: 'center', paddingHorizontal: Spacing.md },
});
