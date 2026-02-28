// Task Storage Service — AsyncStorage-based persistence
// Stores tasks locally on device for instant access
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@starfocus_tasks';

/**
 * Get all tasks for the current user.
 * @returns {Promise<Array>} Array of task objects
 */
export async function getTasks() {
    try {
        const json = await AsyncStorage.getItem(TASKS_KEY);
        return json ? JSON.parse(json) : [];
    } catch (error) {
        console.error('Failed to load tasks:', error);
        return [];
    }
}

/**
 * Save a new task.
 * @param {Object} task - Task object to save
 * @returns {Promise<Object>} The saved task with generated ID
 */
export async function saveTask(task) {
    try {
        const tasks = await getTasks();
        const newTask = {
            ...task,
            id: task.id || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            source: task.source || 'manual',
            createdAt: new Date().toISOString(),
        };
        tasks.push(newTask);
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        return newTask;
    } catch (error) {
        console.error('Failed to save task:', error);
        throw error;
    }
}

/**
 * Delete a task by ID.
 * @param {string} taskId
 */
export async function deleteTask(taskId) {
    try {
        const tasks = await getTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to delete task:', error);
    }
}

/**
 * Update a task's completion percentage.
 * @param {string} taskId
 * @param {number} completionPercent - 0 to 100
 */
export async function updateTaskCompletion(taskId, completionPercent) {
    try {
        const tasks = await getTasks();
        const updated = tasks.map(t =>
            t.id === taskId ? { ...t, completionPercent } : t
        );
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to update task:', error);
    }
}

export default { getTasks, saveTask, deleteTask, updateTaskCompletion };
