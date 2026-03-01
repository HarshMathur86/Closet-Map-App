import { View, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomPadding = insets.bottom;
    const router = useRouter();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: colors.surface,
                    borderTopWidth: 0,
                    height: 60 + bottomPadding,
                    paddingBottom: bottomPadding,
                    elevation: 0,
                },
                tabBarItemStyle: {
                    paddingTop: 8,
                    paddingBottom: bottomPadding > 0 ? 0 : 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '700',
                    marginBottom: 8,
                },
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerShadowVisible: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Clothes',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : null}>
                            <Ionicons name="shirt" size={focused ? size + 2 : size - 1} color={color} />
                        </View>
                    ),
                    headerTitle: 'My Wardrobe',
                }}
            />
            <Tabs.Screen
                name="bags"
                options={{
                    title: 'Bags',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : null}>
                            <Ionicons name="bag" size={focused ? size + 2 : size - 1} color={color} />
                        </View>
                    ),
                    headerTitle: 'My Bags',
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: '',
                    tabBarIcon: ({ focused }) => (
                        <View style={[
                            styles.fabContainer,
                            {
                                backgroundColor: colors.primary,
                            }
                        ]}>
                            <Ionicons
                                name="add"
                                size={32}
                                color={colors.tabIconAdd}
                            />
                        </View>
                    ),
                }}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        router.push('/add-cloth');
                    },
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : null}>
                            <Ionicons name="scan" size={focused ? size + 2 : size - 1} color={color} />
                        </View>
                    ),
                    headerTitle: 'Scan Bag',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : null}>
                            <Ionicons name="person" size={focused ? size + 2 : size - 1} color={color} />
                        </View>
                    ),
                    headerTitle: 'Profile',
                }}
            />
        </Tabs>
    );
}
const styles = StyleSheet.create({
    activeIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIndicator: {
        position: 'absolute',
        top: -10,
        width: 16,
        height: 3,
        borderRadius: 1.5,
    },
    fabContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    }
});
