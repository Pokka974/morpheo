import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import useUserStore from '../store/userStore';
import { getUserProfile, upsertUserProfile } from '../../api/userApi';

type UserProfile = {
    gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
    ageRange?: 'TEEN_13_17' | 'YOUNG_ADULT_18_25' | 'ADULT_26_35' | 'MIDDLE_AGED_36_50' | 'MATURE_51_65' | 'SENIOR_65_PLUS';
    culturalBackground?: string[];
    primaryLanguage?: string;
    location?: string;
    interpretationStyle?: 'SCIENTIFIC' | 'SPIRITUAL' | 'PSYCHOLOGICAL' | 'BALANCED' | 'CULTURAL_FOCUSED';
};

interface UserProfileComponentProps {
    onSaved?: () => void;
}

const UserProfileComponent: React.FC<UserProfileComponentProps> = ({ onSaved }) => {
    const { getToken } = useAuth();
    const { profile, updateProfile } = useUserStore();
    const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
    const [culturalInput, setCulturalInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Load profile from API on mount
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const token = await getToken();
            if (token) {
                const apiProfile = await getUserProfile(token);
                if (apiProfile) {
                    setLocalProfile(apiProfile);
                    updateProfile(apiProfile);
                }
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const genderOptions = [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'NON_BINARY', label: 'Non-binary' },
        { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
    ];

    const ageRangeOptions = [
        { value: 'TEEN_13_17', label: '13-17 years' },
        { value: 'YOUNG_ADULT_18_25', label: '18-25 years' },
        { value: 'ADULT_26_35', label: '26-35 years' },
        { value: 'MIDDLE_AGED_36_50', label: '36-50 years' },
        { value: 'MATURE_51_65', label: '51-65 years' },
        { value: 'SENIOR_65_PLUS', label: '65+ years' },
    ];

    const interpretationStyles = [
        { value: 'SCIENTIFIC', label: 'Scientific' },
        { value: 'SPIRITUAL', label: 'Spiritual' },
        { value: 'PSYCHOLOGICAL', label: 'Psychological' },
        { value: 'BALANCED', label: 'Balanced' },
        { value: 'CULTURAL_FOCUSED', label: 'Cultural Focused' },
    ];

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (token) {
                const updatedProfile = await upsertUserProfile(token, localProfile);
                if (updatedProfile) {
                    updateProfile(updatedProfile);
                    Alert.alert('Success', 'Profile updated successfully!');
                    onSaved?.(); // Call the callback to close modal
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile. Please try again.');
            console.error('Failed to save profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const addCulturalBackground = () => {
        if (culturalInput.trim()) {
            const newCultural = [...(localProfile.culturalBackground || []), culturalInput.trim()];
            setLocalProfile({ ...localProfile, culturalBackground: newCultural });
            setCulturalInput('');
        }
    };

    const removeCulturalBackground = (index: number) => {
        const newCultural = localProfile.culturalBackground?.filter((_, i) => i !== index) || [];
        setLocalProfile({ ...localProfile, culturalBackground: newCultural });
    };

    const renderSelector = (
        title: string,
        options: { value: string; label: string }[],
        selectedValue: string | undefined,
        onSelect: (value: string) => void
    ) => (
        <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 text-gray-800">{title}</Text>
            <View className="flex-row flex-wrap gap-2">
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => onSelect(option.value)}
                        className={`px-4 py-2 rounded-full border ${
                            selectedValue === option.value
                                ? 'bg-purple-500 border-purple-500'
                                : 'bg-white border-gray-300'
                        }`}
                    >
                        <Text
                            className={`${
                                selectedValue === option.value ? 'text-white' : 'text-gray-700'
                            }`}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <ScrollView className="flex-1 bg-gray-50 p-4">
            <Text className="text-2xl font-bold mb-6 text-center text-gray-800">
                Dream Personalization
            </Text>
            <Text className="text-gray-600 mb-6 text-center">
                Help us create more personalized dream interpretations and images
            </Text>

            {renderSelector(
                'Gender',
                genderOptions,
                localProfile.gender,
                (value) => setLocalProfile({ ...localProfile, gender: value as any })
            )}

            {renderSelector(
                'Age Range',
                ageRangeOptions,
                localProfile.ageRange,
                (value) => setLocalProfile({ ...localProfile, ageRange: value as any })
            )}

            <View className="mb-6">
                <Text className="text-lg font-semibold mb-3 text-gray-800">Cultural Background</Text>
                <View className="flex-row mb-2">
                    <TextInput
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-white"
                        placeholder="Add cultural background"
                        value={culturalInput}
                        onChangeText={setCulturalInput}
                        onSubmitEditing={addCulturalBackground}
                    />
                    <TouchableOpacity
                        onPress={addCulturalBackground}
                        className="px-4 py-2 bg-purple-500 rounded-r-lg"
                    >
                        <Text className="text-white font-semibold">Add</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap gap-2">
                    {localProfile.culturalBackground?.map((culture, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => removeCulturalBackground(index)}
                            className="px-3 py-1 bg-blue-100 border border-blue-300 rounded-full flex-row items-center"
                        >
                            <Text className="text-blue-700 mr-1">{culture}</Text>
                            <Text className="text-blue-700 font-bold">×</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="mb-6">
                <Text className="text-lg font-semibold mb-3 text-gray-800">Location</Text>
                <TextInput
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    placeholder="City, Country"
                    value={localProfile.location || ''}
                    onChangeText={(text) => setLocalProfile({ ...localProfile, location: text })}
                />
            </View>

            {renderSelector(
                'Interpretation Style',
                interpretationStyles,
                localProfile.interpretationStyle,
                (value) => setLocalProfile({ ...localProfile, interpretationStyle: value as any })
            )}

            <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className={`py-4 rounded-lg mt-4 mb-8 ${loading ? 'bg-gray-400' : 'bg-purple-600'}`}
            >
                <Text className="text-white text-center font-semibold text-lg">
                    {loading ? 'Saving...' : 'Save Profile'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default UserProfileComponent;