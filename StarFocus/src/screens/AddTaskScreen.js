// AddTaskScreen — Manual task entry form with deadline picker
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { saveTask } from '../services/taskStorage';

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

    // Deadline state — default 7 days from now
    const [deadline, setDeadline] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        d.setHours(23, 59, 0, 0);
        return d;
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // Keep existing time, update date
            const updated = new Date(deadline);
            updated.setFullYear(selectedDate.getFullYear());
            updated.setMonth(selectedDate.getMonth());
            updated.setDate(selectedDate.getDate());
            setDeadline(updated);
            // Show time picker immediately after date selection
            setTimeout(() => setShowTimePicker(true), 300);
        }
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const updated = new Date(deadline);
            updated.setHours(selectedTime.getHours());
            updated.setMinutes(selectedTime.getMinutes());
            setDeadline(updated);
        }
    };

    const formatDeadline = () => {
        const now = new Date();
        const diff = deadline - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const dateStr = deadline.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
        });
        const timeStr = deadline.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit',
        });
        const relative = days <= 0 ? '⚠️ Overdue' :
            days === 1 ? '⏰ Tomorrow' :
                days <= 7 ? `📅 ${days} days left` :
                    `📅 ${days} days left`;
        return { dateStr, timeStr, relative };
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a task title');
            return;
        }
        try {
            await saveTask({
                title: title.trim(),
                category,
                priorityScore: priority,
                completionPercent: completion,
                dueDate: deadline.toISOString(),
                source: 'manual',
            });
            Alert.alert('✅ Task Added', `"${title}" has been added to your dashboard.`, [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save task. Please try again.');
        }
    };

    const { dateStr, timeStr, relative } = formatDeadline();

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

                {/* Deadline picker */}
                <Text style={styles.label}>Deadline</Text>
                <GlassCard>
                    <TouchableOpacity
                        style={styles.deadlineRow}
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.7}
                    >
                        <View>
                            <Text style={styles.deadlineDate}>{dateStr} at {timeStr}</Text>
                            <Text style={styles.deadlineRelative}>{relative}</Text>
                        </View>
                        <Text style={styles.deadlineEdit}>📅 Change</Text>
                    </TouchableOpacity>
                </GlassCard>

                {showDatePicker && (
                    <DateTimePicker
                        value={deadline}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        minimumDate={new Date()}
                        onChange={onDateChange}
                        themeVariant="dark"
                    />
                )}

                {showTimePicker && (
                    <DateTimePicker
                        value={deadline}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onTimeChange}
                        themeVariant="dark"
                    />
                )}

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

                <View style={{ height: 40 }} />
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
    deadlineRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    deadlineDate: { ...Typography.bodyBold, color: Colors.text.primary },
    deadlineRelative: { ...Typography.caption, color: Colors.accent.blue, marginTop: 2 },
    deadlineEdit: { ...Typography.body, color: Colors.accent.blue },
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
