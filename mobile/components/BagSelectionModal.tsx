import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { bagApi, Bag } from '../services/api';
import { BorderRadius, Spacing, FontSize } from '../constants/Colors';

interface BagSelectionModalProps {
    visible: boolean;
    currentBagId: string;
    onClose: () => void;
    onSelectBag: (bagId: string, bagName: string) => void;
}

export const BagSelectionModal: React.FC<BagSelectionModalProps> = ({
    visible,
    currentBagId,
    onClose,
    onSelectBag,
}) => {
    const [bags, setBags] = useState<Bag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { colors } = useTheme();

    useEffect(() => {
        if (visible) {
            fetchBags();
        }
    }, [visible]);

    const fetchBags = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await bagApi.getAll();
            setBags(data);
        } catch (err) {
            console.error('Error fetching bags:', err);
            setError('Failed to load bags');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBag = (bag: Bag) => {
        if (bag.bagId === currentBagId) {
            onClose();
            return;
        }
        onSelectBag(bag.bagId, bag.name);
    };

    const renderBagItem = ({ item }: { item: Bag }) => {
        const isCurrentBag = item.bagId === currentBagId;

        return (
            <TouchableOpacity
                style={[
                    styles.bagItem,
                    { backgroundColor: colors.surfaceVariant },
                    isCurrentBag && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => handleSelectBag(item)}
                activeOpacity={0.7}
            >
                <View style={styles.bagInfo}>
                    <View style={[styles.bagIcon, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="bag" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.bagDetails}>
                        <Text style={[styles.bagName, { color: colors.text }]}>{item.name}</Text>
                        <Text style={[styles.bagId, { color: colors.textMuted }]}>
                            {item.bagId} • {item.clothCount ?? 0} items
                        </Text>
                    </View>
                </View>
                {isCurrentBag ? (
                    <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Move to Bag</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Content */}
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                            Loading bags...
                        </Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
                        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                        <TouchableOpacity
                            style={[styles.retryButton, { backgroundColor: colors.primary }]}
                            onPress={fetchBags}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : bags.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="bag-outline" size={60} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No bags available
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={bags}
                        renderItem={renderBagItem}
                        keyExtractor={(item) => item.bagId}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: Spacing.sm,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
    placeholder: {
        width: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: FontSize.md,
    },
    errorText: {
        marginTop: Spacing.md,
        fontSize: FontSize.md,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: Spacing.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    retryButtonText: {
        color: 'white',
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    emptyText: {
        marginTop: Spacing.md,
        fontSize: FontSize.md,
    },
    listContent: {
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    bagItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    bagInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    bagIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bagDetails: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    bagName: {
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    bagId: {
        fontSize: FontSize.sm,
        marginTop: 2,
    },
    currentBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    currentBadgeText: {
        color: 'white',
        fontSize: FontSize.xs,
        fontWeight: '600',
    },
});
