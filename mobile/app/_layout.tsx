import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

function RootLayoutNav() {
    const { user, loading } = useAuth();
    const { colors, isDark } = useTheme();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Redirect to home if authenticated
            router.replace('/(tabs)');
        }
    }, [user, loading, segments]);

    useEffect(() => {
        // Modern Android Edge-to-Edge implementation
        // We do not use `setBackgroundColorAsync` or `setPositionAsync` here because 
        // `edgeToEdgeEnabled: true` natively manages transparency and position, and overrides will warn.
        if (Platform.OS === 'android') {
            NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark').catch(() => {
                // Silently fails if native module isn't built yet during dev
            });
        }
    }, [isDark]);

    if (loading) {
        return (
            <View style={[styles.loading, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="add-cloth"
                    options={{
                        title: 'Add Cloth',
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="add-bag"
                    options={{
                        title: 'Add Bag',
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="bag/[bagId]"
                    options={{
                        title: 'Bag Contents',
                    }}
                />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <RootLayoutNav />
            </AuthProvider>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
