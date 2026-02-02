import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { clothApi, Cloth } from '../../services/api';
import { ClothCard } from '../../components/ClothCard';
import { ClothModal } from '../../components/ClothModal';
import { FilterBar } from '../../components/FilterBar';
import { Spacing, FontSize, BorderRadius } from '../../constants/Colors';

export default function HomeScreen() {
    const [clothes, setClothes] = useState<Cloth[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { colors } = useTheme();
    const router = useRouter();

    const fetchClothes = async () => {
        try {
            const data = await clothApi.getAll({
                sortBy,
                sortOrder,
                search: searchQuery || undefined,
            });
            setClothes(data);
        } catch (error) {
            console.error('Error fetching clothes:', error);
            Alert.alert('Error', 'Failed to fetch clothes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchClothes();
        }, [sortBy, sortOrder])
    );

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchClothes();
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchClothes();
    };

    const handleClothPress = (cloth: Cloth) => {
        setSelectedCloth(cloth);
        setModalVisible(true);
    };

    const handleFavoriteToggle = async (clothId: string) => {
        try {
            await clothApi.toggleFavorite(clothId);
            setClothes(prev =>
                prev.map(c =>
                    c.clothId === clothId ? { ...c, favorite: !c.favorite } : c
                )
            );
            if (selectedCloth?.clothId === clothId) {
                setSelectedCloth(prev => prev ? { ...prev, favorite: !prev.favorite } : null);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleDeleteCloth = async () => {
        if (!selectedCloth) return;

        Alert.alert(
            'Delete Cloth',
            `Are you sure you want to delete "${selectedCloth.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clothApi.delete(selectedCloth.clothId);
                            setClothes(prev => prev.filter(c => c.clothId !== selectedCloth.clothId));
                            setModalVisible(false);
                            setSelectedCloth(null);
                        } catch (error) {
                            console.error('Error deleting cloth:', error);
                            Alert.alert('Error', 'Failed to delete cloth');
                        }
                    },
                },
            ]
        );
    };

    const renderClothCard = ({ item }: { item: Cloth }) => (
        <ClothCard
            cloth={item}
            onPress={() => handleClothPress(item)}
            onFavoriteToggle={() => handleFavoriteToggle(item.clothId)}
        />
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchWrapper, { backgroundColor: colors.surfaceVariant }]}>
                    <Ionicons name="search" size={20} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search clothes..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/add-cloth')}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Filter Bar */}
            <FilterBar
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={setSortBy}
                onSortOrderToggle={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                onFilterPress={() => { }}
                activeFiltersCount={0}
            />

            {/* Clothes Grid */}
            {clothes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="shirt-outline" size={80} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No clothes yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Add your first cloth to get started
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
                    renderItem={renderClothCard}
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

            {/* Cloth Detail Modal */}
            <ClothModal
                cloth={selectedCloth}
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedCloth(null);
                }}
                onFavoriteToggle={() => selectedCloth && handleFavoriteToggle(selectedCloth.clothId)}
                onDelete={handleDeleteCloth}
                onEdit={() => {
                    // TODO: Navigate to edit screen
                }}
                onMoveToBag={() => {
                    // Refresh clothes list and close modal after moving
                    fetchClothes();
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
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        gap: Spacing.sm,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        height: 48,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSize.md,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    listContent: {
        paddingTop: Spacing.md,
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
