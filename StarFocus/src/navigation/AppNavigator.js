// AppNavigator — Bottom tabs + stack navigation
// Guidelines: 3-5 tab icons, simple line icons, filled when active
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import FocusSprintScreen from '../screens/FocusSprintScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddTaskScreen from '../screens/AddTaskScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bg.primary },
            }}
        >
            <Stack.Screen name="DashboardMain" component={DashboardScreen} />
            <Stack.Screen
                name="AddTask"
                component={AddTaskScreen}
                options={{ presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
}

function FocusStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.bg.primary },
            }}
        >
            <Stack.Screen name="FocusSprintMain" component={FocusSprintScreen} />
        </Stack.Navigator>
    );
}

const TAB_ICONS = {
    Home: { active: '🏠', inactive: '🏡' },
    Focus: { active: '⚡', inactive: '⚡' },
    Leaderboard: { active: '🏆', inactive: '🏆' },
    Progress: { active: '📊', inactive: '📊' },
    Profile: { active: '👤', inactive: '👤' },
};

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: Colors.accent.blue,
                tabBarInactiveTintColor: Colors.text.muted,
                tabBarLabel: ({ focused, color }) => (
                    <Text style={[styles.tabLabel, { color }]}>
                        {route.name}
                    </Text>
                ),
                tabBarIcon: ({ focused }) => (
                    <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
                        {focused ? TAB_ICONS[route.name]?.active : TAB_ICONS[route.name]?.inactive}
                    </Text>
                ),
            })}
        >
            <Tab.Screen name="Home" component={DashboardStack} />
            <Tab.Screen name="Focus" component={FocusStack} />
            <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Tab.Screen name="Progress" component={ProgressScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: Colors.bg.secondary,
        borderTopColor: Colors.glass.border,
        borderTopWidth: 1,
        height: 80,
        paddingBottom: 20,
        paddingTop: 8,
        position: 'absolute',
        elevation: 20,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
    },
    tabIcon: {
        fontSize: 20,
        opacity: 0.6,
    },
    tabIconActive: {
        fontSize: 22,
        opacity: 1,
    },
});
