// ProfileScreen — Profile, Badges, Streaks & Settings
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { getAllBadgesWithStatus } from '../services/badges';
import { supabase } from '../lib/supabase';
import { getProfileStats, getStreakData } from '../services/sessionStorage';

const BADGE_ICONS = { first_focus: 'star-outline', streak_starter: 'fire', streak_master: 'fire', sprint_veteran: 'timer-outline', deep_thinker: 'brain' };

export default function ProfileScreen() {
    const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
    const [user, setUser] = useState(null);
    const [signingOut, setSigningOut] = useState(false);
    const [stats, setStats] = useState({ currentStreak: 0, longestStreak: 0, freezeTokens: 0, totalSprints: 0, totalFocusHours: 0, earnedBadges: [] });
    const badges = getAllBadgesWithStatus(stats.earnedBadges);

    useEffect(() => { loadUser(); loadStats(); }, []);

    const loadStats = async () => {
        try {
            const ps = await getProfileStats();
            const sd = await getStreakData();
            const earned = [];
            if (sd.currentStreak >= 3) earned.push('streak_starter');
            if (sd.currentStreak >= 7) earned.push('streak_master');
            if (ps.totalSprints >= 10) earned.push('sprint_veteran');
            if (ps.totalSprints >= 1) earned.push('first_focus');
            if (ps.totalFocusHours >= 10) earned.push('deep_thinker');
            setStats({ currentStreak: sd.currentStreak, longestStreak: sd.longestStreak, freezeTokens: sd.freezeTokens, totalSprints: ps.totalSprints, totalFocusHours: ps.totalFocusHours, earnedBadges: earned });
        } catch (e) { console.error('Failed to load stats:', e); }
    };

    const loadUser = async () => {
        try {
            const { data: { user: u } } = await supabase.auth.getUser();
            if (u) {
                setUser({ displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User', email: u.email || '' });
                const { data: ud } = await supabase.from('users').select('leaderboard_opt_in').eq('auth_id', u.id).single();
                if (ud) setLeaderboardOptIn(ud.leaderboard_opt_in ?? false);
            }
        } catch (e) { console.error('Failed to load user:', e); }
    };

    const handleLeaderboardToggle = async (val) => {
        setLeaderboardOptIn(val);
        try { const { data: { user: u } } = await supabase.auth.getUser(); if (u) await supabase.from('users').update({ leaderboard_opt_in: val }).eq('auth_id', u.id); }
        catch (e) { setLeaderboardOptIn(!val); }
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, {
            text: 'Sign Out', style: 'destructive', onPress: async () => {
                setSigningOut(true);
                try { await GoogleSignin.signOut() } catch (_) { }
                try { await supabase.auth.signOut() } catch (e) { console.error(e) }
                setSigningOut(false);
            }
        }]);
    };

    const dn = user?.displayName || 'Loading...';

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                <View style={s.profileHeader}>
                    <View style={s.avatar}><Text style={s.avatarText}>{dn.charAt(0).toUpperCase()}</Text></View>
                    <Text style={s.name}>{dn}</Text>
                    <Text style={s.email}>{user?.email || ''}</Text>
                </View>

                <GlassCard glowColor={stats.currentStreak >= 7 ? Colors.accent.gold : null} style={s.streakCard}>
                    <View style={s.streakMain}>
                        <MaterialCommunityIcons name="fire" size={36} color={Colors.accent.orange} />
                        <Text style={s.streakNum}>{stats.currentStreak}</Text>
                        <Text style={s.streakLabel}>Day Streak</Text>
                    </View>
                    <View style={s.streakMeta}>
                        <View style={s.streakStat}><Text style={s.ssVal}>{stats.longestStreak}</Text><Text style={s.ssLbl}>Longest</Text></View>
                        <View style={s.div} />
                        <View style={s.streakStat}>
                            <View style={s.freezeR}><MaterialCommunityIcons name="snowflake" size={14} color={Colors.accent.blue} /><Text style={s.ssVal}> {stats.freezeTokens}</Text></View>
                            <Text style={s.ssLbl}>Freeze Tokens</Text>
                        </View>
                    </View>
                </GlassCard>

                <View style={s.statsGrid}>
                    <GlassCard style={s.statCard}><Text style={[s.statVal, { color: Colors.accent.blue }]}>{stats.totalSprints}</Text><Text style={s.statLbl}>Total Sprints</Text></GlassCard>
                    <GlassCard style={s.statCard}><Text style={[s.statVal, { color: Colors.accent.purple }]}>{stats.totalFocusHours}h</Text><Text style={s.statLbl}>Focus Hours</Text></GlassCard>
                </View>

                <View style={s.secHdr}><MaterialCommunityIcons name="medal-outline" size={18} color={Colors.accent.gold} /><Text style={s.secTitle}>Badge Collection</Text></View>
                <View style={s.badgeGrid}>
                    {badges.map(b => {
                        const ic = BADGE_ICONS[b.id] || 'star-outline'; return (
                            <GlassCard key={b.id} style={[s.badgeCard, !b.earned && s.badgeLocked]}>
                                <MaterialCommunityIcons name={ic} size={28} color={b.earned ? Colors.accent.gold : Colors.text.muted} style={{ marginBottom: 4 }} />
                                <Text style={[s.badgeName, !b.earned && { color: Colors.text.muted }]} numberOfLines={1}>{b.name}</Text>
                                <Text style={s.badgeDesc} numberOfLines={2}>{b.description}</Text>
                                {b.earned && <View style={s.earnedR}><MaterialCommunityIcons name="check-circle" size={14} color={Colors.accent.green} /><Text style={s.earnedT}> Earned</Text></View>}
                            </GlassCard>
                        );
                    })}
                </View>

                <View style={s.secHdr}><MaterialCommunityIcons name="cog-outline" size={18} color={Colors.text.secondary} /><Text style={s.secTitle}>Settings</Text></View>
                <GlassCard>
                    <View style={s.setRow}><View><Text style={s.setLbl}>Global Leaderboard</Text><Text style={s.setDesc}>Show your score publicly</Text></View>
                        <Switch value={leaderboardOptIn} onValueChange={handleLeaderboardToggle} trackColor={{ false: Colors.glass.highlight, true: Colors.accent.blue }} thumbColor={Colors.text.primary} /></View>
                    <View style={[s.setRow, { borderBottomWidth: 0 }]}><View><Text style={s.setLbl}>Daily Streak Minimum</Text><Text style={s.setDesc}>30 minutes of focus per day</Text></View>
                        <Text style={s.setVal}>30m</Text></View>
                </GlassCard>

                <TouchableOpacity style={[s.signOut, signingOut && { opacity: 0.5 }]} onPress={handleSignOut} disabled={signingOut}>
                    <MaterialCommunityIcons name="logout" size={18} color={Colors.priority.red} />
                    <Text style={s.signOutT}> {signingOut ? 'Signing Out...' : 'Sign Out'}</Text>
                </TouchableOpacity>
                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg.primary }, scroll: { flex: 1 }, content: { padding: Spacing.md },
    profileHeader: { alignItems: 'center', marginBottom: Spacing.lg },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.accent.blue, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
    avatarText: { ...Typography.h1, color: Colors.text.primary }, name: { ...Typography.h2, color: Colors.text.primary }, email: { ...Typography.caption, color: Colors.text.muted },
    streakCard: { marginBottom: Spacing.lg, alignItems: 'center' }, streakMain: { alignItems: 'center' },
    streakNum: { ...Typography.score, color: Colors.accent.gold, marginTop: -8 }, streakLabel: { ...Typography.label, color: Colors.text.muted, marginTop: -4 },
    streakMeta: { flexDirection: 'row', marginTop: Spacing.md, alignItems: 'center' }, streakStat: { alignItems: 'center', paddingHorizontal: Spacing.lg },
    freezeR: { flexDirection: 'row', alignItems: 'center' }, ssVal: { ...Typography.bodyBold, color: Colors.text.primary }, ssLbl: { ...Typography.caption, color: Colors.text.muted },
    div: { width: 1, height: 30, backgroundColor: Colors.glass.border },
    statsGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg }, statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    statVal: { ...Typography.metric }, statLbl: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
    secHdr: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }, secTitle: { ...Typography.h3, color: Colors.text.primary },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    badgeCard: { width: '47%', alignItems: 'center', paddingVertical: Spacing.md }, badgeLocked: { opacity: 0.4 },
    badgeName: { ...Typography.bodyBold, color: Colors.text.primary, fontSize: 13 }, badgeDesc: { ...Typography.caption, color: Colors.text.muted, textAlign: 'center', marginTop: 2 },
    earnedR: { flexDirection: 'row', alignItems: 'center', marginTop: 4 }, earnedT: { ...Typography.caption, color: Colors.accent.green, fontWeight: '600' },
    setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.glass.border },
    setLbl: { ...Typography.body, color: Colors.text.primary }, setDesc: { ...Typography.caption, color: Colors.text.muted }, setVal: { ...Typography.bodyBold, color: Colors.accent.blue },
    signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.glass.border },
    signOutT: { ...Typography.bodyBold, color: Colors.priority.red },
});
