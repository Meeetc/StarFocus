// ProfileScreen — Profile, Badges, Streaks & Settings (real data)
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
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { getAllBadgesWithStatus, evaluateBadges } from '../services/badges';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
    const [user, setUser] = useState(null);
    const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0, freezeTokens: 0 });
    const [stats, setStats] = useState({ totalSprints: 0, totalFocusHours: 0 });
    const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
    const [earnedBadgeIds, setEarnedBadgeIds] = useState([]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            setUser({
                displayName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
                email: authUser.email,
                avatarUrl: authUser.user_metadata?.avatar_url,
            });

            // Load streak data
            const { data: streak } = await supabase
                .from('streaks')
                .select('*')
                .eq('user_id', authUser.id)
                .single();

            if (streak) {
                setStreakData({
                    currentStreak: streak.current_streak || 0,
                    longestStreak: streak.longest_streak || 0,
                    freezeTokens: streak.freeze_tokens || 0,
                });
            }

            // Load session stats
            const { data: sessions } = await supabase
                .from('focus_sessions')
                .select('deep_work_minutes')
                .eq('user_id', authUser.id);

            if (sessions) {
                const totalMinutes = sessions.reduce((sum, s) => sum + (s.deep_work_minutes || 0), 0);
                setStats({
                    totalSprints: sessions.length,
                    totalFocusHours: Math.round(totalMinutes / 60 * 10) / 10,
                });
            }

            // Load badges
            const { data: badges } = await supabase
                .from('badges')
                .select('badge_type')
                .eq('user_id', authUser.id);

            if (badges) {
                setEarnedBadgeIds(badges.map(b => b.badge_type));
            }

            // Load user settings
            const { data: userRow } = await supabase
                .from('users')
                .select('leaderboard_opt_in')
                .eq('auth_id', authUser.id)
                .single();

            if (userRow) {
                setLeaderboardOptIn(userRow.leaderboard_opt_in || false);
            }
        } catch (error) {
            console.log('Profile load:', error.message);
        }
    };

    const handleToggleLeaderboard = async (value) => {
        setLeaderboardOptIn(value);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;
            await supabase
                .from('users')
                .update({ leaderboard_opt_in: value })
                .eq('auth_id', authUser.id);
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await GoogleSignin.signOut();
                    } catch (e) {
                        // Google sign out might fail if not signed in via Google
                    }
                    await supabase.auth.signOut();
                },
            },
        ]);
    };

    const badges = getAllBadgesWithStatus(earnedBadgeIds);
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
                <GlassCard glowColor={streakData.currentStreak >= 7 ? Colors.accent.gold : null} style={styles.streakCard}>
                    <View style={styles.streakRow}>
                        <View style={styles.streakMain}>
                            <Ionicons name="flame" size={36} color={Colors.accent.orange} />
                            <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
                            <Text style={styles.streakLabel}>Day Streak</Text>
                        </View>
                    </View>
                    <View style={styles.streakMeta}>
                        <View style={styles.streakStat}>
                            <Text style={styles.streakStatValue}>{streakData.longestStreak}</Text>
                            <Text style={styles.streakStatLabel}>Longest</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.streakStat}>
                            <View style={styles.freezeRow}>
                                <Ionicons name="snow" size={16} color={Colors.accent.blue} />
                                <Text style={styles.streakStatValue}> {streakData.freezeTokens}</Text>
                            </View>
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
                <View style={styles.sectionHeader}>
                    <Ionicons name="medal" size={20} color={Colors.accent.gold} />
                    <Text style={styles.sectionTitle}> Badge Collection</Text>
                </View>
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
                                    <Ionicons name="checkmark-circle" size={14} color={Colors.priority.green} />
                                    <Text style={styles.earnedText}> Earned</Text>
                                </View>
                            )}
                        </GlassCard>
                    ))}
                </View>

                {/* Settings */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="settings" size={20} color={Colors.text.secondary} />
                    <Text style={styles.sectionTitle}> Settings</Text>
                </View>
                <GlassCard>
                    <View style={styles.settingRow}>
                        <View>
                            <Text style={styles.settingLabel}>Global Leaderboard</Text>
                            <Text style={styles.settingDesc}>Show your score on the public leaderboard</Text>
                        </View>
                        <Switch
                            value={leaderboardOptIn}
                            onValueChange={handleToggleLeaderboard}
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
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.priority.red} />
                    <Text style={styles.signOutText}> Sign Out</Text>
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
    streakNumber: { ...Typography.score, color: Colors.accent.gold, marginTop: -8 },
    streakLabel: { ...Typography.label, color: Colors.text.muted, marginTop: -4 },
    streakMeta: { flexDirection: 'row', marginTop: Spacing.md, alignItems: 'center' },
    streakStat: { alignItems: 'center', paddingHorizontal: Spacing.lg },
    streakStatValue: { ...Typography.bodyBold, color: Colors.text.primary },
    streakStatLabel: { ...Typography.caption, color: Colors.text.muted },
    freezeRow: { flexDirection: 'row', alignItems: 'center' },
    divider: { width: 1, height: 30, backgroundColor: Colors.glass.border },
    statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    statValue: { ...Typography.metric },
    statLabel: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
    sectionTitle: { ...Typography.h3, color: Colors.text.primary },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    badgeCard: { width: '47%', alignItems: 'center', paddingVertical: Spacing.md },
    badgeLocked: { opacity: 0.4 },
    badgeEmoji: { fontSize: 32, marginBottom: 4 },
    badgeEmojiLocked: { opacity: 0.5 },
    badgeName: { ...Typography.bodyBold, color: Colors.text.primary, fontSize: 13 },
    badgeNameLocked: { color: Colors.text.muted },
    badgeDesc: { ...Typography.caption, color: Colors.text.muted, textAlign: 'center', marginTop: 2 },
    earnedBadge: { marginTop: 4, flexDirection: 'row', alignItems: 'center' },
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
        flexDirection: 'row', justifyContent: 'center',
    },
    signOutText: { ...Typography.bodyBold, color: Colors.priority.red },
});
