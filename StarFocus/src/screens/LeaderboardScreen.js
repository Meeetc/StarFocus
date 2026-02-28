// LeaderboardScreen — Global + Study Group Rankings with group creation
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

export default function LeaderboardScreen() {
    const [activeTab, setActiveTab] = useState('global');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [myGroups, setMyGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [globalData, setGlobalData] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [copiedCode, setCopiedCode] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(true);
    const [loadingGroups, setLoadingGroups] = useState(true);

    useEffect(() => {
        loadGlobalLeaderboard();
        loadMyGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            loadGroupMembers(selectedGroup.id);
        }
    }, [selectedGroup]);

    const loadGlobalLeaderboard = async () => {
        setLoadingGlobal(true);
        try {
            const { data } = await supabase
                .from('leaderboard_snapshots')
                .select('*, users!inner(display_name, leaderboard_opt_in)')
                .order('weekly_score', { ascending: false })
                .limit(20);

            if (data && data.length > 0) {
                setGlobalData(data.map((entry, i) => ({
                    rank: i + 1,
                    displayName: entry.users?.display_name || 'Anonymous',
                    weeklyFocusScore: parseFloat(entry.weekly_score) || 0,
                    streakLength: entry.streak_length || 0,
                    userId: entry.user_id,
                })));
            } else {
                // Use placeholder data if no leaderboard exists yet
                setGlobalData(getDemoGlobalData());
            }
        } catch (error) {
            console.log('Leaderboard fetch:', error.message);
            setGlobalData(getDemoGlobalData());
        } finally {
            setLoadingGlobal(false);
        }
    };

    const loadMyGroups = async () => {
        setLoadingGroups(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('group_members')
                .select('*, study_groups(*)')
                .eq('user_id', user.id);

            if (data) {
                const groups = data.map(gm => gm.study_groups).filter(Boolean);
                setMyGroups(groups);
                if (groups.length > 0 && !selectedGroup) {
                    setSelectedGroup(groups[0]);
                }
            }
        } catch (error) {
            console.log('Groups fetch:', error.message);
        } finally {
            setLoadingGroups(false);
        }
    };

    const loadGroupMembers = async (groupId) => {
        try {
            const { data } = await supabase
                .from('group_members')
                .select('*, users(display_name)')
                .eq('group_id', groupId);

            if (data) {
                setGroupMembers(data.map((m, i) => ({
                    rank: i + 1,
                    displayName: m.users?.display_name || 'Member',
                    userId: m.user_id,
                })));
            }
        } catch (error) {
            console.log('Group members fetch:', error.message);
        }
    };

    const generateJoinCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
        return code;
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert('Required', 'Enter a group name');
            return;
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const code = generateJoinCode();
            const { data: group, error: groupError } = await supabase
                .from('study_groups')
                .insert({
                    name: groupName.trim(),
                    join_code: code,
                    created_by: user.id,
                })
                .select()
                .single();

            if (groupError) throw groupError;

            // Auto-join the creator
            await supabase.from('group_members').insert({
                group_id: group.id,
                user_id: user.id,
            });

            setShowCreateModal(false);
            setGroupName('');
            loadMyGroups();
            Alert.alert('Group Created!', `Join code: ${code}\nShare it with your study buddies!`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleJoinGroup = async () => {
        if (!joinCode.trim()) {
            Alert.alert('Required', 'Enter a join code');
            return;
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: group, error: findError } = await supabase
                .from('study_groups')
                .select('*')
                .eq('join_code', joinCode.trim().toUpperCase())
                .single();

            if (findError || !group) {
                Alert.alert('Not Found', 'No group with that join code.');
                return;
            }

            const { error: joinError } = await supabase.from('group_members').insert({
                group_id: group.id,
                user_id: user.id,
            });

            if (joinError) {
                if (joinError.code === '23505') {
                    Alert.alert('Already Joined', 'You\'re already in this group!');
                } else {
                    throw joinError;
                }
                return;
            }

            setShowJoinModal(false);
            setJoinCode('');
            loadMyGroups();
            Alert.alert('Joined!', `You joined "${group.name}"`);
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleCopyJoinCode = async (code) => {
        try {
            await Clipboard.setStringAsync(code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } catch {
            Alert.alert('Copied', code);
        }
    };

    const currentUserId = supabase.auth?.user?.()?.id;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Leaderboard</Text>
                        <Text style={styles.subtitle}>This Week • Resets Monday</Text>
                    </View>
                    <Ionicons name="trophy" size={28} color={Colors.accent.gold} />
                </View>

                {/* Tab switcher */}
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'global' && styles.tabActive]}
                        onPress={() => setActiveTab('global')}
                    >
                        <Ionicons name="globe-outline" size={16} color={activeTab === 'global' ? Colors.text.primary : Colors.text.secondary} />
                        <Text style={[styles.tabText, activeTab === 'global' && styles.tabTextActive]}>
                            {' '}Global
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'group' && styles.tabActive]}
                        onPress={() => setActiveTab('group')}
                    >
                        <Ionicons name="people-outline" size={16} color={activeTab === 'group' ? Colors.text.primary : Colors.text.secondary} />
                        <Text style={[styles.tabText, activeTab === 'group' && styles.tabTextActive]}>
                            {' '}Study Group
                        </Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'global' ? (
                    loadingGlobal ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.accent.blue} />
                        </View>
                    ) : (
                        <>
                            {/* Top 3 podium */}
                            <View style={styles.podium}>
                                {globalData.slice(0, 3).map((entry, i) => (
                                    <GlassCard
                                        key={entry.rank}
                                        glowColor={i === 0 ? Colors.accent.gold : null}
                                        style={[styles.podiumCard, i === 0 && styles.podiumFirst]}
                                    >
                                        <Text style={styles.podiumRank}>
                                            {i === 0 ? '' : `#${entry.rank}`}
                                            {i === 0 && <Ionicons name="medal" size={24} color={Colors.accent.gold} />}
                                        </Text>
                                        <Text style={styles.podiumName} numberOfLines={1}>{entry.displayName}</Text>
                                        <Text style={[styles.podiumScore, i === 0 && { color: Colors.accent.gold }]}>
                                            {entry.weeklyFocusScore}
                                        </Text>
                                        <View style={styles.streakRow}>
                                            <Ionicons name="flame" size={12} color={Colors.accent.orange} />
                                            <Text style={styles.podiumStreak}> {entry.streakLength}d</Text>
                                        </View>
                                    </GlassCard>
                                ))}
                            </View>

                            {/* Rest of the list */}
                            {globalData.length > 3 && (
                                <GlassCard style={styles.listCard}>
                                    {globalData.slice(3).map(entry => (
                                        <View key={entry.rank} style={styles.listRow}>
                                            <Text style={styles.listRank}>#{entry.rank}</Text>
                                            <Text style={styles.listName} numberOfLines={1}>
                                                {entry.displayName}
                                            </Text>
                                            <Text style={styles.listScore}>{entry.weeklyFocusScore}</Text>
                                            <View style={styles.streakRow}>
                                                <Ionicons name="flame" size={10} color={Colors.accent.orange} />
                                                <Text style={styles.listStreak}>{entry.streakLength}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </GlassCard>
                            )}
                        </>
                    )
                ) : (
                    loadingGroups ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.accent.purple} />
                        </View>
                    ) : (
                        <>
                            {/* Group action buttons */}
                            <View style={styles.groupActions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowCreateModal(true)}>
                                    <Ionicons name="add-circle" size={20} color={Colors.accent.blue} />
                                    <Text style={styles.actionBtnText}> Create Group</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowJoinModal(true)}>
                                    <Ionicons name="enter" size={20} color={Colors.accent.purple} />
                                    <Text style={[styles.actionBtnText, { color: Colors.accent.purple }]}> Join Group</Text>
                                </TouchableOpacity>
                            </View>

                            {myGroups.length === 0 ? (
                                <GlassCard style={styles.emptyCard}>
                                    <Ionicons name="people" size={40} color={Colors.text.muted} />
                                    <Text style={styles.emptyText}>No study groups yet</Text>
                                    <Text style={styles.emptySubtext}>Create or join a group to compete with friends!</Text>
                                </GlassCard>
                            ) : (
                                <>
                                    {/* Group selector */}
                                    {myGroups.length > 1 && (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupSelector}>
                                            {myGroups.map(g => (
                                                <TouchableOpacity
                                                    key={g.id}
                                                    style={[styles.groupChip, selectedGroup?.id === g.id && styles.groupChipActive]}
                                                    onPress={() => setSelectedGroup(g)}
                                                >
                                                    <Text style={[styles.groupChipText, selectedGroup?.id === g.id && styles.groupChipTextActive]}>
                                                        {g.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}

                                    {/* Selected group info */}
                                    {selectedGroup && (
                                        <GlassCard style={styles.groupHeader}>
                                            <Text style={styles.groupName}>{selectedGroup.name}</Text>
                                            <Text style={styles.groupMeta}>{groupMembers.length} members</Text>
                                            <TouchableOpacity
                                                style={styles.inviteButton}
                                                onPress={() => handleCopyJoinCode(selectedGroup.join_code)}
                                            >
                                                <Ionicons
                                                    name={copiedCode ? 'checkmark-circle' : 'copy'}
                                                    size={14}
                                                    color={Colors.accent.purple}
                                                />
                                                <Text style={styles.inviteText}>
                                                    {copiedCode ? ' Copied!' : ` ${selectedGroup.join_code}`}
                                                </Text>
                                            </TouchableOpacity>
                                        </GlassCard>
                                    )}

                                    {/* Group members */}
                                    {groupMembers.length > 0 && (
                                        <GlassCard style={styles.listCard}>
                                            {groupMembers.map(member => (
                                                <View key={member.userId} style={styles.listRow}>
                                                    <Text style={styles.listRank}>#{member.rank}</Text>
                                                    <Text style={styles.listName}>{member.displayName}</Text>
                                                </View>
                                            ))}
                                        </GlassCard>
                                    )}
                                </>
                            )}
                        </>
                    )
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Create Group Modal */}
            <Modal visible={showCreateModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <GlassCard style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Create Study Group</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Group name (e.g., CS Batch 2026)"
                            placeholderTextColor={Colors.text.muted}
                            value={groupName}
                            onChangeText={setGroupName}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCreateModal(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateGroup}>
                                <Text style={styles.modalConfirmText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </View>
            </Modal>

            {/* Join Group Modal */}
            <Modal visible={showJoinModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <GlassCard style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Join Study Group</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter 6-character join code"
                            placeholderTextColor={Colors.text.muted}
                            value={joinCode}
                            onChangeText={setJoinCode}
                            autoCapitalize="characters"
                            maxLength={6}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowJoinModal(false)}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={handleJoinGroup}>
                                <Text style={styles.modalConfirmText}>Join</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassCard>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function getDemoGlobalData() {
    return [
        { rank: 1, displayName: 'FocusNinja42', weeklyFocusScore: 92.1, streakLength: 14 },
        { rank: 2, displayName: 'DeepWorker', weeklyFocusScore: 88.7, streakLength: 9 },
        { rank: 3, displayName: 'NightOwl_CS', weeklyFocusScore: 85.3, streakLength: 7 },
        { rank: 4, displayName: 'StudyBuddy', weeklyFocusScore: 79.8, streakLength: 5 },
        { rank: 5, displayName: 'CaffeineCode', weeklyFocusScore: 74.2, streakLength: 3 },
        { rank: 6, displayName: 'MathWiz', weeklyFocusScore: 68.9, streakLength: 2 },
    ];
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
    container: { flex: 1 },
    content: { padding: Spacing.md },
    loaderContainer: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    title: { ...Typography.h1, color: Colors.text.primary },
    subtitle: { ...Typography.caption, color: Colors.text.muted, marginBottom: Spacing.lg },
    tabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    tab: {
        flex: 1, paddingVertical: Spacing.sm + 2, borderRadius: BorderRadius.lg,
        backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.glass.border,
        alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    },
    tabActive: { backgroundColor: Colors.accent.blue, borderColor: Colors.accent.blue },
    tabText: { ...Typography.bodyBold, color: Colors.text.secondary },
    tabTextActive: { color: Colors.text.primary },
    podium: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    podiumCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    podiumFirst: { marginTop: -8 },
    podiumRank: { fontSize: 24, marginBottom: 4, color: Colors.text.primary },
    podiumName: { ...Typography.caption, color: Colors.text.primary, fontWeight: '600', marginBottom: 4 },
    podiumScore: { ...Typography.metric, color: Colors.text.primary },
    streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    podiumStreak: { ...Typography.caption, color: Colors.text.muted },
    listCard: { padding: 0 },
    listRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
        borderBottomWidth: 1, borderBottomColor: Colors.glass.border,
    },
    listRank: { ...Typography.bodyBold, color: Colors.text.muted, width: 36 },
    listName: { ...Typography.body, color: Colors.text.primary, flex: 1 },
    listScore: { ...Typography.bodyBold, color: Colors.text.primary, marginRight: Spacing.sm },
    listStreak: { ...Typography.caption, color: Colors.text.muted, marginLeft: 2 },
    // Group actions
    groupActions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
        backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.glass.border,
    },
    actionBtnText: { ...Typography.bodyBold, color: Colors.accent.blue },
    emptyCard: { alignItems: 'center', paddingVertical: Spacing.xl },
    emptyText: { ...Typography.body, color: Colors.text.muted, marginTop: Spacing.sm },
    emptySubtext: { ...Typography.caption, color: Colors.text.muted, marginTop: 4, textAlign: 'center' },
    groupSelector: { marginBottom: Spacing.md },
    groupChip: {
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
        backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.glass.border, marginRight: Spacing.sm,
    },
    groupChipActive: { backgroundColor: Colors.accent.blue, borderColor: Colors.accent.blue },
    groupChipText: { ...Typography.caption, fontWeight: '600', color: Colors.text.secondary },
    groupChipTextActive: { color: Colors.text.primary },
    groupHeader: { alignItems: 'center', marginBottom: Spacing.lg },
    groupName: { ...Typography.h3, color: Colors.text.primary },
    groupMeta: { ...Typography.caption, color: Colors.text.muted, marginTop: 4 },
    inviteButton: {
        marginTop: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full, backgroundColor: Colors.glass.highlight,
        flexDirection: 'row', alignItems: 'center',
    },
    inviteText: { ...Typography.caption, color: Colors.accent.purple, fontWeight: '600' },
    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: Spacing.lg,
    },
    modalCard: { padding: Spacing.lg },
    modalTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.md, textAlign: 'center' },
    modalInput: {
        ...Typography.body, color: Colors.text.primary, backgroundColor: Colors.glass.bg,
        borderWidth: 1, borderColor: Colors.glass.border, borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.md,
    },
    modalButtons: { flexDirection: 'row', gap: Spacing.sm },
    modalCancel: {
        flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.glass.border, alignItems: 'center',
    },
    modalCancelText: { ...Typography.bodyBold, color: Colors.text.secondary },
    modalConfirm: {
        flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg,
        backgroundColor: Colors.accent.blue, alignItems: 'center',
    },
    modalConfirmText: { ...Typography.bodyBold, color: Colors.text.primary },
});
