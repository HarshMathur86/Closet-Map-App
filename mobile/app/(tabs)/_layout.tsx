import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
    const { colors } = useTheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 0,
                    height: 88,
                    elevation: 0,
                },
                tabBarItemStyle: {
                    paddingTop: 8,
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
    }
});
