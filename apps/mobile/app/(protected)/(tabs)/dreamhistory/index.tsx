// Index.tsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { View, TextInput, SafeAreaView, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useStableToken } from '@/app/hooks/useStableToken';
import GeneralLinearBackground from '@/app/components/GeneralLinearBackground';
import useDreamListStore from '@/app/store/dreamListStore';
import DreamCard from '@/app/components/DreamCard';
import { router } from 'expo-router';

const DreamHistoryIndex = () => {
    console.log('🔄 Dream history component rendering/mounting');
    const { getToken } = useStableToken();
    const { 
        dreamList, 
        fetchDreams, 
        refreshDreams, 
        isLoading, 
        isRefreshing, 
        error 
    } = useDreamListStore();
    const [searchText, setSearchText] = useState('');
    const [isRendering, setIsRendering] = useState(false);
    const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasInitiallyLoaded = useRef(false);

    // Memoized fetch function - only fetch if we don't have cached data
    const fetchData = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            
            // The store already handles caching, so let it decide whether to fetch
            console.log('Checking dream history cache...');
            
            // Set rendering state only when starting a fresh load
            if (dreamList.length === 0) {
                setIsRendering(true);
            }
            
            await fetchDreams(token);
        } catch (error) {
            console.error('Error fetching dream history:', error);
            setIsRendering(false);
        }
    }, [getToken, fetchDreams]);

    // Fetch dreams when the component mounts
    useEffect(() => {
        console.log('🚀 Dream history useEffect triggered, dreamList length:', dreamList.length);
        fetchData();
    }, [fetchData]);

    // Memoized filtered dreams to avoid expensive filtering on every render
    const filteredDreams = useMemo(() => {
        if (!searchText.trim()) {
            return dreamList;
        }
        
        console.log('🔍 Filtering dreams with search:', searchText);
        return dreamList.filter(dream => 
            dream.title.toLowerCase().includes(searchText.toLowerCase()) ||
            dream.summary.toLowerCase().includes(searchText.toLowerCase()) ||
            dream.emotions.some(emotion => emotion.toLowerCase().includes(searchText.toLowerCase())) ||
            dream.keywords.some(keyword => keyword.toLowerCase().includes(searchText.toLowerCase()))
        );
    }, [searchText, dreamList]);

    // Handle rendering state completion when data is loaded
    useEffect(() => {
        // Only manage rendering state if we're currently rendering
        if (isRendering && dreamList.length > 0 && !isLoading) {
            // Clear any existing timeout
            if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current);
            }
            
            // Set a short timeout to allow FlatList to render
            renderTimeoutRef.current = setTimeout(() => {
                setIsRendering(false);
                console.log('Dream list rendering completed');
            }, 100);
        }
    }, [dreamList.length, isLoading, isRendering]);

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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current);
            }
        };
    }, []);

    // Handle FlatList layout to confirm rendering - only when actually rendering
    const handleFlatListLayout = useCallback(() => {
        if (isRendering && filteredDreams.length > 0) {
            // Clear timeout since we know the list has rendered
            if (renderTimeoutRef.current) {
                clearTimeout(renderTimeoutRef.current);
            }
            setIsRendering(false);
            console.log('Dream list layout completed via onLayout');
        }
    }, [isRendering, filteredDreams.length]);

    // Memoized dream card render function to avoid recreation
    const renderDreamCard = useCallback(({ item }: { item: any }) => (
        <DreamCard
            dream={item}
            onPress={() => {
                console.log('🔗 Navigating to dream:', item.id);
                router.push(`/dream/${item.id}`);
            }}
        />
    ), []);

    // Memoized key extractor to avoid recreation
    const keyExtractor = useCallback((item: any, index: number) => `${item.id}-${index}`, []);

    // Combined loading state - show spinner while loading API data or rendering list
    const isActuallyLoading = (isLoading && dreamList.length === 0) || isRendering;

    // Loading state
    if (isActuallyLoading) {
        return (
            <GeneralLinearBackground>
                <SafeAreaView style={{ padding: 10, flex: 1 }}>
                    {/* Search Bar - shown during loading for consistent layout */}
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
                    {/* Search Bar - shown during error for consistent layout */}
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

    // Empty state - only show if not loading and not rendering
    if (filteredDreams.length === 0 && !isActuallyLoading) {
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
                <FlashList
                    data={filteredDreams}
                    renderItem={renderDreamCard}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    estimatedItemSize={120}
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
                    {...(isRendering ? { onLayout: handleFlatListLayout } : {})}
                />
            </SafeAreaView>
        </GeneralLinearBackground>
    );
};

// Memoize the component to prevent unnecessary re-renders
const Index = React.memo(DreamHistoryIndex);

export default Index;