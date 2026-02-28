// AppNavigator — Bottom tabs + stack navigation with Ionicons
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const TAB_CONFIG = {
    Home: { icon: 'home', iconOutline: 'home-outline' },
    Focus: { icon: 'flash', iconOutline: 'flash-outline' },
    Leaderboard: { icon: 'trophy', iconOutline: 'trophy-outline' },
    Progress: { icon: 'bar-chart', iconOutline: 'bar-chart-outline' },
    Profile: { icon: 'person', iconOutline: 'person-outline' },
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
                tabBarIcon: ({ focused, color, size }) => {
                    const config = TAB_CONFIG[route.name];
                    const iconName = focused ? config?.icon : config?.iconOutline;
                    return (
                        <Ionicons
                            name={iconName || 'ellipse'}
                            size={focused ? 24 : 22}
                            color={color}
                        />
                    );
                },
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
});
