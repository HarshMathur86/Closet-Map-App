import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { bagApi, Bag } from '../../services/api';
import { BagCard } from '../../components/BagCard';
import { Spacing, FontSize, BorderRadius } from '../../constants/Colors';

export default function BagsScreen() {
    const [bags, setBags] = useState<Bag[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedBag, setSelectedBag] = useState<Bag | null>(null);
    const [editName, setEditName] = useState('');

    const { colors } = useTheme();
    const router = useRouter();

    const fetchBags = async () => {
        try {
            const data = await bagApi.getAll();
            setBags(data);
        } catch (error) {
            console.error('Error fetching bags:', error);
            Alert.alert('Error', 'Failed to fetch bags');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBags();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBags();
    };

    const handleBagPress = (bag: Bag) => {
        router.push(`/bag/${bag.bagId}`);
    };

    const handleEditBag = (bag: Bag) => {
        setSelectedBag(bag);
        setEditName(bag.name);
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedBag || !editName.trim()) return;

        try {
            await bagApi.update(selectedBag.bagId, editName.trim());
            setBags(prev =>
                prev.map(b =>
                    b.bagId === selectedBag.bagId ? { ...b, name: editName.trim() } : b
                )
            );
            setEditModalVisible(false);
            setSelectedBag(null);
        } catch (error) {
            console.error('Error updating bag:', error);
            Alert.alert('Error', 'Failed to update bag');
        }
    };

    const handleDeleteBag = async () => {
        if (!selectedBag) return;

        Alert.alert(
            'Delete Bag',
            `Are you sure you want to delete "${selectedBag.name}"? This will remove all clothes in this bag.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bagApi.delete(selectedBag.bagId);
                            setBags(prev => prev.filter(b => b.bagId !== selectedBag.bagId));
                            setEditModalVisible(false);
                            setSelectedBag(null);
                        } catch (error) {
                            console.error('Error deleting bag:', error);
                            Alert.alert('Error', 'Failed to delete bag');
                        }
                    },
                },
            ]
        );
    };

    const renderBagCard = ({ item }: { item: Bag }) => (
        <BagCard
            bag={item}
            onPress={() => handleBagPress(item)}
            onEdit={() => handleEditBag(item)}
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
            {/* Header Actions */}
            <View style={styles.headerActions}>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/add-bag')}
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.addButtonText}>New Bag</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.exportButton, { backgroundColor: colors.surfaceVariant }]}
                    onPress={() => Alert.alert('Export', 'Opening barcode PDF...')}
                >
                    <Ionicons name="download-outline" size={20} color={colors.primary} />
                    <Text style={[styles.exportButtonText, { color: colors.primary }]}>Export Barcodes</Text>
                </TouchableOpacity>
            </View>

            {/* Bags Grid */}
            {bags.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="bag-outline" size={80} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No bags yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Create your first bag to start organizing
                    </Text>
                    <TouchableOpacity
                        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/add-bag')}
                    >
                        <Ionicons name="add" size={20} color="white" />
                        <Text style={styles.emptyButtonText}>Create Bag</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={bags}
                    renderItem={renderBagCard}
                    keyExtractor={(item) => item.bagId}
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

            {/* Edit Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setEditModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setEditModalVisible(false)}
                >
                    <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Bag</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Bag Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text }]}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Enter bag name"
                                placeholderTextColor={colors.textMuted}
                            />

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                                onPress={handleSaveEdit}
                            >
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.deleteButton, { borderColor: colors.error }]}
                                onPress={handleDeleteBag}
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                                <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete Bag</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>
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
    headerActions: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    addButtonText: {
        color: 'white',
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    exportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    exportButtonText: {
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    listContent: {
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    modalTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
    },
    modalBody: {
        gap: Spacing.md,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    input: {
        height: 48,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: FontSize.md,
    },
    saveButton: {
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    saveButtonText: {
        color: 'white',
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    deleteButton: {
        flexDirection: 'row',
        height: 48,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    deleteButtonText: {
        fontSize: FontSize.md,
        fontWeight: '600',
    },
});
