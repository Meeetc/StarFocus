// StarFocus — Main Entry Point
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { supabase } from './src/lib/supabase';

import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { Colors } from './src/theme';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (mounted) {
        if (error) console.error("Initial session fetch error:", error);
        setSession(session);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Session check timeout hit, forcing load');
        setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Ensure user profile exists in our users table
  useEffect(() => {
    if (session?.user) {
      ensureUserProfile(session.user);
    }
  }, [session?.user?.id]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent.blue} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <NavigationContainer theme={DarkTheme}>
          <ErrorBoundary>
            {session && session.user ? <AppNavigator /> : <AuthScreen />}
          </ErrorBoundary>
        </NavigationContainer>
        <StatusBar style="light" />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

// Create or update user profile in our users table on first sign-in
async function ensureUserProfile(user) {
  try {
    const { error } = await supabase.from('users').upsert({
      auth_id: user.id,
      display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      email: user.email,
      avatar_url: user.user_metadata?.avatar_url || null,
    }, {
      onConflict: 'auth_id',
      ignoreDuplicates: true,
    });
    if (error) console.warn('Profile upsert warning:', error.message);
  } catch (e) {
    console.warn('ensureUserProfile error:', e);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
