// AddTaskScreen — Manual task entry form with Supabase persistence
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
    { id: 'club', label: 'Club', icon: 'flag', color: Colors.accent.blue },
    { id: 'extracurricular', label: 'Extra', icon: 'people', color: Colors.accent.purple },
    { id: 'personal', label: 'Personal', icon: 'home', color: Colors.accent.green },
    { id: 'exam_prep', label: 'Exam Prep', icon: 'document-text', color: Colors.accent.gold },
    { id: 'other', label: 'Other', icon: 'bookmark', color: Colors.text.muted },
];

export default function AddTaskScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('club');
    const [priority, setPriority] = useState(5);
    const [deadlineText, setDeadlineText] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a task title');
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Error', 'You must be signed in to add tasks.');
                return;
            }

            // Parse deadline if entered
            let dueDate = null;
            if (deadlineText.trim()) {
                const parsed = new Date(deadlineText.trim());
                if (!isNaN(parsed.getTime())) {
                    dueDate = parsed.toISOString();
                } else {
                    // Try DD/MM/YYYY format
                    const parts = deadlineText.trim().split(/[\/\-\.]/);
                    if (parts.length === 3) {
                        const d = new Date(parts[2], parts[1] - 1, parts[0], 23, 59);
                        if (!isNaN(d.getTime())) {
                            dueDate = d.toISOString();
                        }
                    }
                    if (!dueDate) {
                        Alert.alert('Invalid Date', 'Use format: DD/MM/YYYY or YYYY-MM-DD');
                        setSaving(false);
                        return;
                    }
                }
            }

            const { error } = await supabase.from('tasks').insert({
                user_id: user.id,
                title: title.trim(),
                source: 'manual',
                category,
                priority_score_manual: priority,
                completion_percent: 0,
                due_date: dueDate,
                submission_status: 'NEW',
                work_type: 'ASSIGNMENT',
                grade_weightage: 0.5,
            });

            if (error) throw error;

            Alert.alert('Task Added', `"${title}" has been added to your dashboard.`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', error.message || 'Failed to save task.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Add Task</Text>
                    <View style={{ width: 24 }} />
                </View>
                <Text style={styles.subtitle}>Track clubs, exams, personal goals & more</Text>

                {/* Task name */}
                <Text style={styles.label}>Task Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., IEEE Hackathon Prep, GRE Verbal"
                    placeholderTextColor={Colors.text.muted}
                    value={title}
                    onChangeText={setTitle}
                />

                {/* Deadline */}
                <Text style={styles.label}>Deadline (optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY or YYYY-MM-DD"
                    placeholderTextColor={Colors.text.muted}
                    value={deadlineText}
                    onChangeText={setDeadlineText}
                />

                {/* Category */}
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryRow}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryChip,
                                category === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                            ]}
                            onPress={() => setCategory(cat.id)}
                        >
                            <View style={styles.categoryContent}>
                                <Ionicons
                                    name={cat.icon}
                                    size={14}
                                    color={category === cat.id ? Colors.text.primary : Colors.text.secondary}
                                />
                                <Text
                                    style={[
                                        styles.categoryText,
                                        category === cat.id && { color: Colors.text.primary },
                                    ]}
                                >
                                    {' '}{cat.label}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Priority slider */}
                <Text style={styles.label}>Priority Level</Text>
                <GlassCard>
                    <View style={styles.sliderRow}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                            <TouchableOpacity
                                key={val}
                                style={[
                                    styles.priorityDot,
                                    priority >= val && {
                                        backgroundColor:
                                            val <= 3 ? Colors.priority.green :
                                                val <= 7 ? Colors.priority.amber :
                                                    Colors.priority.red,
                                    },
                                ]}
                                onPress={() => setPriority(val)}
                            />
                        ))}
                    </View>
                    <Text style={styles.priorityLabel}>
                        {priority <= 3 ? 'Low' : priority <= 7 ? 'Medium' : 'High'} — {priority}/10
                    </Text>
                </GlassCard>

                {/* Save button */}
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={saving}
                >
                    <Ionicons name="checkmark-circle" size={20} color={Colors.text.primary} />
                    <Text style={styles.saveButtonText}>
                        {saving ? ' Saving...' : ' Add Task'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
    container: { flex: 1 },
    content: { padding: Spacing.md },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    title: { ...Typography.h2, color: Colors.text.primary },
    subtitle: { ...Typography.caption, color: Colors.text.muted, marginBottom: Spacing.lg },
    label: { ...Typography.label, color: Colors.text.secondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
    input: {
        ...Typography.body, color: Colors.text.primary,
        backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.glass.border,
        borderRadius: BorderRadius.md, padding: Spacing.md,
    },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    categoryChip: {
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full, backgroundColor: Colors.glass.bg,
        borderWidth: 1, borderColor: Colors.glass.border,
    },
    categoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryText: { ...Typography.caption, fontWeight: '600', color: Colors.text.secondary },
    sliderRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    priorityDot: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: Colors.glass.highlight,
        borderWidth: 1, borderColor: Colors.glass.border,
    },
    priorityLabel: { ...Typography.caption, color: Colors.text.secondary, textAlign: 'center' },
    saveButton: {
        backgroundColor: Colors.accent.blue, paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg, alignItems: 'center', marginTop: Spacing.xl,
        flexDirection: 'row', justifyContent: 'center',
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { ...Typography.bodyBold, color: Colors.text.primary, fontSize: 16 },
});
