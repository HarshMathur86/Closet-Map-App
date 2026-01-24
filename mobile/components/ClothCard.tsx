import React from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Cloth } from '../services/api';
import { BorderRadius, Spacing, FontSize } from '../constants/Colors';

interface ClothCardProps {
    cloth: Cloth;
    onPress: () => void;
    onFavoriteToggle?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 3) / 2;

export const ClothCard: React.FC<ClothCardProps> = ({
    cloth,
    onPress,
    onFavoriteToggle
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: cloth.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    style={[styles.favoriteButton, { backgroundColor: colors.surface }]}
                    onPress={onFavoriteToggle}
                >
                    <Ionicons
                        name={cloth.favorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={cloth.favorite ? colors.favorite : colors.textMuted}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text
                    style={[styles.name, { color: colors.text }]}
                    numberOfLines={1}
                >
                    {cloth.name}
                </Text>

                <View style={styles.meta}>
                    <View style={[styles.colorDot, { backgroundColor: cloth.color }]} />
                    <Text
                        style={[styles.bagName, { color: colors.textSecondary }]}
                        numberOfLines={1}
                    >
                        {cloth.bagName || cloth.containerBagId}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: CARD_WIDTH,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    content: {
        padding: Spacing.sm,
    },
    name: {
        fontSize: FontSize.md,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: Spacing.xs,
    },
    bagName: {
        fontSize: FontSize.xs,
        flex: 1,
    },
});
