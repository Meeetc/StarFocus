// App Navigation — Bottom Tabs + Stack Navigators
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Colors, Typography } from '../theme';
import { Text } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import AssignmentsScreen from '../screens/AssignmentsScreen';
import FocusSprintScreen from '../screens/FocusSprintScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddTaskScreen from '../screens/AddTaskScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
            <HomeStack.Screen
                name="AddTask"
                component={AddTaskScreen}
                options={{ presentation: 'modal' }}
            />
        </HomeStack.Navigator>
    );
}

const FocusStack = createNativeStackNavigator();
function FocusStackNavigator() {
    return (
        <FocusStack.Navigator screenOptions={{ headerShown: false }}>
            <FocusStack.Screen name="FocusSprint" component={FocusSprintScreen} />
        </FocusStack.Navigator>
    );
}

function TabIcon({ emoji, focused }) {
    return (
        <Text style={{ fontSize: focused ? 22 : 19, opacity: focused ? 1 : 0.55 }}>
            {emoji}
        </Text>
    );
}

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.bg.secondary,
                    borderTopColor: 'rgba(255,255,255,0.06)',
                    borderTopWidth: 1,
                    paddingBottom: 6,
                    paddingTop: 6,
                    height: 62,
                },
                tabBarActiveTintColor: Colors.accent.blue,
                tabBarInactiveTintColor: Colors.text.muted,
                tabBarLabelStyle: { ...Typography.label, fontSize: 9, marginTop: 2 },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="AssignmentsTab"
                component={AssignmentsScreen}
                options={{
                    tabBarLabel: 'Tasks',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="FocusTab"
                component={FocusStackNavigator}
                options={{
                    tabBarLabel: 'Focus',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="LeaderboardTab"
                component={LeaderboardScreen}
                options={{
                    tabBarLabel: 'Board',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="🏆" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="ProgressTab"
                component={ProgressScreen}
                options={{
                    tabBarLabel: 'Stats',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
}
