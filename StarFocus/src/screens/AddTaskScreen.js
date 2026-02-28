// AddTaskScreen — Manual task entry form
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import GlassCard from '../components/GlassCard';
import { saveTask } from '../services/taskStorage';

const CATEGORIES = [
    { id: 'club', label: 'Club', icon: 'target', color: Colors.accent.blue },
    { id: 'extracurricular', label: 'Extra', icon: 'palette-outline', color: Colors.accent.purple },
    { id: 'personal', label: 'Personal', icon: 'account-outline', color: Colors.accent.green },
    { id: 'exam_prep', label: 'Exam Prep', icon: 'pencil-outline', color: Colors.accent.gold },
    { id: 'other', label: 'Other', icon: 'bookmark-outline', color: Colors.text.muted },
];

export default function AddTaskScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('club');
    const [priority, setPriority] = useState(5);
    const [completion, setCompletion] = useState(0);
    const [deadline, setDeadline] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(23, 59, 0, 0); return d; });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const onDateChange = (event, sel) => { setShowDatePicker(false); if (sel) { const u = new Date(deadline); u.setFullYear(sel.getFullYear()); u.setMonth(sel.getMonth()); u.setDate(sel.getDate()); setDeadline(u); setTimeout(() => setShowTimePicker(true), 300); } };
    const onTimeChange = (event, sel) => { setShowTimePicker(false); if (sel) { const u = new Date(deadline); u.setHours(sel.getHours()); u.setMinutes(sel.getMinutes()); setDeadline(u); } };

    const formatDeadline = () => {
        const diff = deadline - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const dateStr = deadline.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const relative = days <= 0 ? 'Overdue' : days === 1 ? 'Tomorrow' : `${days} days left`;
        return { dateStr, timeStr, relative };
    };

    const handleSave = async () => {
        if (!title.trim()) { Alert.alert('Required', 'Please enter a task title'); return; }
        try {
            await saveTask({ title: title.trim(), category, priorityScore: priority, completionPercent: completion, dueDate: deadline.toISOString(), source: 'manual' });
            Alert.alert('Task Added', `"${title}" has been added to your dashboard.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (e) { Alert.alert('Error', 'Failed to save task.'); }
    };

    const { dateStr, timeStr, relative } = formatDeadline();
    const priorityLabel = priority <= 3 ? 'Low' : priority <= 7 ? 'Medium' : 'High';
    const priorityColor = priority <= 3 ? Colors.priority.green : priority <= 7 ? Colors.priority.amber : Colors.priority.red;

    return (
        <SafeAreaView style={st.safe}>
            <ScrollView style={st.scroll} contentContainerStyle={st.content}>
                <Text style={st.title}>Add Task</Text>
                <Text style={st.subtitle}>Track clubs, exams, personal goals & more</Text>

                <Text style={st.label}>Task Name</Text>
                <TextInput style={st.input} placeholder="e.g., IEEE Hackathon Prep, GRE Verbal" placeholderTextColor={Colors.text.muted} value={title} onChangeText={setTitle} />

                <Text style={st.label}>Deadline</Text>
                <GlassCard>
                    <TouchableOpacity style={st.deadlineRow} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                        <View>
                            <Text style={st.deadlineDate}>{dateStr} at {timeStr}</Text>
                            <Text style={st.deadlineRel}>{relative}</Text>
                        </View>
                        <MaterialCommunityIcons name="calendar-edit" size={20} color={Colors.accent.blue} />
                    </TouchableOpacity>
                </GlassCard>

                {showDatePicker && <DateTimePicker value={deadline} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} minimumDate={new Date()} onChange={onDateChange} themeVariant="dark" />}
                {showTimePicker && <DateTimePicker value={deadline} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onTimeChange} themeVariant="dark" />}

                <Text style={st.label}>Category</Text>
                <View style={st.catRow}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity key={cat.id} style={[st.catChip, category === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]} onPress={() => setCategory(cat.id)}>
                            <MaterialCommunityIcons name={cat.icon} size={14} color={category === cat.id ? Colors.text.primary : Colors.text.secondary} />
                            <Text style={[st.catText, category === cat.id && { color: Colors.text.primary }]}> {cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={st.label}>Priority Level</Text>
                <GlassCard>
                    <View style={st.sliderRow}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                            <TouchableOpacity key={val} style={[st.pDot, priority >= val && { backgroundColor: val <= 3 ? Colors.priority.green : val <= 7 ? Colors.priority.amber : Colors.priority.red }]} onPress={() => setPriority(val)} />
                        ))}
                    </View>
                    <View style={st.pLabelRow}>
                        <View style={[st.pIndicator, { backgroundColor: priorityColor }]} />
                        <Text style={st.pLabel}> {priorityLabel} — {priority}/10</Text>
                    </View>
                </GlassCard>

                <TouchableOpacity style={st.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="check" size={20} color={Colors.text.primary} />
                    <Text style={st.saveBtnText}> Add Task</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const st = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.bg.primary }, scroll: { flex: 1 }, content: { padding: Spacing.md },
    title: { ...Typography.h2, color: Colors.text.primary }, subtitle: { ...Typography.caption, color: Colors.text.muted, marginBottom: Spacing.lg },
    label: { ...Typography.label, color: Colors.text.secondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
    input: { ...Typography.body, color: Colors.text.primary, backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.glass.border, borderRadius: BorderRadius.md, padding: Spacing.md },
    deadlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    deadlineDate: { ...Typography.bodyBold, color: Colors.text.primary }, deadlineRel: { ...Typography.caption, color: Colors.accent.blue, marginTop: 2 },
    catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.glass.bg, borderWidth: 1, borderColor: Colors.glass.border },
    catText: { ...Typography.caption, fontWeight: '600', color: Colors.text.secondary },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
    pDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.glass.highlight, borderWidth: 1, borderColor: Colors.glass.border },
    pLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    pIndicator: { width: 8, height: 8, borderRadius: 4 },
    pLabel: { ...Typography.caption, color: Colors.text.secondary },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent.blue, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, marginTop: Spacing.xl },
    saveBtnText: { ...Typography.bodyBold, color: Colors.text.primary, fontSize: 16 },
});
