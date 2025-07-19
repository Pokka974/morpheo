// Index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, View, TextInput, SafeAreaView } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import GeneralLinearBackground from '@/app/components/GeneralLinearBackground';
import useDreamListStore from '@/app/store/dreamListStore';
import DreamCard from '@/app/components/DreamCard';
import Fuse, { IFuseOptions } from 'fuse.js';
import { router } from 'expo-router';

const Index = () => {
    const { getToken } = useAuth();
    const { dreamList, fetchDreams } = useDreamListStore();
    const [searchText, setSearchText] = useState('');
    const [filteredDreams, setFilteredDreams] = useState(dreamList);

    // Fetch dreams when the component mounts.
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

    // When the dreamList is fetched or changed, add a synthetic
    // field for culturalReferences to ease searching.
    const enhancedDreamList = useMemo(() => {
        return dreamList.map(dream => ({
            ...dream,
            culturalReferencesString: Object.values(dream.culturalReferences).join(' '),
        }));
    }, [dreamList]);

    // Fuse configuration: define the keys to index (only allowed fields)
    const fuseOptions: IFuseOptions<(typeof enhancedDreamList)[0]> = {
        keys: [
            'title',
            'description',
            'advice',
            'summary',
            'emoji',
            'emotions',
            'keywords',
            'culturalReferencesString',
        ],
        threshold: 0.3, // adjust the sensitivity as needed
    };

    // Only construct Fuse when the enhancedDreamList changes.
    const fuse = useMemo(() => {
        return new Fuse(enhancedDreamList, fuseOptions);
    }, [enhancedDreamList]);

    // Whenever searchText changes, update the filteredDreams list.
    useEffect(() => {
        if (!searchText.trim()) {
            setFilteredDreams(enhancedDreamList);
        } else {
            const results = fuse.search(searchText).map(result => result.item);
            setFilteredDreams(results);
        }
    }, [searchText, enhancedDreamList, fuse]);

    return (
        <GeneralLinearBackground>
            <SafeAreaView style={{ padding: 10, flex: 1 }}>
                {/* Search Bar */}
                <TextInput
                    placeholder="Search dreams (e.g., 'happy flight')..."
                    value={searchText}
                    onChangeText={setSearchText}
                    className="rounded-xl bg-white h-12 border border-gray-300 px-4 m-2 font-nunito shadow-sm"
                    placeholderTextColor="#9ca3af"
                />

                {/* FlatList for dream cards */}
                <FlatList
                    data={filteredDreams}
                    renderItem={({ item }) => (
                        <DreamCard
                            dream={item}
                            onPress={() => {
                                router.push(`/dream/${item.id}`);
                            }}
                        />
                    )}
                    keyExtractor={(item, index) => `${item.id.toString()}-${index}`}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </SafeAreaView>
        </GeneralLinearBackground>
    );
};

export default Index;
