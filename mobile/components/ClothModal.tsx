import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Cloth, clothApi } from '../services/api';
import { BorderRadius, Spacing, FontSize } from '../constants/Colors';
import { BagSelectionModal } from './BagSelectionModal';

interface ClothModalProps {
    cloth: Cloth | null;
    visible: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onFavoriteToggle?: () => void;
    onMoveToBag?: (newBagId: string, newBagName: string) => void;
}

const { width, height } = Dimensions.get('window');

export const ClothModal: React.FC<ClothModalProps> = ({
    cloth,
    visible,
    onClose,
    onEdit,
    onDelete,
    onFavoriteToggle,
    onMoveToBag,
}) => {
    const { colors } = useTheme();
    const [bagSelectionVisible, setBagSelectionVisible] = useState(false);
    const [isMoving, setIsMoving] = useState(false);

    if (!cloth) return null;

    const handleBagPress = () => {
        setBagSelectionVisible(true);
    };

    const handleSelectBag = async (newBagId: string, newBagName: string) => {
        setBagSelectionVisible(false);
        setIsMoving(true);

        try {
            await clothApi.update(cloth.clothId, { containerBagId: newBagId });
            Alert.alert(
                'Success',
                `"${cloth.name}" moved to "${newBagName}"`,
                [{ text: 'OK' }]
            );
            onMoveToBag?.(newBagId, newBagName);
        } catch (error) {
            console.error('Error moving cloth:', error);
            Alert.alert('Error', 'Failed to move cloth. Please try again.');
        } finally {
            setIsMoving(false);
        }
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
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={onFavoriteToggle} style={styles.actionButton}>
                            <Ionicons
                                name={cloth.favorite ? 'heart' : 'heart-outline'}
                                size={24}
                                color={cloth.favorite ? colors.favorite : colors.text}
                            />
                        </TouchableOpacity>
                        {/* TODO: Edit feature - uncomment when implemented
                        {onEdit && (
                            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                                <Ionicons name="create-outline" size={24} color={colors.text} />
                            </TouchableOpacity>
                        )}
                        */}
                    </View>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: cloth.imageUrl }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Details */}
                    <View style={styles.details}>
                        <Text style={[styles.name, { color: colors.text }]}>{cloth.name}</Text>

                        {/* Bag Info */}
                        <TouchableOpacity
                            style={[styles.bagInfo, { backgroundColor: colors.surfaceVariant }]}
                            onPress={handleBagPress}
                            disabled={isMoving}
                        >
                            {isMoving ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Ionicons name="bag" size={20} color={colors.primary} />
                            )}
                            <Text style={[styles.bagName, { color: colors.text }]}>
                                {cloth.bagName || cloth.containerBagId}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </TouchableOpacity>

                        {/* Attributes */}
                        <View style={styles.attributes}>
                            <View style={[styles.attribute, { backgroundColor: colors.surfaceVariant }]}>
                                <Text style={[styles.attrLabel, { color: colors.textSecondary }]}>Color</Text>
                                <View style={[styles.colorDot, { backgroundColor: cloth.color, borderColor: colors.border }]} />
                            </View>

                            {cloth.category && (
                                <View style={[styles.attribute, { backgroundColor: colors.surfaceVariant }]}>
                                    <Text style={[styles.attrLabel, { color: colors.textSecondary }]}>Category</Text>
                                    <Text style={[styles.attrValue, { color: colors.text }]}>{cloth.category}</Text>
                                </View>
                            )}

                            {cloth.owner && (
                                <View style={[styles.attribute, { backgroundColor: colors.surfaceVariant }]}>
                                    <Text style={[styles.attrLabel, { color: colors.textSecondary }]}>Owner</Text>
                                    <Text style={[styles.attrValue, { color: colors.text }]}>{cloth.owner}</Text>
                                </View>
                            )}
                        </View>

                        {/* Notes */}
                        {cloth.notes && (
                            <View style={[styles.notesContainer, { backgroundColor: colors.surfaceVariant }]}>
                                <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes</Text>
                                <Text style={[styles.notes, { color: colors.text }]}>{cloth.notes}</Text>
                            </View>
                        )}

                        {/* Timestamps */}
                        <View style={styles.timestamps}>
                            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                                Added: {new Date(cloth.createdAt).toLocaleDateString()}
                            </Text>
                            <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                                Last moved: {new Date(cloth.lastMovedTimestamp).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Delete Button */}
                {onDelete && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.deleteButton, { backgroundColor: colors.error }]}
                            onPress={onDelete}
                        >
                            <Ionicons name="trash-outline" size={20} color="white" />
                            <Text style={styles.deleteText}>Delete Cloth</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>

            {/* Bag Selection Modal */}
            <BagSelectionModal
                visible={bagSelectionVisible}
                currentBagId={cloth.containerBagId}
                onClose={() => setBagSelectionVisible(false)}
                onSelectBag={handleSelectBag}
            />
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
    headerActions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: Spacing.sm,
        marginLeft: Spacing.sm,
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        width: width,
        height: width * 0.8,
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    details: {
        padding: Spacing.lg,
    },
    name: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        marginBottom: Spacing.md,
    },
    bagInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
    },
    bagName: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: '600',
        marginLeft: Spacing.sm,
    },
    attributes: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    attribute: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attrLabel: {
        fontSize: FontSize.xs,
        marginBottom: Spacing.xs,
    },
    attrValue: {
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    colorDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
    },
    notesContainer: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
    },
    notesLabel: {
        fontSize: FontSize.xs,
        marginBottom: Spacing.sm,
    },
    notes: {
        fontSize: FontSize.md,
        lineHeight: 22,
    },
    timestamps: {
        marginTop: Spacing.md,
    },
    timestamp: {
        fontSize: FontSize.xs,
        marginBottom: Spacing.xs,
    },
    footer: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    deleteText: {
        color: 'white',
        fontSize: FontSize.md,
        fontWeight: '600',
        marginLeft: Spacing.sm,
    },
});
