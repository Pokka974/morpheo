// index.tsx (Dream Detail Page)
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Link, usePathname } from 'expo-router';
import { useStableToken } from '@/app/hooks/useStableToken';
import GeneralLinearBackground from '@/app/components/GeneralLinearBackground';
import DreamImage from '@/app/components/DreamImage';
import { ScrollView } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import PastelChip from '@/app/components/PastelChip';
import useDreamDetailStore from '@/app/store/dreamDetailStore';
import getUniquePastelColors from '@/app/utils/pastelColors';
import { Accordion, SectionHeader } from '../result';
import BulbIcon from '@/app/components/svg-components/Bulb';
import RecurringDreamsIcon from '@/app/components/svg-components/RecurringDreams';

// Helper to escape regex special chars
const escapeRegExp = (text: string) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// Helper function that highlights matching keywords/emotions in the text.
const highlightText = (text: string, tagColorMapping: Record<string, string>) => {
    const tags = Object.keys(tagColorMapping);
    if (!tags.length) return text; // If no tags, return plain text.
    // Create regex to match any tag as a whole word; case-insensitive.
    const escapedTags = tags.map(t => escapeRegExp(t));
    // Using parentheses so that the matching parts are captured.
    const regex = new RegExp(`(${escapedTags.join('|')})`, 'gi');

    // Split text by matched parts. The array will include both matching and non-matching parts.
    const parts = text.split(regex);

    return parts.map((part, index) => {
        // Check if the part matches any tag (in a case-insensitive way)
        const matchingTag = tags.find(tag => tag.toLowerCase() === part.toLowerCase());
        if (matchingTag) {
            return (
                <Text
                    key={index}
                    style={{
                        backgroundColor: tagColorMapping[matchingTag],
                        fontWeight: 'bold',
                    }}
                >
                    {part}
                </Text>
            );
        }
        return <Text key={index}>{part}</Text>;
    });
};

