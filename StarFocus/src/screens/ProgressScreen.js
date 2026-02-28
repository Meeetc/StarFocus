// ProgressScreen — Strava-style progress visualization
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, ContributionGraph } from 'react-native-chart-kit';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';

const screenWidth = Dimensions.get('window').width - Spacing.md * 2;

// Demo data
const WEEKLY_SCORES = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        data: [42, 55, 68, 72, 61, 78, 85],
        color: () => Colors.accent.blue,
        strokeWidth: 3,
    }],
};

const DAILY_MINUTES = {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [{
        data: [45, 60, 90, 75, 55, 120, 95],
    }],
};

// Generate heatmap data for the past 90 days
const generateHeatmapData = () => {
    const data = [];
    for (let i = 90; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const count = Math.floor(Math.random() * 6);
        if (count > 0) {
            data.push({
                date: date.toISOString().split('T')[0],
                count,
            });
        }
    }
    return data;
};

const HEATMAP_DATA = generateHeatmapData();

const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: Colors.bg.card,
    backgroundGradientTo: Colors.bg.card,
    decimalCount: 0,
    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
    labelColor: () => Colors.text.muted,
    style: { borderRadius: BorderRadius.lg },
    propsForDots: {
        r: '5',
        strokeWidth: '2',
        stroke: Colors.accent.blue,
    },
    propsForBackgroundLines: {
        stroke: Colors.glass.border,
    },
    barPercentage: 0.7,
};

export default function ProgressScreen() {
    // Summary stats
    const totalMinutesWeek = DAILY_MINUTES.datasets[0].data.reduce((a, b) => a + b, 0);
    const avgScore = Math.round(WEEKLY_SCORES.datasets[0].data.reduce((a, b) => a + b, 0) / 7);
    const bestDay = Math.max(...WEEKLY_SCORES.datasets[0].data);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>📊 Progress</Text>
                <Text style={styles.subtitle}>Your focus journey, visualized</Text>

                {/* Summary cards */}
                <View style={styles.summaryRow}>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={[styles.summaryValue, { color: Colors.accent.blue }]}>
                            {Math.round(totalMinutesWeek / 60)}h {totalMinutesWeek % 60}m
                        </Text>
                        <Text style={styles.summaryLabel}>This Week</Text>
                    </GlassCard>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={[styles.summaryValue, { color: Colors.accent.purple }]}>{avgScore}</Text>
                        <Text style={styles.summaryLabel}>Avg Score</Text>
                    </GlassCard>
                    <GlassCard style={styles.summaryCard}>
                        <Text style={[styles.summaryValue, { color: Colors.accent.gold }]}>{bestDay}</Text>
                        <Text style={styles.summaryLabel}>Best Day</Text>
                    </GlassCard>
                </View>

                {/* Weekly focus score trend (Line chart) */}
                <GlassCard style={styles.chartCard} noPadding>
                    <Text style={styles.chartTitle}>Weekly Focus Score</Text>
                    <LineChart
                        data={WEEKLY_SCORES}
                        width={screenWidth - 2}
                        height={200}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withInnerLines={false}
                        withOuterLines={false}
                    />
                </GlassCard>

                {/* Daily focus minutes (Bar chart) */}
                <GlassCard style={styles.chartCard} noPadding>
                    <Text style={styles.chartTitle}>Daily Focus Minutes</Text>
                    <BarChart
                        data={DAILY_MINUTES}
                        width={screenWidth - 2}
                        height={200}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
                        }}
                        style={styles.chart}
                        withInnerLines={false}
                        showBarTops={false}
                        fromZero
                    />
                </GlassCard>

                {/* Monthly heatmap */}
                <GlassCard style={styles.chartCard} noPadding>
                    <Text style={styles.chartTitle}>Monthly Activity Heatmap</Text>
                    <ContributionGraph
                        values={HEATMAP_DATA}
                        endDate={new Date()}
                        numDays={90}
                        width={screenWidth - 2}
                        height={220}
                        chartConfig={{
                            ...chartConfig,
                            color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                        }}
                        style={styles.chart}
                        gutterSize={4}
                    />
                </GlassCard>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
    container: { flex: 1 },
    content: { padding: Spacing.md },
    title: { ...Typography.h1, color: Colors.text.primary, textAlign: 'center' },
    subtitle: { ...Typography.caption, color: Colors.text.muted, textAlign: 'center', marginBottom: Spacing.lg },
    summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    summaryCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    summaryValue: { ...Typography.h3, color: Colors.text.primary },
    summaryLabel: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
    chartCard: { marginBottom: Spacing.md, overflow: 'hidden' },
    chartTitle: {
        ...Typography.bodyBold, color: Colors.text.primary,
        paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    },
    chart: { borderRadius: BorderRadius.lg, paddingRight: 0 },
});
