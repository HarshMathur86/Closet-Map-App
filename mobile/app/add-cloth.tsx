import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { clothApi, bagApi, Bag } from '../services/api';
import { Spacing, FontSize, BorderRadius } from '../constants/Colors';

const COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
    '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
    '#A855F7', '#EC4899', '#F43F5E', '#78716C', '#1F2937',
];

const CATEGORIES = [
    'Shirts', 'Pants', 'Dresses', 'Jackets', 'Sweaters',
    'Shorts', 'Skirts', 'Suits', 'Accessories', 'Other'
];

export default function AddClothScreen() {
    const [name, setName] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [color, setColor] = useState(COLORS[0]);
    const [owner, setOwner] = useState('');
    const [category, setCategory] = useState('');
    const [selectedBagId, setSelectedBagId] = useState('');
    const [notes, setNotes] = useState('');
    const [bags, setBags] = useState<Bag[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingBags, setLoadingBags] = useState(true);

    const { colors } = useTheme();
    const router = useRouter();

    useEffect(() => {
        fetchBags();
    }, []);

    const fetchBags = async () => {
        try {
            const data = await bagApi.getAll();
            setBags(data);
            if (data.length > 0) {
                setSelectedBagId(data[0].bagId);
            }
        } catch (error) {
            console.error('Error fetching bags:', error);
        } finally {
            setLoadingBags(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Camera permission is needed to take photos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a name for the cloth');
            return;
        }
        if (!imageUri) {
            Alert.alert('Error', 'Please add an image');
            return;
        }
        if (!selectedBagId) {
            Alert.alert('Error', 'Please select a bag');
            return;
        }

        setLoading(true);
        try {
            // Convert image to base64
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onloadend = async () => {
                const base64data = reader.result as string;

                await clothApi.create({
                    name: name.trim(),
                    imageBase64: base64data,
                    color,
                    owner: owner.trim(),
                    category,
                    containerBagId: selectedBagId,
                    notes: notes.trim(),
                });

                Alert.alert('Success', 'Cloth added successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            };

            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Error adding cloth:', error);
            Alert.alert('Error', 'Failed to add cloth');
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Picker */}
                <TouchableOpacity
                    style={[styles.imagePicker, { backgroundColor: colors.surfaceVariant }]}
                    onPress={() => {
                        Alert.alert(
                            'Add Image',
                            'Choose an option',
                            [
                                { text: 'Take Photo', onPress: takePhoto },
                                { text: 'Choose from Library', onPress: pickImage },
                                { text: 'Cancel', style: 'cancel' },
                            ]
                        );
                    }}
                >
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imagePickerContent}>
                            <Ionicons name="camera" size={48} color={colors.textMuted} />
                            <Text style={[styles.imagePickerText, { color: colors.textSecondary }]}>
                                Add Photo
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Name *</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Blue Summer Dress"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                {/* Color Picker */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Color *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.colorRow}>
                            {COLORS.map((c) => (
                                <TouchableOpacity
                                    key={c}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: c },
                                        color === c && styles.colorSelected,
                                    ]}
                                    onPress={() => setColor(c)}
                                >
                                    {color === c && (
                                        <Ionicons name="checkmark" size={20} color="white" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Bag Selector */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Bag *</Text>
                    {loadingBags ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : bags.length === 0 ? (
                        <TouchableOpacity
                            style={[styles.noBagsButton, { backgroundColor: colors.surfaceVariant }]}
                            onPress={() => router.push('/add-bag')}
                        >
                            <Ionicons name="add" size={20} color={colors.primary} />
                            <Text style={[styles.noBagsText, { color: colors.primary }]}>
                                Create a bag first
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.bagRow}>
                                {bags.map((bag) => (
                                    <TouchableOpacity
                                        key={bag.bagId}
                                        style={[
                                            styles.bagOption,
                                            {
                                                backgroundColor: selectedBagId === bag.bagId
                                                    ? colors.primary
                                                    : colors.surfaceVariant
                                            },
                                        ]}
                                        onPress={() => setSelectedBagId(bag.bagId)}
                                    >
                                        <Text style={[
                                            styles.bagOptionText,
                                            {
                                                color: selectedBagId === bag.bagId
                                                    ? 'white'
                                                    : colors.text
                                            }
                                        ]}>
                                            {bag.bagId}: {bag.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    )}
                </View>

                {/* Category */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.categoryRow}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryOption,
                                        {
                                            backgroundColor: category === cat
                                                ? colors.primary
                                                : colors.surfaceVariant
                                        },
                                    ]}
                                    onPress={() => setCategory(category === cat ? '' : cat)}
                                >
                                    <Text style={[
                                        styles.categoryOptionText,
                                        { color: category === cat ? 'white' : colors.text }
                                    ]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Owner */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Owner</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surfaceVariant, color: colors.text }]}
                        value={owner}
                        onChangeText={setOwner}
                        placeholder="e.g., Mom, Dad, Kids"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                {/* Notes */}
                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Notes</Text>
                    <TextInput
                        style={[styles.textArea, { backgroundColor: colors.surfaceVariant, color: colors.text }]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add any notes..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={3}
                    />
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
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
                                <Text style={styles.submitText}>Add Cloth</Text>
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
    scrollView: {
        flex: 1,
    },
    content: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    imagePicker: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    imagePickerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePickerText: {
        fontSize: FontSize.md,
        marginTop: Spacing.sm,
    },
    inputContainer: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    input: {
        height: 48,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: FontSize.md,
    },
    textArea: {
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        fontSize: FontSize.md,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    colorRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorSelected: {
        borderWidth: 3,
        borderColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    bagRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    bagOption: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    bagOptionText: {
        fontSize: FontSize.sm,
        fontWeight: '500',
    },
    noBagsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    noBagsText: {
        fontSize: FontSize.md,
        fontWeight: '500',
    },
    categoryRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    categoryOption: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
    },
    categoryOptionText: {
        fontSize: FontSize.sm,
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
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
