// ProfileScreen — Profile, Badges, Streaks & Settings
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { getAllBadgesWithStatus } from '../services/badges';
import { supabase } from '../lib/supabase';
import { getProfileStats, getStreakData } from '../services/sessionStorage';

export default function ProfileScreen() {
    const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
    const [user, setUser] = useState(null);
    const [signingOut, setSigningOut] = useState(false);
    const [stats, setStats] = useState({
        currentStreak: 0,
        longestStreak: 0,
        freezeTokens: 0,
        totalSprints: 0,
        totalFocusHours: 0,
        earnedBadges: [],
    });

    const badges = getAllBadgesWithStatus(stats.earnedBadges);

    useEffect(() => {
        loadUser();
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const profileStats = await getProfileStats();
            const streakData = await getStreakData();

            // Determine earned badges based on real stats
            const earned = [];
            if (streakData.currentStreak >= 3) earned.push('streak_starter');
            if (streakData.currentStreak >= 7) earned.push('streak_master');
            if (profileStats.totalSprints >= 10) earned.push('sprint_veteran');
            if (profileStats.totalSprints >= 1) earned.push('first_focus');
            if (profileStats.totalFocusHours >= 10) earned.push('deep_thinker');

            setStats({
                currentStreak: streakData.currentStreak,
                longestStreak: streakData.longestStreak,
                freezeTokens: streakData.freezeTokens,
                totalSprints: profileStats.totalSprints,
                totalFocusHours: profileStats.totalFocusHours,
                earnedBadges: earned,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const loadUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser({
                    displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                    email: user.email || '',
                    avatar: user.user_metadata?.avatar_url || null,
                });
                // Load leaderboard opt-in from DB
                const { data: userData } = await supabase
                    .from('users')
                    .select('leaderboard_opt_in')
                    .eq('auth_id', user.id)
                    .single();
                if (userData) {
                    setLeaderboardOptIn(userData.leaderboard_opt_in ?? false);
                }
            }
        } catch (error) {
            console.error('Failed to load user:', error);
        }
    };

    const handleLeaderboardToggle = async (value) => {
        setLeaderboardOptIn(value);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('users')
                    .update({ leaderboard_opt_in: value })
                    .eq('auth_id', user.id);
            }
        } catch (error) {
            console.error('Failed to update leaderboard opt-in:', error);
            setLeaderboardOptIn(!value); // revert on failure
        }
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    setSigningOut(true);
                    try {
                        await GoogleSignin.signOut();
                    } catch (e) {
                        // Google sign out may fail if not signed in via Google
                    }
                    try {
                        await supabase.auth.signOut();
                    } catch (e) {
                        console.error('Sign out error:', e);
                    }
                    setSigningOut(false);
                },
            },
        ]);
    };

    const displayName = user?.displayName || 'Loading...';
    const email = user?.email || '';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.email}>{email}</Text>
                </View>

                {/* Streak display */}
                <GlassCard glowColor={stats.currentStreak >= 7 ? Colors.accent.gold : null} style={styles.streakCard}>
                    <View style={styles.streakRow}>
                        <View style={styles.streakMain}>
                            <Text style={styles.fireEmoji}>🔥</Text>
                            <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
                            <Text style={styles.streakLabel}>Day Streak</Text>
                        </View>
                    </View>
                    <View style={styles.streakMeta}>
                        <View style={styles.streakStat}>
                            <Text style={styles.streakStatValue}>{stats.longestStreak}</Text>
                            <Text style={styles.streakStatLabel}>Longest</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.streakStat}>
                            <Text style={styles.streakStatValue}>❄️ {stats.freezeTokens}</Text>
                            <Text style={styles.streakStatLabel}>Freeze Tokens</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Stats grid */}
                <View style={styles.statsGrid}>
                    <GlassCard style={styles.statCard}>
                        <Text style={[styles.statValue, { color: Colors.accent.blue }]}>{stats.totalSprints}</Text>
                        <Text style={styles.statLabel}>Total Sprints</Text>
                    </GlassCard>
                    <GlassCard style={styles.statCard}>
                        <Text style={[styles.statValue, { color: Colors.accent.purple }]}>{stats.totalFocusHours}h</Text>
                        <Text style={styles.statLabel}>Focus Hours</Text>
                    </GlassCard>
                </View>

                {/* Badges */}
                <Text style={styles.sectionTitle}>🏅 Badge Collection</Text>
                <View style={styles.badgeGrid}>
                    {badges.map(badge => (
                        <GlassCard
                            key={badge.id}
                            style={[styles.badgeCard, !badge.earned && styles.badgeLocked]}
                        >
                            <Text style={[styles.badgeEmoji, !badge.earned && styles.badgeEmojiLocked]}>
                                {badge.emoji}
                            </Text>
                            <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]} numberOfLines={1}>
                                {badge.name}
                            </Text>
                            <Text style={styles.badgeDesc} numberOfLines={2}>
                                {badge.description}
                            </Text>
                            {badge.earned && (
                                <View style={styles.earnedBadge}>
                                    <Text style={styles.earnedText}>✅ Earned</Text>
                                </View>
                            )}
                        </GlassCard>
                    ))}
                </View>

                {/* Settings */}
                <Text style={styles.sectionTitle}>⚙️ Settings</Text>
                <GlassCard>
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingLabel}>Global Leaderboard</Text>
                            <Text style={styles.settingDesc}>Show your score on the public leaderboard</Text>
                        </View>
                        <Switch
                            value={leaderboardOptIn}
                            onValueChange={handleLeaderboardToggle}
                            trackColor={{ false: Colors.glass.highlight, true: Colors.accent.blue }}
                            thumbColor={Colors.text.primary}
                        />
                    </View>
                    <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                        <View>
                            <Text style={styles.settingLabel}>Daily Streak Minimum</Text>
                            <Text style={styles.settingDesc}>30 minutes of focus per day</Text>
                        </View>
                        <Text style={styles.settingValue}>30m</Text>
                    </View>
                </GlassCard>

                {/* Sign out */}
                <TouchableOpacity
                    style={[styles.signOutButton, signingOut && { opacity: 0.5 }]}
                    onPress={handleSignOut}
                    disabled={signingOut}
                >
                    <Text style={styles.signOutText}>{signingOut ? 'Signing Out...' : 'Sign Out'}</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
    container: { flex: 1 },
    content: { padding: Spacing.md },
    profileHeader: { alignItems: 'center', marginBottom: Spacing.lg },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: Colors.accent.blue,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: Spacing.sm,
    },
    avatarText: { ...Typography.h1, color: Colors.text.primary },
    name: { ...Typography.h2, color: Colors.text.primary },
    email: { ...Typography.caption, color: Colors.text.muted },
    streakCard: { marginBottom: Spacing.lg, alignItems: 'center' },
    streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    streakMain: { alignItems: 'center' },
    fireEmoji: { fontSize: 36 },
    streakNumber: { ...Typography.score, color: Colors.accent.gold, marginTop: -8 },
    streakLabel: { ...Typography.label, color: Colors.text.muted, marginTop: -4 },
    streakMeta: { flexDirection: 'row', marginTop: Spacing.md, alignItems: 'center' },
    streakStat: { alignItems: 'center', paddingHorizontal: Spacing.lg },
    streakStatValue: { ...Typography.bodyBold, color: Colors.text.primary },
    streakStatLabel: { ...Typography.caption, color: Colors.text.muted },
    divider: { width: 1, height: 30, backgroundColor: Colors.glass.border },
    statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    statValue: { ...Typography.metric },
    statLabel: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
    sectionTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.md },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    badgeCard: { width: '47%', alignItems: 'center', paddingVertical: Spacing.md },
    badgeLocked: { opacity: 0.4 },
    badgeEmoji: { fontSize: 32, marginBottom: 4 },
    badgeEmojiLocked: { opacity: 0.5 },
    badgeName: { ...Typography.bodyBold, color: Colors.text.primary, fontSize: 13 },
    badgeNameLocked: { color: Colors.text.muted },
    badgeDesc: { ...Typography.caption, color: Colors.text.muted, textAlign: 'center', marginTop: 2 },
    earnedBadge: { marginTop: 4 },
    earnedText: { ...Typography.caption, color: Colors.priority.green, fontWeight: '600' },
    settingRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.glass.border,
    },
    settingLabel: { ...Typography.body, color: Colors.text.primary },
    settingDesc: { ...Typography.caption, color: Colors.text.muted },
    settingValue: { ...Typography.bodyBold, color: Colors.accent.blue },
    signOutButton: {
        marginTop: Spacing.md, paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg, borderWidth: 1,
        borderColor: Colors.priority.red, alignItems: 'center',
    },
    signOutText: { ...Typography.bodyBold, color: Colors.priority.red },
});
