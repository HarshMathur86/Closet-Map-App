import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { clothApi, Cloth, Bag } from '../../services/api';
import { ClothCard } from '../../components/ClothCard';
import { ClothModal } from '../../components/ClothModal';
import { Spacing, FontSize, BorderRadius } from '../../constants/Colors';

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [scanResult, setScanResult] = useState<{ bag: Bag; clothes: Cloth[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedCloth, setSelectedCloth] = useState<Cloth | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { colors } = useTheme();
    const router = useRouter();

    const handleBarcodeScanned = async ({ data }: { data: string }) => {
        if (scanned) return;

        setScanned(true);
        setLoading(true);

        try {
            const result = await clothApi.getByBarcode(data);
            setScanResult(result);
        } catch (error: any) {
            if (error.response?.status === 404) {
                Alert.alert('Not Found', 'No bag found with this barcode', [
                    { text: 'Scan Again', onPress: () => setScanned(false) }
                ]);
            } else {
                Alert.alert('Error', 'Failed to scan barcode', [
                    { text: 'Try Again', onPress: () => setScanned(false) }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetScan = () => {
        setScanned(false);
        setScanResult(null);
    };

    const handleClothPress = (cloth: Cloth) => {
        setSelectedCloth(cloth);
        setModalVisible(true);
    };

    const handleFavoriteToggle = async (clothId: string) => {
        try {
            await clothApi.toggleFavorite(clothId);
            if (scanResult) {
                setScanResult({
                    ...scanResult,
                    clothes: scanResult.clothes.map(c =>
                        c.clothId === clothId ? { ...c, favorite: !c.favorite } : c
                    ),
                });
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    if (!permission) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
                <Ionicons name="camera-outline" size={80} color={colors.textMuted} />
                <Text style={[styles.permissionTitle, { color: colors.text }]}>
                    Camera Permission Required
                </Text>
                <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
                    We need camera access to scan bag barcodes
                </Text>
                <TouchableOpacity
                    style={[styles.permissionButton, { backgroundColor: colors.primary }]}
                    onPress={requestPermission}
                >
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Show scan results
    if (scanResult) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.resultHeader, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity onPress={resetScan} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={[styles.bagId, { color: colors.primary }]}>
                            {scanResult.bag.bagId}
                        </Text>
                        <Text style={[styles.bagName, { color: colors.text }]}>
                            {scanResult.bag.name}
                        </Text>
                    </View>
                    <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.countText}>{scanResult.clothes.length}</Text>
                    </View>
                </View>

                {/* Clothes List */}
                {scanResult.clothes.length === 0 ? (
                    <View style={[styles.centered, { flex: 1 }]}>
                        <Ionicons name="shirt-outline" size={60} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            This bag is empty
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={scanResult.clothes}
                        renderItem={({ item }) => (
                            <ClothCard
                                cloth={item}
                                onPress={() => handleClothPress(item)}
                                onFavoriteToggle={() => handleFavoriteToggle(item.clothId)}
                            />
                        )}
                        keyExtractor={(item) => item.clothId}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
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
                    onMoveToBag={() => {
                        // Update scan results by removing the moved cloth
                        if (selectedCloth && scanResult) {
                            setScanResult({
                                ...scanResult,
                                clothes: scanResult.clothes.filter(c => c.clothId !== selectedCloth.clothId),
                            });
                        }
                        setModalVisible(false);
                        setSelectedCloth(null);
                    }}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['code128', 'code39', 'qr', 'ean13', 'ean8'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />
            {/* Overlay - positioned absolutely over camera */}
            <View style={styles.overlayContainer}>
                <View style={styles.overlay}>
                    <View style={styles.scanArea}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>

                    <Text style={styles.scanText}>
                        {loading ? 'Loading...' : 'Point camera at bag barcode'}
                    </Text>
                </View>

                {/* Loading indicator */}
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="white" />
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    camera: {
        flex: 1,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 280,
        height: 200,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: 'white',
        borderWidth: 3,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    scanText: {
        color: 'white',
        fontSize: FontSize.md,
        marginTop: Spacing.xl,
        textAlign: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    permissionTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    permissionText: {
        fontSize: FontSize.md,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    permissionButton: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    permissionButtonText: {
        color: 'white',
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerInfo: {
        flex: 1,
    },
    bagId: {
        fontSize: FontSize.xs,
        fontWeight: '700',
    },
    bagName: {
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
    countBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        color: 'white',
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    listContent: {
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    emptyText: {
        fontSize: FontSize.md,
        marginTop: Spacing.md,
    },
});