const DreamDetail = () => {
    const { getToken } = useStableToken();
    const pathname = usePathname();
    const { dreamDetail, fetchDreamDetail } = useDreamDetailStore();
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

    // Extract dreamId from pathname
    const dreamId = useMemo(() => {
        const dreamIdSplited = pathname.split('/');
        return dreamIdSplited[dreamIdSplited.length - 1];
    }, [pathname]);

    // Memoized fetch function to prevent recreation
    const fetchData = useCallback(async () => {
        try {
            const token = await getToken();
            if (token && dreamId) {
                console.log(`Fetching dream detail for ID: ${dreamId}`);
                await fetchDreamDetail(dreamId, token);
            }
        } catch (error) {
            console.error('Error fetching dream detail:', error);
        }
    }, [getToken, dreamId, fetchDreamDetail]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Convert cultural references object to array
    const culturalRefs = Object.entries(dreamDetail?.culturalReferences || {}).map(([culture, meaning]) => ({
        culture,
        meaning,
    }));
    // Merge keywords and emotions into one unique list.
    const allTags: string[] = useMemo(() => {
        const keywords = dreamDetail?.keywords || [];
        const emotions = dreamDetail?.emotions || [];
        return Array.from(new Set([...keywords, ...emotions]));
    }, [dreamDetail]);

    // Generate and memoize a mapping of tag to pastel color using our unique color palette.
    const tagColorMapping = useMemo(() => {
        const mapping: Record<string, string> = {};
        const colors = getUniquePastelColors(allTags.length);
        allTags.forEach((tag, index) => {
            mapping[tag] = colors[index];
        });
        return mapping;
    }, [allTags]);

    return (
        <GeneralLinearBackground>
            {/* To draw behind the status bar, we configure the StatusBar */}
            <StatusBar translucent backgroundColor="transparent" />
            {/* Dream Image */}
            <DreamImage 
                uri={dreamDetail?.dalleImagePath} 
                base64Data={dreamDetail?.dalleImageData}
                style={{ width: '100%', height: '45%' }} 
            />
            {/* Go back button */}
            <Link className="rounded-full bg-peach/70 absolute top-20 left-6 p-2" href="/dreamhistory">
                <Ionicons name="arrow-back-outline" size={35} color="#fff" />
            </Link>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="flex-1 p-3">
                <View className="flex-1 p-4 gap-2">
                    {/* Title */}
                    <View className="flex-row justify-between items-center gap-2">
                        <Text className="font-nunito text-2xl font-bold text-gray-800 w-[80%]">{dreamDetail?.title}</Text>
                        <Text className="text-xl">{dreamDetail?.emoji}</Text>
                    </View>
                    {/* Keywords */}
                    <View className="flex-row items-center mt-2">
                        <Text className="font-nunito text-lg font-semibold text-gray-800 mr-2">Keywords:</Text>
                        {dreamDetail?.keywords.map((tag, index) => (
                            <PastelChip key={index} text={tag} size="sm" bgColor={tagColorMapping[tag]} />
                        ))}
                    </View>
                    {/* Dream summary */}
                    <View className="bg-white p-4 rounded-xl mt-2 shadow-sm">
                        <Text className="font-nunito text-lg text-gray-800 text-justify">
                            {dreamDetail?.summary ? highlightText(dreamDetail.summary, tagColorMapping) : ''}
                        </Text>
                    </View>
                    <View className="border-t-[1px] border-gray-700 my-6"></View>
                    {/* Emotions */}
                    <View className="flex-row items-center">
                        <Text className="font-nunito text-lg font-semibold text-gray-800 mr-2">Emotions:</Text>
                        <FlashList
                            horizontal
                            data={dreamDetail?.emotions}
                            renderItem={({ item, index }) => (
                                <PastelChip
                                    key={`${item}-${index}`}
                                    text={item}
                                    bgColor={tagColorMapping[item] || '#ccc'}
                                    size="md"
                                />
                            )}
                            keyExtractor={item => item}
                            estimatedItemSize={80}
                        />
                    </View>
                    {/* Cultural References */}
                    <View>
                        <SectionHeader title="Cultural References" icon="book" />
                        {culturalRefs.map(ref => (
                            <Accordion
                                key={ref.culture}
                                title={ref.culture}
                                content={ref.meaning}
                                isExpanded={expandedAccordion === ref.culture}
                                onToggle={() =>
                                    setExpandedAccordion(expandedAccordion === ref.culture ? null : ref.culture)
                                }
                            />
                        ))}
                    </View>
                    
                    {/* Recurring Patterns Section */}
                    {dreamDetail?.recurringDreamAnalysis?.hasConnections && (
                        <>
                            <SectionHeader title="Recurring Patterns" icon="recurring" />
                            
                            {/* Connected Dreams */}
                            {dreamDetail.recurringDreamAnalysis.connectedDreams.length > 0 && (
                                <View className="mb-4">
                                    <Text className="font-nunito font-semibold text-gray-700 mb-2">Connected Dreams:</Text>
                                    {dreamDetail.recurringDreamAnalysis.connectedDreams.map((connectedDream, index) => (
                                        <Accordion
                                            key={`${connectedDream.id}-${index}`}
                                            title={`${connectedDream.title} - ${connectedDream.date}`}
                                            content={connectedDream.connection}
                                            isExpanded={expandedAccordion === `connected-${connectedDream.id}`}
                                            onToggle={() =>
                                                setExpandedAccordion(
                                                    expandedAccordion === `connected-${connectedDream.id}` 
                                                        ? null 
                                                        : `connected-${connectedDream.id}`
                                                )
                                            }
                                        />
                                    ))}
                                </View>
                            )}
                            
                            {/* Recurring Patterns */}
                            {dreamDetail.recurringDreamAnalysis.patterns.length > 0 && (
                                <View className="mb-4">
                                    <Text className="font-nunito font-semibold text-gray-700 mb-2">Patterns:</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {dreamDetail.recurringDreamAnalysis.patterns.map((pattern, index) => (
                                            <PastelChip
                                                key={`pattern-${index}`}
                                                text={pattern}
                                                bgColor={getUniquePastelColors(dreamDetail.recurringDreamAnalysis?.patterns.length || 1)[index] || '#e0e0e0'}
                                                size="md"
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                            
                            {/* Interpretation */}
                            {dreamDetail.recurringDreamAnalysis.interpretation && (
                                <View className="bg-white rounded-xl p-4 mb-6 gap-2 shadow-sm">
                                    <View className="self-center mb-2">
                                        <RecurringDreamsIcon />
                                    </View>
                                    <Text className="font-nunito text-lg text-gray-800">
                                        {dreamDetail.recurringDreamAnalysis.interpretation}
                                    </Text>
                                </View>
                            )}
                        </>
                    )}
                    
                    {/* Advice Card */}
                    <View className="bg-white rounded-xl p-4 mt-6 gap-2 shadow-sm">
                        <View className="self-center mb-2">
                            <BulbIcon />
                        </View>
                        <Text className="font-nunito text-lg text-gray-800">{dreamDetail?.advice}</Text>
                    </View>
                </View>
            </ScrollView>
        </GeneralLinearBackground>
    );
};

export default DreamDetail;
