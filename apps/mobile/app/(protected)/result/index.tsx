import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ScrollView, View, Text, FlatList, Pressable, Alert, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import GeneralLinearBackground from '@/app/components/GeneralLinearBackground';
import useTabBarStore from '@/app/store/tabBarStore';
import PastelChip from '@/app/components/PastelChip';
import Colors from '@/constants/Colors';
import DreamImage from '@/app/components/DreamImage';
import { Button } from 'tamagui';
import { useAuth } from '@clerk/clerk-expo';
import dallEApi from '@/api/dallEApi';
import CrescentMoonIcon from '@/app/components/svg-components/CrescentMoon';
import BookIcon from '@/app/components/svg-components/Book';
import TagIcon from '@/app/components/svg-components/Tag';
import BulbIcon from '@/app/components/svg-components/Bulb';
import RightArrowIcon from '@/app/components/svg-components/RightArrow';
import RecurringDreamsIcon from '@/app/components/svg-components/RecurringDreams';
import useDreamListStore from '@/app/store/dreamListStore';
import useDreamResultStore from '@/app/store/dreamResultStore';
import getUniquePastelColors from '@/app/utils/pastelColors';

const IMAGE_HEIGHT = 256; // same as DreamImage height defined below

const generateDalleImage = async (dreamId: string, dallEPrompt: string, token: string) => {
    try {
        // Generate DALL-E image (backend handles download and base64 storage)
        const dalleResponse = await dallEApi.generateDallE(dallEPrompt, dreamId, token);

        // Validate response
        if (!dalleResponse?.imageUrl && !dalleResponse?.imageBase64) {
            throw new Error('INVALID_DALLE_RESPONSE');
        }

        return dalleResponse;
    } catch (error) {
        console.error('Image Generation Error:', error);
        throw error;
    }
};

