// AuthScreen — Google Sign-In + Supabase Auth
// Premium glassmorphism welcome/onboarding screen
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import GlassCard from '../components/GlassCard';

const FEATURES = [
    { icon: 'brain', title: 'Smart Priority', desc: 'AI-ranked tasks from Google Classroom' },
    { icon: 'timer-outline', title: 'Focus Sprints', desc: 'Deep work sessions with real-time scoring' },
    { icon: 'shield-check-outline', title: 'Distraction Shield', desc: 'Gentle interventions when you drift' },
    { icon: 'trophy-outline', title: 'Compete & Grow', desc: 'Leaderboards, streaks, and badges' },
];

export default function AuthScreen() {
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
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
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // User cancelled
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
                    <View style={styles.logoContainer}>
                        <MaterialCommunityIcons name="star-four-points" size={40} color={Colors.accent.blue} />
                    </View>
                    <Text style={styles.appName}>StarFocus</Text>
                    <Text style={styles.tagline}>
                        Reclaiming your focus,{'\n'}one sprint at a time
                    </Text>
                </View>

                {/* Feature preview */}
                <View style={styles.features}>
                    {FEATURES.map((f, i) => (
                        <GlassCard key={i} style={styles.featureCard}>
                            <View style={styles.featureIconContainer}>
                                <MaterialCommunityIcons name={f.icon} size={22} color={Colors.accent.blue} />
                            </View>
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
                            <View style={styles.signInContent}>
                                <MaterialCommunityIcons name="google" size={20} color={Colors.text.primary} />
                                <Text style={styles.signInText}>Continue with Google</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.disclaimer}>
                        Privacy-first  ·  Your usage data never leaves your device
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
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: Colors.glass.bg,
        borderWidth: 1,
        borderColor: Colors.glass.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    appName: { ...Typography.h1, color: Colors.text.primary, fontSize: 36, letterSpacing: -1 },
    tagline: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 24 },
    features: { gap: Spacing.sm },
    featureCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.md },
    featureIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.glass.highlight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    featureContent: { flex: 1 },
    featureTitle: { ...Typography.bodyBold, color: Colors.text.primary },
    featureDesc: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
    authSection: { alignItems: 'center', marginBottom: Spacing.md },
    signInButton: {
        backgroundColor: Colors.accent.blue,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xxl,
        borderRadius: BorderRadius.full,
        width: '100%',
        alignItems: 'center',
    },
    signInContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    signInText: { ...Typography.bodyBold, color: Colors.text.primary, fontSize: 16 },
    disclaimer: { ...Typography.caption, color: Colors.text.muted, marginTop: Spacing.md, textAlign: 'center' },
});
