// LeaderboardScreen — Global + Study Group Rankings with Create/Join Group
import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Clipboard, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

function generateJoinCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function getThisMonday() {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    return monday.toISOString().split('T')[0];
}

export default function LeaderboardScreen() {
    const [activeTab, setActiveTab] = useState('global');
    const [globalEntries, setGlobalEntries] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myUserId, setMyUserId] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [groupNameInput, setGroupNameInput] = useState('');
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    useFocusEffect(useCallback(() => { loadLeaderboard(); }, []));

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: userData } = await supabase
                .from('users').select('id').eq('auth_id', user.id).single();
            const myId = userData?.id;
            setMyUserId(myId);
            const weekStart = getThisMonday();
            const { data: globalData } = await supabase
                .from('leaderboard_snapshots')
                .select('user_id, weekly_score, streak_length, users!inner(display_name)')
                .eq('week_start', weekStart)
                .order('weekly_score', { ascending: false })
                .limit(50);
            setGlobalEntries((globalData || []).map((e, i) => ({
                rank: i + 1,
                userId: e.user_id,
                displayName: e.users?.display_name || 'Anonymous',
                weeklyFocusScore: parseFloat(e.weekly_score || 0).toFixed(1),
                streakLength: e.streak_length || 0,
                isCurrentUser: e.user_id === myId,
            })));
            if (myId) await loadGroupData(myId, weekStart);
        } catch (err) {
            console.error('Leaderboard load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadGroupData = async (myId, weekStart) => {
        const { data: membership } = await supabase
            .from('group_members')
            .select('group_id, study_groups(id, name, join_code)')
            .eq('user_id', myId)
            .single();
        if (!membership?.study_groups) { setGroupData(null); return; }
        const group = membership.study_groups;
        const { data: members } = await supabase
            .from('group_members')
            .select('user_id, users(display_name)')
            .eq('group_id', group.id);
        const memberIds = members?.map(m => m.user_id) || [];
        const { data: scores } = await supabase
            .from('leaderboard_snapshots')
            .select('user_id, weekly_score, streak_length')
            .eq('week_start', weekStart)
            .in('user_id', memberIds)
            .order('weekly_score', { ascending: false });
        const nameMap = {};
        members?.forEach(m => { nameMap[m.user_id] = m.users?.display_name || 'Anonymous'; });
        setGroupData({
            name: group.name,
            joinCode: group.join_code,
            members: (scores || []).map((s, i) => ({
                rank: i + 1,
                userId: s.user_id,
                displayName: nameMap[s.user_id] || 'Anonymous',
                weeklyFocusScore: parseFloat(s.weekly_score || 0).toFixed(1),
                streakLength: s.streak_length || 0,
                isCurrentUser: s.user_id === myId,
            })),
        });
    };

    const handleCreateGroup = async () => {
        if (!groupNameInput.trim()) {
            Alert.alert('Name required', 'Please enter a group name.'); return;
        }
        setModalLoading(true);
        try {
            const joinCode = generateJoinCode();
            const { data: group, error: gErr } = await supabase
                .from('study_groups')
                .insert({ name: groupNameInput.trim(), join_code: joinCode })
                .select()
                .single();
            if (gErr) throw gErr;
            const { error: mErr } = await supabase
                .from('group_members')
                .insert({ group_id: group.id, user_id: myUserId });
            if (mErr) throw mErr;
            setShowCreateModal(false);
            setGroupNameInput('');
            Alert.alert('Group Created', `Join code: ${joinCode}\nShare this with your study partners.`);
            loadLeaderboard();
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to create group.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        const code = joinCodeInput.trim().toUpperCase();
        if (code.length !== 6) {
            Alert.alert('Invalid code', 'Join codes are 6 characters long.'); return;
        }
        setModalLoading(true);
        try {
            const { data: group, error: gErr } = await supabase
                .from('study_groups').select('id, name').eq('join_code', code).single();
            if (gErr || !group) {
                Alert.alert('Not found', 'No group found with that code. Check and try again.'); return;
            }
            const { data: existing } = await supabase
                .from('group_members').select('id').eq('user_id', myUserId).single();
            if (existing) {
                Alert.alert('Already in a group', 'Leave your current group first before joining another.'); return;
            }
            const { error: mErr } = await supabase
                .from('group_members').insert({ group_id: group.id, user_id: myUserId });
            if (mErr) throw mErr;
            setShowJoinModal(false);
            setJoinCodeInput('');
            Alert.alert('Joined', `Welcome to "${group.name}".`);
            loadLeaderboard();
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to join group.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCopyCode = () => {
        if (!groupData?.joinCode) return;
        Clipboard.setString(groupData.joinCode);
        Alert.alert('Copied', `Code "${groupData.joinCode}" copied to clipboard.`);
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.accent.blue} />
                <Text style={styles.loadingText}>Loading leaderboard</Text>
            </View>
        );
    }

    const showGlobal = globalEntries.length > 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Leaderboard</Text>
                <Text style={styles.subtitle}>This Week  ·  Resets Monday</Text>

                {/* Tab row */}
                <View style={styles.tabRow}>
                    <TouchableOpacity style={[styles.tab, activeTab === 'global' && styles.tabActive]} onPress={() => setActiveTab('global')}>
                        <MaterialCommunityIcons name="earth" size={16} color={activeTab === 'global' ? '#fff' : Colors.text.secondary} />
                        <Text style={[styles.tabText, activeTab === 'global' && styles.tabTextActive]}> Global</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === 'group' && styles.tabActive]} onPress={() => setActiveTab('group')}>
                        <MaterialCommunityIcons name="account-group-outline" size={16} color={activeTab === 'group' ? '#fff' : Colors.text.secondary} />
                        <Text style={[styles.tabText, activeTab === 'group' && styles.tabTextActive]}> Group</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'global' ? (
                    showGlobal ? (
                        <>
                            {/* Podium */}
                            <View style={styles.podium}>
                                {globalEntries.slice(0, 3).map((e, i) => (
                                    <GlassCard key={e.rank} glowColor={i === 0 ? Colors.accent.gold : null}
                                        style={[styles.podiumCard, i === 0 && styles.podiumFirst, e.isCurrentUser && styles.meCard]}>
                                        {i === 0 ? (
                                            <MaterialCommunityIcons name="crown-outline" size={22} color={Colors.accent.gold} />
                                        ) : (
                                            <Text style={styles.podiumRank}>#{e.rank}</Text>
                                        )}
                                        <Text style={styles.podiumName} numberOfLines={1}>{e.displayName}</Text>
                                        <Text style={[styles.podiumScore, i === 0 && { color: Colors.accent.gold }]}>{e.weeklyFocusScore}</Text>
                                        <View style={styles.streakBadge}>
                                            <MaterialCommunityIcons name="fire" size={12} color={Colors.accent.orange} />
                                            <Text style={styles.podiumStreak}> {e.streakLength}d</Text>
                                        </View>
                                    </GlassCard>
                                ))}
                            </View>
                            {globalEntries.length > 3 && (
                                <GlassCard style={styles.listCard} noPadding>
                                    {globalEntries.slice(3).map(e => (
                                        <View key={e.rank} style={[styles.listRow, e.isCurrentUser && styles.meRow]}>
                                            <Text style={styles.listRank}>#{e.rank}</Text>
                                            <Text style={[styles.listName, e.isCurrentUser && { color: Colors.accent.blue }]} numberOfLines={1}>
                                                {e.displayName}
                                            </Text>
                                            <Text style={styles.listScore}>{e.weeklyFocusScore}</Text>
                                            <View style={styles.streakBadge}>
                                                <MaterialCommunityIcons name="fire" size={12} color={Colors.accent.orange} />
                                                <Text style={styles.listStreak}>{e.streakLength}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </GlassCard>
                            )}
                        </>
                    ) : (
                        <GlassCard style={styles.emptyCard}>
                            <MaterialCommunityIcons name="sprout-outline" size={40} color={Colors.text.muted} />
                            <Text style={styles.emptyText}>Complete a focus sprint to appear on the leaderboard</Text>
                        </GlassCard>
                    )
                ) : (
                    groupData ? (
                        <>
                            <GlassCard style={styles.groupHeader}>
                                <Text style={styles.groupName}>{groupData.name}</Text>
                                <Text style={styles.groupMeta}>{groupData.members.length} members</Text>
                                <TouchableOpacity style={styles.codeRow} onPress={handleCopyCode}>
                                    <MaterialCommunityIcons name="key-outline" size={14} color={Colors.accent.purple} />
                                    <Text style={styles.codeText}> {groupData.joinCode}</Text>
                                    <Text style={styles.copyBtn}>Copy</Text>
                                </TouchableOpacity>
                            </GlassCard>
                            <GlassCard style={styles.listCard} noPadding>
                                {groupData.members.map(m => (
                                    <View key={m.rank} style={[styles.listRow, m.isCurrentUser && styles.meRow]}>
                                        <Text style={styles.listRank}>#{m.rank}</Text>
                                        <Text style={[styles.listName, m.isCurrentUser && { color: Colors.accent.blue }]}>
                                            {m.displayName}
                                        </Text>
                                        <Text style={styles.listScore}>{m.weeklyFocusScore}</Text>
                                        <View style={styles.streakBadge}>
                                            <MaterialCommunityIcons name="fire" size={12} color={Colors.accent.orange} />
                                            <Text style={styles.listStreak}>{m.streakLength}</Text>
                                        </View>
                                    </View>
                                ))}
                            </GlassCard>
                        </>
                    ) : (
                        <>
                            <GlassCard style={styles.emptyCard}>
                                <MaterialCommunityIcons name="account-group-outline" size={40} color={Colors.text.muted} />
                                <Text style={styles.emptyText}>You're not in a study group yet</Text>
                            </GlassCard>
                            <View style={styles.groupActions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCreateModal(true)}>
                                    <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                                    <Text style={styles.actionBtnText}> Create Group</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]} onPress={() => setShowJoinModal(true)}>
                                    <MaterialCommunityIcons name="key-outline" size={18} color={Colors.accent.blue} />
                                    <Text style={[styles.actionBtnText, { color: Colors.accent.blue }]}> Join with Code</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Create Group Modal */}
            <Modal visible={showCreateModal} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <GlassCard style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Create Study Group</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Group name (e.g. CS Batch 2025)"
                            placeholderTextColor={Colors.text.muted}
                            value={groupNameInput}
                            onChangeText={setGroupNameInput}
                            maxLength={40}
                        />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowCreateModal(false); setGroupNameInput(''); }}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateGroup} disabled={modalLoading}>
                                {modalLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalConfirmText}>Create</Text>}
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </KeyboardAvoidingView>
            </Modal>

            {/* Join Group Modal */}
            <Modal visible={showJoinModal} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <GlassCard style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Join a Group</Text>
                        <TextInput
                            style={[styles.input, styles.codeInput]}
                            placeholder="6-character join code"
                            placeholderTextColor={Colors.text.muted}
                            value={joinCodeInput}
                            onChangeText={t => setJoinCodeInput(t.toUpperCase())}
                            maxLength={6}
                            autoCapitalize="characters"
                        />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowJoinModal(false); setJoinCodeInput(''); }}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={handleJoinGroup} disabled={modalLoading}>
                                {modalLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalConfirmText}>Join</Text>}
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
    container: { flex: 1 },
    content: { padding: Spacing.md },
    center: { flex: 1, backgroundColor: Colors.bg.primary, alignItems: 'center', justifyContent: 'center' },
    loadingText: { ...Typography.caption, color: Colors.text.muted, marginTop: Spacing.sm },
    title: { ...Typography.h1, color: Colors.text.primary, textAlign: 'center' },
    subtitle: { ...Typography.caption, color: Colors.text.muted, textAlign: 'center', marginBottom: Spacing.lg },
    tabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: BorderRadius.full, backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.glass.border },
    tabActive: { backgroundColor: Colors.accent.blue, borderColor: Colors.accent.blue },
    tabText: { ...Typography.bodyBold, color: Colors.text.secondary },
    tabTextActive: { color: '#fff' },
    podium: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    podiumCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    podiumFirst: { marginTop: -8 },
    meCard: { borderColor: Colors.accent.blue },
    podiumRank: { ...Typography.bodyBold, color: Colors.text.muted, fontSize: 16 },
    podiumName: { ...Typography.caption, color: Colors.text.primary, fontWeight: '600', marginTop: 4, marginBottom: 4 },
    podiumScore: { ...Typography.metric, color: Colors.text.primary },
    streakBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    podiumStreak: { ...Typography.caption, color: Colors.text.muted },
    listCard: { padding: 0, marginBottom: Spacing.md },
    listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.glass.border },
    meRow: { backgroundColor: 'rgba(59,130,246,0.08)' },
    listRank: { ...Typography.bodyBold, color: Colors.text.muted, width: 36 },
    listName: { ...Typography.body, color: Colors.text.primary, flex: 1 },
    listScore: { ...Typography.bodyBold, color: Colors.text.primary, marginRight: Spacing.sm },
    listStreak: { ...Typography.caption, color: Colors.text.muted },
    emptyCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.md, gap: Spacing.sm },
    emptyText: { ...Typography.body, color: Colors.text.muted, textAlign: 'center' },
    groupActions: { gap: Spacing.sm },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent.blue, paddingVertical: Spacing.md, borderRadius: BorderRadius.full },
    actionBtnSecondary: { backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.glass.border },
    actionBtnText: { ...Typography.bodyBold, color: '#fff' },
    groupHeader: { alignItems: 'center', marginBottom: Spacing.md },
    groupName: { ...Typography.h3, color: Colors.text.primary },
    groupMeta: { ...Typography.caption, color: Colors.text.muted, marginTop: 4 },
    codeRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: 4 },
    codeText: { ...Typography.bodyBold, color: Colors.accent.purple, letterSpacing: 2 },
    copyBtn: { ...Typography.caption, color: Colors.accent.blue, textDecorationLine: 'underline', marginLeft: Spacing.sm },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: Spacing.lg },
    modalCard: { margin: 0 },
    modalTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.md },
    input: {
        backgroundColor: Colors.bg.elevated, borderRadius: BorderRadius.md,
        padding: Spacing.md, color: Colors.text.primary, ...Typography.body,
        borderWidth: 1, borderColor: Colors.glass.border, marginBottom: Spacing.md,
    },
    codeInput: { letterSpacing: 4, textAlign: 'center', fontSize: 22, fontWeight: '700' },
    modalBtns: { flexDirection: 'row', gap: Spacing.sm },
    modalCancel: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.full, backgroundColor: Colors.glass.bg, alignItems: 'center' },
    modalCancelText: { ...Typography.body, color: Colors.text.secondary },
    modalConfirm: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.full, backgroundColor: Colors.accent.blue, alignItems: 'center' },
    modalConfirmText: { ...Typography.bodyBold, color: '#fff' },
});
