// AddTaskScreen — Manual task entry form
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';

const CATEGORIES = [
    { id: 'club', label: '🎯 Club', color: Colors.accent.blue },
    { id: 'extracurricular', label: '🎭 Extra', color: Colors.accent.purple },
    { id: 'personal', label: '🏠 Personal', color: Colors.accent.green },
    { id: 'exam_prep', label: '📝 Exam Prep', color: Colors.accent.gold },
    { id: 'other', label: '📌 Other', color: Colors.text.muted },
];

export default function AddTaskScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('club');
    const [priority, setPriority] = useState(5);
    const [completion, setCompletion] = useState(0);

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a task title');
            return;
        }
        // In real app, save to Supabase
        Alert.alert('✅ Task Added', `"${title}" has been added to your dashboard.`, [
            { text: 'OK', onPress: () => navigation.goBack() },
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.title}>📌 Add Task</Text>
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
                            <Text
                                style={[
                                    styles.categoryText,
                                    category === cat.id && { color: Colors.text.primary },
                                ]}
                            >
                                {cat.label}
                            </Text>
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
                        {priority <= 3 ? '🟢 Low' : priority <= 7 ? '🟡 Medium' : '🔴 High'} — {priority}/10
                    </Text>
                </GlassCard>

                {/* Save button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.saveButtonText}>✅ Add Task</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
    container: { flex: 1 },
    content: { padding: Spacing.md },
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
    },
    saveButtonText: { ...Typography.bodyBold, color: Colors.text.primary, fontSize: 16 },
});
