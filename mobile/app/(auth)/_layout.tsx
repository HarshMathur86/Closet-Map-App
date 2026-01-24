import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function AuthLayout() {
    const { colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerShadowVisible: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen
                name="login"
                options={{
                    title: '',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="signup"
                options={{
                    title: 'Create Account',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack>
    );
}
