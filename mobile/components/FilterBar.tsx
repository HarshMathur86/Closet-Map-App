import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing, FontSize } from '../constants/Colors';

interface FilterBarProps {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (sortBy: string) => void;
    onSortOrderToggle: () => void;
    onFilterPress: () => void;
    activeFiltersCount: number;
}

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'name', label: 'Name' },
    { value: 'color', label: 'Color' },
    { value: 'owner', label: 'Owner' },
    { value: 'containerBagId', label: 'Bag' },
    { value: 'favorite', label: 'Favorites' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
    sortBy,
    sortOrder,
    onSortChange,
    onSortOrderToggle,
    onFilterPress,
    activeFiltersCount,
}) => {
    const { colors } = useTheme();
    const [showSortModal, setShowSortModal] = React.useState(false);

    const currentSort = SORT_OPTIONS.find(o => o.value === sortBy);

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Sort Button */}
                <TouchableOpacity
                    style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setShowSortModal(true)}
                >
                    <Ionicons name="swap-vertical" size={16} color={colors.primary} />
                    <Text style={[styles.chipText, { color: colors.text }]}>
                        {currentSort?.label || 'Sort'}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
                </TouchableOpacity>

                {/* Order Toggle */}
                <TouchableOpacity
                    style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={onSortOrderToggle}
                >
                    <Ionicons
                        name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                        size={16}
                        color={colors.primary}
                    />
                    <Text style={[styles.chipText, { color: colors.text }]}>
                        {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                    </Text>
                </TouchableOpacity>

                {/* Filter Button */}
                <TouchableOpacity
                    style={[
                        styles.chip,
                        {
                            backgroundColor: activeFiltersCount > 0 ? colors.primary : colors.surface,
                            borderColor: activeFiltersCount > 0 ? colors.primary : colors.border,
                        }
                    ]}
                    onPress={onFilterPress}
                >
                    <Ionicons
                        name="filter"
                        size={16}
                        color={activeFiltersCount > 0 ? 'white' : colors.primary}
                    />
                    <Text style={[
                        styles.chipText,
                        { color: activeFiltersCount > 0 ? 'white' : colors.text }
                    ]}>
                        Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowSortModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSortModal(false)}
                >
                    <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Sort By</Text>
                            <TouchableOpacity onPress={() => setShowSortModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        {SORT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.sortOption}
                                onPress={() => {
                                    onSortChange(option.value);
                                    setShowSortModal(false);
                                }}
                            >
                                <Text style={[
                                    styles.sortOptionText,
                                    { color: sortBy === option.value ? colors.primary : colors.text }
                                ]}>
                                    {option.label}
                                </Text>
                                {sortBy === option.value && (
                                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </SafeAreaView>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.sm,
    },
    scrollContent: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    chipText: {
        fontSize: FontSize.sm,
        fontWeight: '500',
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
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    sortOptionText: {
        fontSize: FontSize.md,
    },
});
