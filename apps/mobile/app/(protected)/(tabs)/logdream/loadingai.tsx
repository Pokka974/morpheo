import Colors from '@/constants/Colors';
import useDreamStore from '@/app/store/dreamResultStore';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';

export default function LoadingScreen() {
    const { dreamData, error } = useDreamStore();

    useEffect(() => {
        if (dreamData) {
            router.replace('/result');
        }
        if (error) {
            Alert.alert('Error', error);
            router.back();
        }
    }, [dreamData, error]);

    return (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text className="text-accent mt-4 text-lg">Analyzing your dream...</Text>
        </View>
    );
}
