// StarFocus — Main Entry Point
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { supabase } from './src/lib/supabase';

import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { Colors } from './src/theme';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session with a timeout fallback
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setLoading(false);
        }
      } catch (error) {
        console.warn('Session check failed:', error);
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    // Safety timeout in case Supabase hangs
    const timer = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 3000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setLoading(false); // Ensure loading is false on any auth event
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription?.unsubscribe();
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent.blue} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {session ? (
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        ) : (
          <AuthScreen />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
      ignoreDuplicates: true, // Don't overwrite if already exists
    });
    if (error) console.warn('Profile upsert warning:', error.message);
  } catch (e) {
    console.warn('ensureUserProfile error:', e);
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
