import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { clothApi, bagApi, Cloth, Bag } from '../../services/api';
import { ClothCard } from '../../components/ClothCard';
import { ClothModal } from '../../components/ClothModal';
import { Spacing, FontSize, BorderRadius } from '../../constants/Colors';

export default function BagContentsScreen() {
    const { bagId } = useLocalSearchParams<{ bagId: string }>();
    const [bag, setBag] = useState<Bag | null>(null);
    const [clothes, setClothes] = useState<Cloth[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { colors } = useTheme();
    const router = useRouter();

    const fetchData = async () => {
        try {
            const [bagData, clothesData] = await Promise.all([
                bagApi.getOne(bagId!),
                clothApi.getAll({ bagId }),
            ]);
            setBag(bagData);
            setClothes(clothesData);
        } catch (error) {
            console.error('Error fetching bag contents:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [bagId])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleFavoriteToggle = async (clothId: string) => {
        try {
            await clothApi.toggleFavorite(clothId);
            setClothes(prev =>
                prev.map(c =>
                    c.clothId === clothId ? { ...c, favorite: !c.favorite } : c
                )
            );
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Bag Header */}
            {bag && (
                <View style={[styles.header, { backgroundColor: colors.surface }]}>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.bagId, { color: colors.primary }]}>{bag.bagId}</Text>
                        <Text style={[styles.bagName, { color: colors.text }]}>{bag.name}</Text>
                        <Text style={[styles.bagMeta, { color: colors.textMuted }]}>
                            {clothes.length} item{clothes.length !== 1 ? 's' : ''}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/add-cloth')}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Clothes Grid */}
            {clothes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="shirt-outline" size={60} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Empty Bag</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        No clothes in this bag yet
                    </Text>
                    <TouchableOpacity
                        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/add-cloth')}
                    >
                        <Ionicons name="add" size={20} color="white" />
                        <Text style={styles.emptyButtonText}>Add Cloth</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={clothes}
                    renderItem={({ item }) => (
                        <ClothCard
                            cloth={item}
                            onPress={() => {
                                setSelectedCloth(item);
                                setModalVisible(true);
                            }}
                            onFavoriteToggle={() => handleFavoriteToggle(item.clothId)}
                        />
                    )}
                    keyExtractor={(item) => item.clothId}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}

            {/* Cloth Modal */}
            <ClothModal
                cloth={selectedCloth}
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedCloth(null);
                }}
                onFavoriteToggle={() => selectedCloth && handleFavoriteToggle(selectedCloth.clothId)}
                onDelete={() => {
                    if (selectedCloth) {
                        clothApi.delete(selectedCloth.clothId).then(() => {
                            setClothes(prev => prev.filter(c => c.clothId !== selectedCloth.clothId));
                            setModalVisible(false);
                            setSelectedCloth(null);
                        });
                    }
                }}
                onMoveToBag={() => {
                    // Refresh bag contents and close modal after moving
                    fetchData();
                    setModalVisible(false);
                    setSelectedCloth(null);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    headerInfo: {
        flex: 1,
    },
    bagId: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        marginBottom: 2,
    },
    bagName: {
        fontSize: FontSize.xl,
        fontWeight: '700',
    },
    bagMeta: {
        fontSize: FontSize.sm,
        marginTop: 2,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    listContent: {
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xxl,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: FontSize.md,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    emptyButtonText: {
        color: 'white',
        fontSize: FontSize.md,
        fontWeight: '600',
    },
});
