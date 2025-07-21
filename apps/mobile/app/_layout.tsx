import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { Lora_400Regular, Lora_700Bold } from '@expo-google-fonts/lora';
import { Abel_400Regular } from '@expo-google-fonts/abel';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { TamaguiProvider } from 'tamagui';
import { Slot } from 'expo-router';
import { createTamagui } from '@tamagui/core';
import { defaultConfig } from '@tamagui/config/v4';
import '../global.css';
import { StrictMode } from 'react';
import { useFonts } from 'expo-font';
import Loading from './loading';
const config = createTamagui(defaultConfig);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
    throw new Error('Missing Clerk Publishable Key');
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_700Bold,
        Lora_400Regular,
        Lora_700Bold,
        Abel_400Regular,
        Nunito_400Regular,
        Nunito_700Bold,
        SpaceMono_400Regular,
        SpaceMono_700Bold,
    });


    if (!fontsLoaded && !fontError) {
        return <Loading />;
    }

    return (
        <StrictMode>
            <ClerkProvider publishableKey={publishableKey}>
                <ClerkLoaded>
                    <TamaguiProvider config={config}>{fontsLoaded ? <Slot /> : <Loading />}</TamaguiProvider>
                </ClerkLoaded>
            </ClerkProvider>
        </StrictMode>
    );
}
