import {
    View,
    Animated,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import useTabBarStore from '@/app/store/tabBarStore';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import dreamApi from '@/api/dreamApi';
import { useAuth } from '@clerk/clerk-expo';
import useDreamResultStore, { DreamData } from '@/app/store/dreamResultStore';
import GeneralLinearBackground from '@/app/components/GeneralLinearBackground';

// Set your desired keyboard spacing
const KEYBOARD_SPACING = 20;

const index = () => {
    const { getToken } = useAuth();
    const [dreamText, setDreamText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputHeight = useRef(new Animated.Value(94)).current;
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const { setVisible } = useTabBarStore();

    useEffect(() => {
        // If residual dream data exists from a previous interpretation,
        // clear it so that the UI remains the correct "log a dream" screen.
        if (useDreamResultStore.getState().dreamData) {
            useDreamResultStore.getState().reset();
        }
    }, []);
    const handleFocus = () => {
        Animated.timing(inputHeight, {
            toValue: 200,
            duration: 200,
            useNativeDriver: false,
        }).start();
        setIsFocused(true);
        setVisible(false);
        // Hide tab bar logic here
    };

    const handleBlur = () => {
        if (!dreamText) {
            Animated.timing(inputHeight, {
                toValue: 94,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
        setIsFocused(false);
        setVisible(true);
        // Show tab bar logic here
    };

    // In your LogDreamScreen component
    const handleSend = async () => {
        try {
            useDreamResultStore.getState().startLoading(dreamText);
            router.replace('/logdream/loadingai');

            const token = await getToken();
            const response = await dreamApi.postChatGPT(dreamText, token!);
            // const imagePath = null;

            const dreamData: DreamData = {
                id: response.id,
                title: response.title,
                description: response.description,
                advice: response.advice,
                culturalReferences: response.culturalReferences,
                summary: response.summary,
                emotions: response.emotions,
                dalleImagePath: undefined,
                keywords: response.keywords,
                emoji: response.emoji,
                'dall-e-prompt': response.dallEPrompt,
                'midjourney-prompt': response.midjourneyPrompt,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt,
                userId: response.userId,
            };

            useDreamResultStore.getState().setDreamData(dreamData);
            router.replace('/result');
        } catch (error) {
            if (error instanceof Error) {
                useDreamResultStore.getState().setError(error.message);
            } else {
                useDreamResultStore.getState().setError('An unknown error occurred');
            }
            router.replace('/logdream');
        }
    };

    return (
        <GeneralLinearBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView contentContainerStyle={{ flex: 1 }} keyboardShouldPersistTaps="handled">
                    <View className="flex-1 p-6 justify-center">
                        <Animated.View
                            className="bg-white rounded-2xl overflow-hidden"
                            style={{
                                height: inputHeight,
                                maxHeight: '80%',
                                marginBottom: keyboardHeight > 0 ? keyboardHeight - 40 : 0,
                            }}
                        >
                            <View className="flex-1 flex-row">
                                {/* Text Input Area */}
                                <TextInput
                                    className="flex-1 p-4 text-base"
                                    placeholder="Write down your dream in as much detail as you remember..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    value={dreamText}
                                    onChangeText={setDreamText}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    style={{ textAlignVertical: 'top' }}
                                />
                                {isFocused && (
                                    <>
                                        {/* Vertical Divider */}
                                        <View className="self-center w-px h-4/5 bg-gray-600 mx-2" />

                                        {/* Action Buttons Container */}
                                        <View className="pr-2 py-2 justify-between items-end">
                                            <Pressable className="p-2" onPress={() => setDreamText('')}>
                                                <Ionicons name="close-circle" size={24} />
                                            </Pressable>

                                            <View className="gap-2">
                                                {/* TODO: Implement voice recording functionality */}
                                                <Pressable disabled className="p-2">
                                                    <Ionicons disabled name="mic-off" size={24} />
                                                </Pressable>
                                                <Pressable className="p-2" onPress={handleSend}>
                                                    <Ionicons name="send" size={24} color={Colors.primary} />
                                                </Pressable>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>
                        </Animated.View>
                    </View>
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

export default index;
