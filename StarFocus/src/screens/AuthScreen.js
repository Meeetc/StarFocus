// AuthScreen — Google Sign-In with Supabase
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { CONFIG } from '../lib/config';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import GlassCard from '../components/GlassCard';

const FEATURES = [
    { icon: 'bulb', title: 'Smart Priority', desc: 'Auto-ranked tasks from Google Classroom' },
    { icon: 'flash', title: 'Focus Sprints', desc: 'Deep work sessions with real-time scoring' },
    { icon: 'shield-checkmark', title: 'Distraction Shield', desc: 'Gentle interventions when you drift' },
    { icon: 'trophy', title: 'Compete & Grow', desc: 'Leaderboards, streaks, and badges' },
];

export default function AuthScreen() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID,
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });
    }, []);

    const handleSignIn = async () => {
        if (loading) return; // Prevent double-tap
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: userInfo.data.idToken,
                });

                if (error) throw error;
                // Session will be picked up by App.js onAuthStateChange — no need to do anything else
            } else {
                throw new Error('No ID token returned from Google');
            }
        } catch (error) {
            console.error('Sign In Error:', error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // User cancelled — do nothing
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // Already in progress — do nothing
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Play Services', 'Google Play Services not available.');
            } else {
                Alert.alert('Auth Error', error.message || 'An unexpected error occurred during sign-in.');
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
                    <Ionicons name="star" size={56} color={Colors.accent.gold} />
                    <Text style={styles.appName}>StarFocus</Text>
                    <Text style={styles.tagline}>
                        Reclaiming your focus,{'\n'}one sprint at a time
                    </Text>
                </View>

                {/* Feature preview */}
                <View style={styles.features}>
                    {FEATURES.map((f, i) => (
                        <GlassCard key={i} style={styles.featureCard}>
                            <Ionicons name={f.icon} size={28} color={Colors.accent.blue} style={styles.featureIcon} />
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
                            <View style={styles.signInRow}>
                                <Ionicons name="logo-google" size={20} color={Colors.text.primary} />
                                <Text style={styles.signInText}>  Continue with Google</Text>
                            </View>
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
    safeArea: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: Spacing.lg,
    },
    brand: {
        alignItems: 'center',
        marginTop: Spacing.xxl,
    },
    appName: {
        ...Typography.h1,
        color: Colors.text.primary,
        fontSize: 36,
        letterSpacing: -1,
        marginTop: Spacing.sm,
    },
    tagline: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginTop: Spacing.sm,
        lineHeight: 24,
    },
    features: {
        gap: Spacing.sm,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: Spacing.md,
    },
    featureIcon: {
        marginRight: Spacing.md,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
    },
    featureDesc: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: 2,
    },
    authSection: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    signInButton: {
        backgroundColor: Colors.accent.blue,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xxl,
        borderRadius: BorderRadius.lg,
        width: '100%',
        alignItems: 'center',
    },
    signInRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signInText: {
        ...Typography.bodyBold,
        color: Colors.text.primary,
        fontSize: 16,
    },
    disclaimer: {
        ...Typography.caption,
        color: Colors.text.muted,
        marginTop: Spacing.md,
        textAlign: 'center',
    },
});
