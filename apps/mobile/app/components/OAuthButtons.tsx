import { View, Text, Platform } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Button, XStack } from 'tamagui';

interface OAuthButtonsProps {
    handleAppleOAuth: () => void;
    handleGoogleOAuth: () => void;
    openLink: () => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ handleAppleOAuth, handleGoogleOAuth, openLink }) => (
    <View className="gap-5">
        {Platform.OS === 'ios' && (
            <Button
                className="bg-white rounded-xl p-4 shadow-sm border-0"
                onPress={handleAppleOAuth}
            >
                <XStack alignItems="center" gap="$2">
                    <Ionicons name="logo-apple" size={24} color="black" />
                    <Text className="font-nunito text-xl text-gray-800 font-semibold">Continue with Apple</Text>
                </XStack>
            </Button>
        )}

        <Button
            className="bg-white rounded-xl p-4 shadow-sm border-0"
            onPress={handleGoogleOAuth}
        >
            <XStack alignItems="center" gap="$2">
                <Ionicons name="logo-google" size={24} color="black" />
                <Text className="font-nunito text-xl text-gray-800 font-semibold">Continue with Google</Text>
            </XStack>
        </Button>

        <Text className="font-nunito text-xs text-center text-white">
            By continuing you agree to MorpheoAI's
            <Text className="text-lavender underline" onPress={openLink}>
                {' '}
                Terms of Service{' '}
            </Text>
            and
            <Text className="text-lavender underline" onPress={openLink}>
                {' '}
                Privacy Policy
            </Text>
        </Text>
    </View>
);

export default OAuthButtons;
