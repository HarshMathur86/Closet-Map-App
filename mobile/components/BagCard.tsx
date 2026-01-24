import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Bag } from '../services/api';
import { BorderRadius, Spacing, FontSize } from '../constants/Colors';

interface BagCardProps {
    bag: Bag;
    onPress: () => void;
    onEdit?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

// Gradient colors for bags
const GRADIENTS = [
    ['#6366F1', '#818CF8'],
    ['#EC4899', '#F472B6'],
    ['#10B981', '#34D399'],
    ['#F59E0B', '#FBBF24'],
    ['#8B5CF6', '#A78BFA'],
    ['#06B6D4', '#22D3EE'],
];

export const BagCard: React.FC<BagCardProps> = ({ bag, onPress, onEdit }) => {
    const { colors } = useTheme();

    // Get gradient based on bag number or use hash code
    let bagIndex = 0;
    if (bag.bagId.startsWith('B')) {
        const num = parseInt(bag.bagId.replace('B', ''));
        if (!isNaN(num)) {
            bagIndex = Math.max(0, num - 1);
        }
    } else {
        // Fallback for non-standard IDs
        bagIndex = bag.bagId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    }

    // Ensure accurate type matching for LinearGradient colors
    const gradient = GRADIENTS[bagIndex % GRADIENTS.length] as any;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.bagId}>{bag.bagId}</Text>
                    {onEdit && (
                        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                            <Ionicons name="ellipsis-horizontal" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.content}>
                    <Ionicons name="bag-outline" size={40} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.name} numberOfLines={2}>{bag.name}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.countBadge}>
                        <Ionicons name="shirt-outline" size={14} color="white" />
                        <Text style={styles.count}>{bag.clothCount || 0}</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.2,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        padding: Spacing.md,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bagId: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    editButton: {
        padding: Spacing.xs,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    name: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: 'white',
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    countBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    count: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        color: 'white',
        marginLeft: Spacing.xs,
    },
});
