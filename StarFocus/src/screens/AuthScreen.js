// AuthScreen — Google Sign-In + Supabase Auth
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import GlassCard from '../components/GlassCard';

const FEATURES = [
    { emoji: '🧠', title: 'Smart Priority', desc: 'AI-ranked tasks from Google Classroom' },
    { emoji: '⚡', title: 'Focus Sprints', desc: 'Deep work sessions with real-time scoring' },
    { emoji: '🛡️', title: 'Distraction Shield', desc: 'Gentle interventions when you drift' },
    { emoji: '🏆', title: 'Compete & Grow', desc: 'Leaderboards, streaks, and badges' },
];

export default function AuthScreen() {
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Sign out first to force the account picker (prevents stuck loop)
            try { await GoogleSignin.signOut(); } catch (_) { }

            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo?.data?.idToken ?? userInfo?.idToken;

            if (!idToken) {
                throw new Error('No ID token returned from Google Sign-In.');
            }

            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });

            if (error) throw error;
            // App.js onAuthStateChange handles navigation automatically

        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // User cancelled — silently ignore
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Alert.alert('Please wait', 'Sign-in is already in progress.');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Google Play Services', 'Please update Google Play Services and try again.');
            } else {
                Alert.alert('Sign-In Failed', error.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Brand */}
                <View style={styles.brand}>
                    <Text style={styles.emoji}>⭐</Text>
                    <Text style={styles.appName}>StarFocus</Text>
                    <Text style={styles.tagline}>
                        Reclaiming your focus,{'\n'}one sprint at a time
                    </Text>
                </View>

                {/* Feature preview */}
                <View style={styles.features}>
                    {FEATURES.map((f, i) => (
                        <GlassCard key={i} style={styles.featureCard}>
                            <Text style={styles.featureEmoji}>{f.emoji}</Text>
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>{f.title}</Text>
                                <Text style={styles.featureDesc}>{f.desc}</Text>
                            </View>
                        </GlassCard>
                    ))}
                </View>

                {/* Sign in */}
                <View style={styles.authSection}>
                    <TouchableOpacity
                        style={[styles.signInButton, Shadows.glow(Colors.accent.blue)]}
                        onPress={handleSignIn}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.text.primary} />
                        ) : (
                            <Text style={styles.signInText}>Continue with Google</Text>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.disclaimer}>
                        Privacy-first • Your usage data never leaves your device
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.bg.primary },
    container: { flex: 1, justifyContent: 'space-between', padding: Spacing.lg },
    brand: { alignItems: 'center', marginTop: Spacing.xxl },
    emoji: { fontSize: 56, marginBottom: Spacing.sm },
    appName: { ...Typography.h1, color: Colors.text.primary, fontSize: 36, letterSpacing: -1 },
    tagline: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 24 },
    features: { gap: Spacing.sm },
    featureCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.md },
    featureEmoji: { fontSize: 28, marginRight: Spacing.md },
    featureContent: { flex: 1 },
    featureTitle: { ...Typography.bodyBold, color: Colors.text.primary },
    featureDesc: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
    authSection: { alignItems: 'center', marginBottom: Spacing.md },
    signInButton: {
        backgroundColor: Colors.accent.blue,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xxl,
        borderRadius: BorderRadius.lg,
        width: '100%',
        alignItems: 'center',
    },
    signInText: { ...Typography.bodyBold, color: Colors.text.primary, fontSize: 16 },
    disclaimer: { ...Typography.caption, color: Colors.text.muted, marginTop: Spacing.md, textAlign: 'center' },
});