export default function InterpretationScreen() {
    const { getToken } = useAuth();
    const router = useRouter();
    const { dreamData, reset } = useDreamResultStore();
    const { setVisible } = useTabBarStore();
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
    const [showJournalButton, setShowJournalButton] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const addDream = useDreamListStore(state => state.addDream);
    const lastProcessedDreamId = useRef<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    // Create mapping for emotions with deterministic pastel colors.
    const emotionMapping: Record<string, string> = useMemo(() => {
        if (!dreamData?.emotions) return {};
        const uniqueEmotions = Array.from(new Set(dreamData.emotions));
        const colors = getUniquePastelColors(uniqueEmotions.length);
        const mapping: Record<string, string> = {};
        uniqueEmotions.forEach((emotion, index) => {
            mapping[emotion] = colors[index];
        });
        return mapping;
    }, [dreamData?.emotions]);

    // Create mapping for keywords with deterministic pastel colors.
    const keywordsMapping: Record<string, string> = useMemo(() => {
        if (!dreamData?.keywords) return {};
        const uniqueKeywords = Array.from(new Set(dreamData.keywords));
        const colors = getUniquePastelColors(uniqueKeywords.length);
        const mapping: Record<string, string> = {};
        uniqueKeywords.forEach((keyword, index) => {
            mapping[keyword] = colors[index];
        });
        return mapping;
    }, [dreamData?.keywords]);

    useEffect(() => {
        // Only generate image if we have dream data
        if (!dreamData) {
            return;
        }

        // Check if we already processed this specific dream
        if (lastProcessedDreamId.current === dreamData.id) {
            return;
        }

        // Check if image already exists
        if (dreamData.dalleImageData || dreamData.dalleImagePath) {
            lastProcessedDreamId.current = dreamData.id; // Mark as processed even if image exists
            return;
        }

        // Check if we're already generating an image for any dream
        if (isGeneratingImage) {
            return;
        }

        // Mark this dream as processed and start generation
        lastProcessedDreamId.current = dreamData.id;
        setIsGeneratingImage(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setIsGeneratingImage(false);
                    return;
                }

                const dalleResponse = await generateDalleImage(dreamData.id, dreamData.dallEPrompt, token);
                if (dalleResponse) {
                    // Create updated dream data without mutating original
                    const updatedDreamData = {
                        ...dreamData,
                        dalleImagePath: dalleResponse.imageUrl || dreamData.dalleImagePath,
                        dalleImageData: dalleResponse.imageBase64 || dreamData.dalleImageData,
                    };
                    
                    useDreamResultStore.getState().setDreamData(updatedDreamData);
                    addDream(updatedDreamData);
                }
            } catch (error) {
                console.error('Failed to generate image:', error);
                // Reset the processed dream ID on error to allow retry
                lastProcessedDreamId.current = null;
            } finally {
                setIsGeneratingImage(false);
            }
        })();
    }, [dreamData?.id]); // Only depend on dream ID to trigger when new dream arrives

    if (!dreamData) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="font-nunito text-gray-800">No dream data available</Text>
                <Button
                    onPress={() => {
                        reset();
                        router.replace('/logdream');
                    }}
                    className="mt-4 bg-primary rounded-full px-4 py-2"
                >
                    OK
                </Button>
            </View>
        );
    }

    // Convert cultural references object to array
    const culturalRefs = Object.entries(dreamData.culturalReferences).map(([culture, meaning]) => ({
        culture,
        meaning,
    }));

    const handleScroll = (event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;

        // Fade in/out the "Go to Journal" button at a low threshold
        if (scrollY > 50 && !showJournalButton) {
            setShowJournalButton(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
        } else if (scrollY <= 50 && showJournalButton) {
            setShowJournalButton(false);
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start();
        }

        // Show the "Scroll to Top" popup if the image is loaded and the user has scrolled
        // past the bottom of the image.
        if (imageLoaded && scrollY > IMAGE_HEIGHT + 24 /* marginBottom */) {
            setShowScrollToTop(true);
        } else {
            setShowScrollToTop(false);
        }
    };

    return (
        <GeneralLinearBackground>
            <ScrollView
                ref={scrollViewRef}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingBottom: 160, paddingTop: 30 }}
                className="flex-1 p-5"
            >
                {/* AI Generated Image */}
                {isGeneratingImage ? (
                    <View style={{ width: '100%', height: IMAGE_HEIGHT, borderRadius: 16, marginBottom: 24 }} 
                          className="bg-gray-200 items-center justify-center">
                        <Text className="font-nunito text-gray-600 text-center px-4">
                            🎨 Generating your dream image...
                        </Text>
                    </View>
                ) : (dreamData.dalleImageData || dreamData.dalleImagePath) ? (
                    <DreamImage
                        uri={dreamData.dalleImagePath}
                        base64Data={dreamData.dalleImageData}
                        style={{ width: '100%', height: IMAGE_HEIGHT, borderRadius: 16, marginBottom: 24 }}
                        onLoad={() => {
                            setImageLoaded(true);
                        }}
                    />
                ) : (
                    <View style={{ width: '100%', height: IMAGE_HEIGHT, borderRadius: 16, marginBottom: 24 }} 
                          className="bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300">
                        <Text className="font-nunito text-gray-500 text-center px-4">
                            ✨ Dream image will appear here
                        </Text>
                    </View>
                )}
                {/* Interpretation Card */}
                <View className="bg-white rounded-xl p-4 mb-6 gap-2 shadow-sm">
                    <View className="self-center mb-2">
                        <CrescentMoonIcon />
                    </View>
                    <Text className="font-nunito text-lg text-gray-800">{dreamData.summary}</Text>
                </View>
                {/* Emotions Section */}
                <SectionHeader title="Emotions" emoji={dreamData.emoji} />
                <FlatList
                    horizontal
                    data={dreamData.emotions}
                    renderItem={({ item, index }) => (
                        <PastelChip
                            key={`${item}-${index}`}
                            text={item}
                            bgColor={emotionMapping[item] || '#ccc'}
                            size="md"
                        />
                    )}
                    keyExtractor={item => item}
                />
                {/* Keywords Section */}
                <SectionHeader title="Keywords" icon="pricetag" />
                <FlatList
                    horizontal
                    data={dreamData.keywords}
                    renderItem={({ item, index }) => (
                        <PastelChip
                            key={`${item}-${index}`}
                            text={item}
                            bgColor={keywordsMapping[item] || '#ccc'}
                            size="md"
                        />
                    )}
                    keyExtractor={item => item}
                />
                {/* Cultural References */}
                <SectionHeader title="Cultural References" icon="book" />
                {culturalRefs.map(ref => (
                    <Accordion
                        key={ref.culture}
                        title={ref.culture}
                        content={ref.meaning}
                        isExpanded={expandedAccordion === ref.culture}
                        onToggle={() => setExpandedAccordion(expandedAccordion === ref.culture ? null : ref.culture)}
                    />
                ))}
                
                {/* Recurring Patterns Section */}
                {dreamData.recurringDreamAnalysis?.hasConnections && (
                    <>
                        <SectionHeader title="Recurring Patterns" icon="recurring" />
                        
                        {/* Connected Dreams */}
                        {dreamData.recurringDreamAnalysis.connectedDreams.length > 0 && (
                            <View className="mb-4">
                                <Text className="font-nunito font-semibold text-gray-700 mb-2">Connected Dreams:</Text>
                                {dreamData.recurringDreamAnalysis.connectedDreams.map((connectedDream, index) => (
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
                        {dreamData.recurringDreamAnalysis.patterns.length > 0 && (
                            <View className="mb-4">
                                <Text className="font-nunito font-semibold text-gray-700 mb-2">Patterns:</Text>
                                <FlatList
                                    horizontal
                                    data={dreamData.recurringDreamAnalysis.patterns}
                                    renderItem={({ item, index }) => (
                                        <PastelChip
                                            key={`pattern-${index}`}
                                            text={item}
                                            bgColor={getUniquePastelColors(dreamData.recurringDreamAnalysis?.patterns.length || 1)[index] || '#e0e0e0'}
                                            size="md"
                                        />
                                    )}
                                    keyExtractor={(item, index) => `pattern-${index}`}
                                />
                            </View>
                        )}
                        
                        {/* Interpretation */}
                        {dreamData.recurringDreamAnalysis.interpretation && (
                            <View className="bg-white rounded-xl p-4 mb-6 gap-2 shadow-sm">
                                <View className="self-center mb-2">
                                    <RecurringDreamsIcon />
                                </View>
                                <Text className="font-nunito text-lg text-gray-800">
                                    {dreamData.recurringDreamAnalysis.interpretation}
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
                    <Text className="font-nunito text-lg text-gray-800">{dreamData.advice}</Text>
                </View>
            </ScrollView>

            {/* Floating "Go to Journal" Button */}
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 30,
                    left: 20,
                    right: 20,
                    opacity: fadeAnim,
                    transform: [
                        {
                            scale: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.95, 1],
                            }),
                        },
                    ],
                }}
            >
                <Link href={'/dreamhistory'} asChild>
                    <Pressable
                        onPress={() => {
                            reset();
                            setVisible(true);
                        }}
                        className="bg-white rounded-xl p-4 shadow-lg border border-gray-200"
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text className="font-nunito text-lg font-semibold text-gray-800 mr-2">Go to Dream Journal</Text>
                        <RightArrowIcon />
                    </Pressable>
                </Link>
            </Animated.View>

            {/* Bottom popup when the image is loaded but scrolled off screen */}
            {imageLoaded && showScrollToTop && (
                <View
                    style={{
                        position: 'absolute',
                        bottom: 110,
                        left: 20,
                        right: 20,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                    }}
                >
                    <Pressable
                        onPress={() => {
                            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                        }}
                    >
                        <Text className="font-nunito text-white text-sm">Tap here to see the image!</Text>
                    </Pressable>
                </View>
            )}
        </GeneralLinearBackground>
    );
}

// Reusable Section Header Component
export interface SectionHeaderProps {
    title: string;
    emoji?: string;
    icon?: string;
}

export const SectionHeader = ({ title, emoji, icon }: SectionHeaderProps) => (
    <View className="flex-row items-center mb-4 mt-6">
        {emoji ? (
            <Text className="text-4xl mr-2">{emoji}</Text>
        ) : icon === 'book' ? (
            <BookIcon />
        ) : icon === 'recurring' ? (
            <RecurringDreamsIcon />
        ) : (
            <TagIcon />
        )}
        <Text className="font-nunito text-xl font-semibold text-gray-800">{title}</Text>
    </View>
);

// Accordion Component
export interface AccordionProps {
    title: string;
    content: string;
    isExpanded: boolean;
    onToggle: () => void;
}

export const Accordion = ({ title, content, isExpanded, onToggle }: AccordionProps) => {
    return (
        <View className="bg-white rounded-xl p-4 my-2">
            <Pressable className="flex-row justify-between items-center" onPress={onToggle}>
                <Text className="font-nunito font-semibold text-gray-800">{title}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primary} />
            </Pressable>
            {isExpanded && <Text className="font-nunito mt-2">{content}</Text>}
        </View>
    );
};
