// Index.tsx
import React, { useEffect, useState } from 'react';
import { FlatList, View, TextInput, SafeAreaView, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import GeneralLinearBackground from '@/app/components/GeneralLinearBackground';
import useDreamListStore from '@/app/store/dreamListStore';
import DreamCard from '@/app/components/DreamCard';
import { router } from 'expo-router';

const Index = () => {
    const { getToken } = useAuth();
    const { 
        dreamList, 
        fetchDreams, 
        refreshDreams, 
        isLoading, 
        isRefreshing, 
        error 
    } = useDreamListStore();
    const [searchText, setSearchText] = useState('');
    const [filteredDreams, setFilteredDreams] = useState(dreamList);

    // Fetch dreams when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                if (token) {
                    await fetchDreams(token);
                }
            } catch (error) {
                console.error('Error fetching dream history:', error);
            }
        };

        fetchData();
    }, [fetchDreams]);

    // Filter dreams based on search text
    useEffect(() => {
        if (!searchText.trim()) {
            setFilteredDreams(dreamList);
        } else {
            const filtered = dreamList.filter(dream => 
                dream.title.toLowerCase().includes(searchText.toLowerCase()) ||
                dream.summary.toLowerCase().includes(searchText.toLowerCase()) ||
                dream.emotions.some(emotion => emotion.toLowerCase().includes(searchText.toLowerCase())) ||
                dream.keywords.some(keyword => keyword.toLowerCase().includes(searchText.toLowerCase()))
            );
            setFilteredDreams(filtered);
        }
    }, [searchText, dreamList]);

    // Handle pull-to-refresh
    const handleRefresh = async () => {
        try {
            const token = await getToken();
            if (token) {
                await refreshDreams(token);
            }
        } catch (error) {
            console.error('Error refreshing dreams:', error);
        }
    };

    // Render dream card
    const renderDreamCard = ({ item }: { item: any }) => (
        <DreamCard
            dream={item}
            onPress={() => {
                router.push(`/dream/${item.id}`);
            }}
        />
    );

    // Loading state
    if (isLoading && dreamList.length === 0) {
        return (
            <GeneralLinearBackground>
                <SafeAreaView style={{ padding: 10, flex: 1 }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text style={{ fontFamily: 'Nunito', color: '#6b7280', marginTop: 16 }}>Loading your dreams...</Text>
                    </View>
                </SafeAreaView>
            </GeneralLinearBackground>
        );
    }

    // Error state
    if (error && dreamList.length === 0) {
        return (
            <GeneralLinearBackground>
                <SafeAreaView style={{ padding: 10, flex: 1 }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
                        <Text style={{ fontFamily: 'Nunito', color: '#dc2626', textAlign: 'center', fontSize: 18, marginBottom: 16 }}>
                            {error}
                        </Text>
                        <Text style={{ fontFamily: 'Nunito', color: '#6b7280', textAlign: 'center' }}>
                            Pull down to try again
                        </Text>
                    </View>
                </SafeAreaView>
            </GeneralLinearBackground>
        );
    }

    // Empty state
    if (filteredDreams.length === 0 && !isLoading) {
        return (
            <GeneralLinearBackground>
                <SafeAreaView style={{ padding: 10, flex: 1 }}>
                    <TextInput
                        placeholder="Search dreams (e.g., 'happy flight')..."
                        value={searchText}
                        onChangeText={setSearchText}
                        style={{
                            height: 48,
                            backgroundColor: '#ffffff',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#d1d5db',
                            paddingHorizontal: 16,
                            margin: 8,
                            fontFamily: 'Nunito',
                            fontSize: 16,
                        }}
                        placeholderTextColor="#9ca3af"
                    />
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
                        <Text style={{ fontFamily: 'Nunito', color: '#6b7280', textAlign: 'center', fontSize: 18, marginBottom: 16 }}>
                            No dreams found
                        </Text>
                        <Text style={{ fontFamily: 'Nunito', color: '#9ca3af', textAlign: 'center' }}>
                            {searchText.trim() ? 'Try a different search term' : 'Start by logging your first dream'}
                        </Text>
                    </View>
                </SafeAreaView>
            </GeneralLinearBackground>
        );
    }

    return (
        <GeneralLinearBackground>
            <SafeAreaView style={{ padding: 10, flex: 1 }}>
                {/* Search Bar */}
                <TextInput
                    placeholder="Search dreams (e.g., 'happy flight')..."
                    value={searchText}
                    onChangeText={setSearchText}
                    style={{
                        height: 48,
                        backgroundColor: '#ffffff',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#d1d5db',
                        paddingHorizontal: 16,
                        margin: 8,
                        fontFamily: 'Nunito',
                        fontSize: 16,
                    }}
                    placeholderTextColor="#9ca3af"
                />

                {/* Dream List */}
                <FlatList
                    data={filteredDreams}
                    renderItem={renderDreamCard}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#6366f1']} // Android
                            tintColor="#6366f1" // iOS
                            title="Pull to refresh dreams"
                            titleColor="#6b7280"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </GeneralLinearBackground>
    );
};

export default Index;