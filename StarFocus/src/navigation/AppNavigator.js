// App Navigation — Bottom Tabs + Stack Navigators
// Premium floating glass tab bar with vector icons
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius } from '../theme';

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

const TAB_ICONS = {
    HomeTab: 'view-dashboard-outline',
    AssignmentsTab: 'clipboard-text-outline',
    FocusTab: 'timer-outline',
    LeaderboardTab: 'trophy-outline',
    ProgressTab: 'chart-line',
    ProfileTab: 'account-outline',
};

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                    height: 64,
                    backgroundColor: 'rgba(19, 28, 49, 0.92)',
                    borderTopWidth: 0,
                    borderRadius: BorderRadius.xxl,
                    borderWidth: 1,
                    borderColor: Colors.glass.border,
                    paddingBottom: 0,
                    paddingTop: 0,
                    // Shadow for floating effect
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 24,
                    elevation: 12,
                },
                tabBarActiveTintColor: Colors.accent.blue,
                tabBarInactiveTintColor: Colors.text.muted,
                tabBarShowLabel: false,
                tabBarIcon: ({ focused, color }) => {
                    const iconName = TAB_ICONS[route.name] || 'circle-outline';
                    return (
                        <View style={styles.tabItem}>
                            <MaterialCommunityIcons
                                name={iconName}
                                size={24}
                                color={color}
                            />
                            {focused && <View style={styles.activeIndicator} />}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStackNavigator}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="AssignmentsTab"
                component={AssignmentsScreen}
                options={{ tabBarLabel: 'Tasks' }}
            />
            <Tab.Screen
                name="FocusTab"
                component={FocusStackNavigator}
                options={{ tabBarLabel: 'Focus' }}
            />
            <Tab.Screen
                name="LeaderboardTab"
                component={LeaderboardScreen}
                options={{ tabBarLabel: 'Board' }}
            />
            <Tab.Screen
                name="ProgressTab"
                component={ProgressScreen}
                options={{ tabBarLabel: 'Stats' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 4,
    },
    activeIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.accent.blue,
        marginTop: 4,
    },
});
