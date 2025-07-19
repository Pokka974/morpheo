import { Pressable, ScrollView, Text, View } from 'react-native';
import React from 'react';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import GeneralLinearBackground from '@/app/components/GeneralLinearBackground';
import { Image } from 'expo-image';

const index = () => {
    const { signOut } = useClerk();
    const { user } = useUser();

    console.log('User:', JSON.stringify(user, null, 2));

    const handleSignOut = async () => {
        try {
            await signOut();
            router.replace('/');
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    return (
        <GeneralLinearBackground>
            <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingTop: 50 }}>
                <View className="flex-1 flex-col items-center p-4 m-4 gap-4">
                    <View className="rounded-full overflow-hidden">
                        <Image
                            style={{ width: 200, height: 200 }}
                            source={{ uri: user?.imageUrl }}
                            contentFit="cover"
                        />
                    </View>
                    <Text className="font-nunito text-2xl font-bold">{user?.username}</Text>
                    <Pressable className="border-1 border- rounded-2xl p-4" onPress={handleSignOut}>
                        <Text>Sign Out</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </GeneralLinearBackground>
    );
};

export default index;
