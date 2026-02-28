// StarFocus — Main Entry Point
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from './src/lib/supabase';
import { CONFIG } from './src/lib/config';

import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { Colors } from './src/theme';

// Configure GoogleSignin once at app startup (not in AuthScreen to avoid re-config on re-mount)
GoogleSignin.configure({
  webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID,
  scopes: [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
    'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  ],
  // offlineAccess intentionally omitted — not needed for Supabase idToken flow
});

/**
 * Ensure a user record exists in the public.users table.
 * Called once after successful sign-in.
 */
async function ensureUserRecord(authUser) {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', authUser.id)
      .single();

    if (!existing) {
      await supabase.from('users').insert({
        auth_id: authUser.id,
        display_name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split('@')[0] ||
          'User',
        email: authUser.email,
        leaderboard_opt_in: false,
      });
    }
  } catch (err) {
    // Non-fatal — user row will be created on next sign-in
    console.warn('ensureUserRecord:', err.message);
  }
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        ensureUserRecord(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
