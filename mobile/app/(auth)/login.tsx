import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, FontSize, BorderRadius } from '../../constants/Colors';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login, error, clearError } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            // Error is handled by context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        style={styles.logoContainer}
                    >
                        <Ionicons name="shirt" size={48} color="white" />
                    </LinearGradient>
                    <Text style={[styles.title, { color: colors.text }]}>ClosetMap</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Track your clothes, find them anywhere
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {error && (
                        <View style={[styles.errorContainer, { backgroundColor: `${colors.error}20` }]}>
                            <Ionicons name="alert-circle" size={20} color={colors.error} />
                            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                            <TouchableOpacity onPress={clearError}>
                                <Ionicons name="close" size={18} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                            <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Enter your password"
                                placeholderTextColor={colors.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoComplete="password"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={colors.textMuted}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, { opacity: isLoading ? 0.7 : 1 }]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginGradient}
                        >
                            {isLoading ? (
                                <Text style={styles.loginText}>Signing in...</Text>
                            ) : (
                                <Text style={styles.loginText}>Sign In</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Don't have an account?{' '}
                    </Text>
                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { color: colors.primary }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSize.xxxl,
        fontWeight: '800',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: FontSize.md,
        textAlign: 'center',
    },
    form: {
        marginBottom: Spacing.xl,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    errorText: {
        flex: 1,
        fontSize: FontSize.sm,
    },
    inputContainer: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        height: 52,
        gap: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: FontSize.md,
    },
    loginButton: {
        marginTop: Spacing.md,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    loginGradient: {
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: 'white',
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: FontSize.md,
    },
    linkText: {
        fontSize: FontSize.md,
        fontWeight: '700',
    },
});
