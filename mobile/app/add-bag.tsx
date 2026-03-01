import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { bagApi } from '../services/api';
import { Spacing, FontSize, BorderRadius } from '../constants/Colors';

export default function AddBagScreen() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name for the bag');
            return;
        }

        setLoading(true);
        try {
            const newBag = await bagApi.create(name.trim());
            Alert.alert(
                'Success!',
                `Bag "${newBag.name}" created with ID ${newBag.bagId}`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error creating bag:', error);
            Alert.alert('Error', 'Failed to create bag');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceVariant }]}>
                    <Ionicons name="bag" size={64} color={colors.primary} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Create New Bag</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Give your bag a name to help you identify it
                </Text>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Bag Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Winter Clothes, Kids Room"
                        placeholderTextColor={colors.textMuted}
                        autoFocus
                    />
                </View>

                {/* Info */}
                <View style={[styles.infoBox, { backgroundColor: `${colors.primary}15` }]}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        A unique barcode will be automatically generated for this bag
                    </Text>
                </View>
            </View>

            {/* Submit Button */}
            <View style={[
                styles.footer,
                { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 24) }
            ]}>
                <TouchableOpacity
                    style={[styles.submitButton, { opacity: loading ? 0.7 : 1 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={20} color="white" />
                                <Text style={styles.submitText}>Create Bag</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
        alignItems: 'center',
        paddingTop: Spacing.xxl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: FontSize.md,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    inputContainer: {
        width: '100%',
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    input: {
        height: 52,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: FontSize.md,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: FontSize.sm,
        lineHeight: 20,
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    submitButton: {
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    submitText: {
        color: 'white',
        fontSize: FontSize.md,
        fontWeight: '700',
    },
});
