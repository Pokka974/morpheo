import { View, Text, Platform, Pressable } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface OAuthButtonsProps {
    handleAppleOAuth: () => void;
    handleGoogleOAuth: () => void;
    openLink: () => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ handleAppleOAuth, handleGoogleOAuth, openLink }) => (
    <View className="gap-5">
        {Platform.OS === 'ios' && (
            <Pressable
                className="flex-row items-center justify-center p-3 gap-2.5 rounded-md border border-lightBorder"
                onPress={handleAppleOAuth}
            >
                <Ionicons name="logo-apple" size={24} color="black" />
                <Text className="font-nunito text-xl">Continue with Apple</Text>
            </Pressable>
        )}

        <Pressable
            className="flex-row items-center justify-center p-3 gap-2.5 rounded-md border border-lightBorder"
            onPress={handleGoogleOAuth}
        >
            <Ionicons name="logo-google" size={24} color="black" />
            <Text className="font-nunito text-xl">Continue with Google</Text>
        </Pressable>

        <Text className="font-serif text-xs text-center text-white">
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
