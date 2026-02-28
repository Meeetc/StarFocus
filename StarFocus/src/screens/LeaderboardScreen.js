// LeaderboardScreen — Global + Study Group Rankings
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';

// Demo leaderboard data
const DEMO_GLOBAL = [
    { rank: 1, displayName: '🔥 FocusNinja42', weeklyFocusScore: 92.1, streakLength: 14, badges: ['streak_master', 'deep_diver'] },
    { rank: 2, displayName: 'DeepWorker', weeklyFocusScore: 88.7, streakLength: 9, badges: ['sprint_royalty'] },
    { rank: 3, displayName: 'NightOwl_CS', weeklyFocusScore: 85.3, streakLength: 7, badges: ['streak_master'] },
    { rank: 4, displayName: 'StudyBuddy', weeklyFocusScore: 79.8, streakLength: 5, badges: [] },
    { rank: 5, displayName: '☕ CaffeineCode', weeklyFocusScore: 74.2, streakLength: 3, badges: ['early_bird'] },
    { rank: 6, displayName: 'MathWiz', weeklyFocusScore: 68.9, streakLength: 2, badges: [] },
    { rank: 7, displayName: 'CodeMonkey', weeklyFocusScore: 63.4, streakLength: 1, badges: [] },
    { rank: 8, displayName: 'You ⭐', weeklyFocusScore: 58.1, streakLength: 4, badges: ['streak_master'], isCurrentUser: true },
];

const DEMO_GROUP = {
    name: 'CS Batch 2026 🎓',
    members: [
        { rank: 1, displayName: 'Riya', weeklyFocusScore: 85.3, focusMinutes: 420 },
        { rank: 2, displayName: 'You ⭐', weeklyFocusScore: 58.1, focusMinutes: 310, isCurrentUser: true },
        { rank: 3, displayName: 'Arjun', weeklyFocusScore: 52.7, focusMinutes: 280 },
        { rank: 4, displayName: 'Priya', weeklyFocusScore: 46.3, focusMinutes: 220 },
    ],
};

export default function LeaderboardScreen() {
    const [activeTab, setActiveTab] = useState('global');

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>🏆 Leaderboard</Text>
                <Text style={styles.subtitle}>This Week • Resets Monday</Text>

                {/* Tab switcher */}
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'global' && styles.tabActive]}
                        onPress={() => setActiveTab('global')}
                    >
                        <Text style={[styles.tabText, activeTab === 'global' && styles.tabTextActive]}>
                            🌍 Global
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'group' && styles.tabActive]}
                        onPress={() => setActiveTab('group')}
                    >
                        <Text style={[styles.tabText, activeTab === 'group' && styles.tabTextActive]}>
                            👥 Study Group
                        </Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'global' ? (
                    <>
                        {/* Top 3 podium */}
                        <View style={styles.podium}>
                            {DEMO_GLOBAL.slice(0, 3).map((entry, i) => (
                                <GlassCard
                                    key={entry.rank}
                                    glowColor={i === 0 ? Colors.accent.gold : null}
                                    style={[styles.podiumCard, i === 0 && styles.podiumFirst]}
                                >
                                    <Text style={styles.podiumRank}>{i === 0 ? '👑' : `#${entry.rank}`}</Text>
                                    <Text style={styles.podiumName} numberOfLines={1}>{entry.displayName}</Text>
                                    <Text style={[styles.podiumScore, i === 0 && { color: Colors.accent.gold }]}>
                                        {entry.weeklyFocusScore}
                                    </Text>
                                    <Text style={styles.podiumStreak}>🔥 {entry.streakLength}d</Text>
                                </GlassCard>
                            ))}
                        </View>

                        {/* Rest of the list */}
                        <GlassCard style={styles.listCard}>
                            {DEMO_GLOBAL.slice(3).map(entry => (
                                <View
                                    key={entry.rank}
                                    style={[
                                        styles.listRow,
                                        entry.isCurrentUser && styles.currentUserRow,
                                    ]}
                                >
                                    <Text style={styles.listRank}>#{entry.rank}</Text>
                                    <Text style={[styles.listName, entry.isCurrentUser && { color: Colors.accent.blue }]} numberOfLines={1}>
                                        {entry.displayName}
                                    </Text>
                                    <Text style={styles.listScore}>{entry.weeklyFocusScore}</Text>
                                    <Text style={styles.listStreak}>🔥{entry.streakLength}</Text>
                                </View>
                            ))}
                        </GlassCard>
                    </>
                ) : (
                    <>
                        {/* Group info */}
                        <GlassCard style={styles.groupHeader}>
                            <Text style={styles.groupName}>{DEMO_GROUP.name}</Text>
                            <Text style={styles.groupMeta}>{DEMO_GROUP.members.length} members</Text>
                            <TouchableOpacity style={styles.inviteButton}>
                                <Text style={styles.inviteText}>📎 Copy Join Code</Text>
                            </TouchableOpacity>
                        </GlassCard>

                        {/* Group ranking */}
                        <GlassCard style={styles.listCard}>
                            {DEMO_GROUP.members.map(member => (
                                <View
                                    key={member.rank}
                                    style={[
                                        styles.listRow,
                                        member.isCurrentUser && styles.currentUserRow,
                                    ]}
                                >
                                    <Text style={styles.listRank}>#{member.rank}</Text>
                                    <Text style={[styles.listName, member.isCurrentUser && { color: Colors.accent.blue }]}>
                                        {member.displayName}
                                    </Text>
                                    <View style={styles.groupStats}>
                                        <Text style={styles.listScore}>{member.weeklyFocusScore}</Text>
                                        <Text style={styles.groupMinutes}>{member.focusMinutes}m</Text>
                                    </View>
                                </View>
                            ))}
                        </GlassCard>
                    </>
                )}

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
    tabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    tab: {
        flex: 1, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.lg,
        backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.glass.border, alignItems: 'center',
    },
    tabActive: { backgroundColor: Colors.accent.blue, borderColor: Colors.accent.blue },
    tabText: { ...Typography.bodyBold, color: Colors.text.secondary },
    tabTextActive: { color: Colors.text.primary },
    podium: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    podiumCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    podiumFirst: { marginTop: -8 },
    podiumRank: { fontSize: 24, marginBottom: 4 },
    podiumName: { ...Typography.caption, color: Colors.text.primary, fontWeight: '600', marginBottom: 4 },
    podiumScore: { ...Typography.metric, color: Colors.text.primary },
    podiumStreak: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
    listCard: { padding: 0 },
    listRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
        borderBottomWidth: 1, borderBottomColor: Colors.glass.border,
    },
    currentUserRow: { backgroundColor: 'rgba(108, 99, 255, 0.1)' },
    listRank: { ...Typography.bodyBold, color: Colors.text.muted, width: 36 },
    listName: { ...Typography.body, color: Colors.text.primary, flex: 1 },
    listScore: { ...Typography.bodyBold, color: Colors.text.primary, marginRight: Spacing.sm },
    listStreak: { ...Typography.caption, color: Colors.text.muted },
    groupHeader: { alignItems: 'center', marginBottom: Spacing.lg },
    groupName: { ...Typography.h3, color: Colors.text.primary },
    groupMeta: { ...Typography.caption, color: Colors.text.muted, marginTop: 4 },
    inviteButton: {
        marginTop: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full, backgroundColor: Colors.glass.highlight,
    },
    inviteText: { ...Typography.caption, color: Colors.accent.purple, fontWeight: '600' },
    groupStats: { alignItems: 'flex-end' },
    groupMinutes: { ...Typography.caption, color: Colors.text.muted },
});
