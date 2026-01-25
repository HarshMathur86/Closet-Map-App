import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, FontSize, BorderRadius } from '../../constants/Colors';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { colors, theme, setTheme, isDark } = useTheme();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout
                },
            ]
        );
    };

    const themeOptions = [
        { value: 'light', label: 'Light', icon: 'sunny' },
        { value: 'dark', label: 'Dark', icon: 'moon' },
        { value: 'system', label: 'System', icon: 'phone-portrait' },
    ] as const;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.content}
        >
            {/* User Info */}
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.avatarText}>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={[styles.email, { color: colors.text }]}>{user?.email}</Text>
                <Text style={[styles.userId, { color: colors.textMuted }]}>ID: {user?.uid.substring(0, 8)}...</Text>
            </View>

            {/* Theme Settings */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    APPEARANCE
                </Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    {themeOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.themeOption,
                                option.value !== 'system' && styles.themeOptionBorder,
                                { borderBottomColor: colors.border }
                            ]}
                            onPress={() => setTheme(option.value)}
                        >
                            <View style={styles.themeOptionLeft}>
                                <Ionicons
                                    name={option.icon as any}
                                    size={22}
                                    color={theme === option.value ? colors.primary : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.themeOptionText,
                                    { color: theme === option.value ? colors.primary : colors.text }
                                ]}>
                                    {option.label}
                                </Text>
                            </View>
                            {theme === option.value && (
                                <Ionicons name="checkmark" size={22} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* App Info */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    ABOUT
                </Text>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Version</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                            {Constants.expoConfig?.version ? `${Constants.expoConfig.version}` : '1.0.0'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Logout */}
            <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: colors.surface }]}
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={22} color={colors.error} />
                <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
            </TouchableOpacity>

            {/* Footer */}
            <TouchableOpacity
                onPress={() => Linking.openURL('https://github.com/HarshMathur86')}
                style={styles.madeByContainer}
            >
                <Text style={[styles.madeByText, { color: colors.textSecondary }]}>
                    Made with ❤️ by <Text style={[styles.link, { color: colors.primary }]}>HarshMathur86</Text>
                </Text>
            </TouchableOpacity>

            <Text style={[styles.footer, { color: colors.textMuted }]}>
                ClosetMap © 2026
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    card: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        color: 'white',
        fontSize: FontSize.xxxl,
        fontWeight: '700',
    },
    email: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    userId: {
        fontSize: FontSize.sm,
    },
    section: {
        marginTop: Spacing.xl,
    },
    sectionTitle: {
        fontSize: FontSize.xs,
        fontWeight: '600',
        marginBottom: Spacing.sm,
        marginLeft: Spacing.md,
        letterSpacing: 0.5,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        width: '100%',
    },
    themeOptionBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    themeOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    themeOptionText: {
        fontSize: FontSize.md,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        width: '100%',
    },
    infoLabel: {
        fontSize: FontSize.md,
    },
    infoValue: {
        fontSize: FontSize.md,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.xl,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    logoutText: {
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        marginTop: Spacing.md,
        fontSize: FontSize.xs,
        opacity: 0.7,
    },
    madeByContainer: {
        marginTop: Spacing.xxl,
        alignItems: 'center',
    },
    madeByText: {
        fontSize: FontSize.sm,
        fontWeight: '500',
    },
    link: {
        fontWeight: '700',
    },
});
