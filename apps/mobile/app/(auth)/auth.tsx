import { useSignIn, useSignUp, useSSO } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Pressable,
    Text,
    View,
    Image,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import GeneralLinearBackground from '@/app/components/GeneralLinearBackground';
import OAuthButtons from '../components/OAuthButtons';
import AuthForm, { AuthFormData } from '../components/AuthForm';
import ErrorDialog from '../components/ErrorDialog';
import { AlertDialog, Button, XStack, YStack } from 'tamagui';
import useAuthStore from '../store/authStore';

export const useWarmUpBrowser = () => {
    useEffect(() => {
        void WebBrowser.warmUpAsync();
        return () => void WebBrowser.coolDownAsync();
    }, []);
};

const KEYBOARD_SPACING = 20;

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
    useWarmUpBrowser();
    const { top } = useSafeAreaInsets();
    const { startSSOFlow: googleSSO } = useSSO();
    const { startSSOFlow: appleSSO } = useSSO();
    const { mode, toggleMode } = useAuthStore();
    const [code, setCode] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { signIn } = useSignIn();
    const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
    const handleFormSubmit = async (data: AuthFormData) => {
        if (mode === 'login') {
            try {
                const signInAttempt = await signIn?.create({
                    identifier: data.email,
                    password: data.password,
                });
                if (signInAttempt?.status === 'complete') {
                    await setActive!({ session: signInAttempt.createdSessionId });
                    router.replace('/logdream');
                }
            } catch (error: any) {
                setErrorMessage(error.errors?.[0]?.message || 'Login failed');
            }
        } else {
            if (!isSignUpLoaded) return;

            try {
                await signUp.create({
                    emailAddress: data.email,
                    password: data.password,
                    username: data.username ?? undefined,
                });

                await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
                setPendingVerification(true); // Show verification modal
            } catch (error: any) {
                setErrorMessage(error.errors?.[0]?.message || 'Registration failed');
            }
        }
    };

    const onVerifyPress = async () => {
        if (!isSignUpLoaded) return;

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({ code });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                router.replace('/logdream');
            }
        } catch (error: any) {
            setErrorMessage(error.errors?.[0]?.message || 'Verification failed');
        }
    };

    const handleAppleOAuth = async () => {
        try {
            const { createdSessionId, setActive } = await appleSSO({ 
                strategy: 'oauth_apple'
            });
            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                router.replace('/logdream');
            }
        } catch (error) {
            console.error('Apple OAuth error:', error);
            setErrorMessage('Apple authentication failed. Please try again.');
        }
    };

    const handleGoogleOAuth = async () => {
        try {
            const { createdSessionId, setActive } = await googleSSO({ 
                strategy: 'oauth_google'
            });
            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                router.replace('/logdream');
            }
        } catch (err) {
            console.error('Google OAuth error:', err);
            setErrorMessage('Google authentication failed. Please try again.');
        }
    };

    const openLink = async () => WebBrowser.openBrowserAsync('https://google.com');

    return (
        <GeneralLinearBackground>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <ScrollView keyboardShouldPersistTaps="handled" className={`gap-10 mt-10 pt-[${top}px]`}>
                    <Image
                        source={require('@/assets/images/login-logo.png')}
                        className="h-80 w-80 self-center object-contain"
                    />
                    <Text className="font-nunito text-3xl font-bold text-center text-white mb-2">
                        Welcome to Morpheo
                    </Text>

                    <AuthForm onSubmit={handleFormSubmit} mode={mode} />

                    <View className="gap-5 mx-10">
                        <Text className="text-2xl font-nunito text-center text-white mt-5">or</Text>

                        <Button 
                            className="bg-white rounded-xl p-4 shadow-sm border-0"
                            onPress={toggleMode}
                        >
                            <Text className="font-nunito text-xl text-gray-800 font-semibold">
                                {mode === 'login' ? 'Create an account' : 'Log in'}
                            </Text>
                        </Button>

                        <OAuthButtons
                            handleAppleOAuth={handleAppleOAuth}
                            handleGoogleOAuth={handleGoogleOAuth}
                            openLink={openLink}
                        />
                    </View>
                    <AlertDialog open={pendingVerification} onOpenChange={setPendingVerification}>
                        <AlertDialog.Portal>
                            <AlertDialog.Overlay key="overlay" />
                            <AlertDialog.Content key="content">
                                <AlertDialog.Title key="title">Verify Your Email</AlertDialog.Title>
                                <YStack gap="$3" key="ystack">
                                    <TextInput
                                        value={code}
                                        placeholder="Enter verification code"
                                        onChangeText={setCode}
                                        style={{ borderWidth: 1, padding: 10, borderRadius: 5 }}
                                        key="input"
                                    />
                                    <XStack gap="$2" key="xstack">
                                        <Button key="cancel-button" onPress={() => setPendingVerification(false)}>
                                            Cancel
                                        </Button>
                                        <Button key="verify-button" onPress={onVerifyPress}>
                                            Verify
                                        </Button>
                                    </XStack>
                                </YStack>
                            </AlertDialog.Content>
                        </AlertDialog.Portal>
                    </AlertDialog>
                    <ErrorDialog message={errorMessage} onClose={() => setErrorMessage('')} />
                </ScrollView>
            </KeyboardAvoidingView>
        </GeneralLinearBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputContainer: {
        paddingBottom: KEYBOARD_SPACING, // Consistent spacing above keyboard
    },
});

export default AuthScreen;
