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
import requestStoragePermissions, { openSettings } from '@/app/utils/checkStoragePermission';
import * as FileSystem from 'expo-file-system';
import dreamApi from '@/api/dreamApi';
import { useAuth } from '@clerk/clerk-expo';
import dallEApi from '@/api/dallEApi';
import CrescentMoonIcon from '@/app/components/svg-components/CrescentMoon';
import BookIcon from '@/app/components/svg-components/Book';
import TagIcon from '@/app/components/svg-components/Tag';
import BulbIcon from '@/app/components/svg-components/Bulb';
import RightArrowIcon from '@/app/components/svg-components/RightArrow';
import useDreamListStore from '@/app/store/dreamListStore';
import useDreamResultStore from '@/app/store/dreamResultStore';
import getUniquePastelColors from '@/app/utils/pastelColors';

const IMAGE_HEIGHT = 256; // same as DreamImage height defined below

const generateAndSaveDalleImage = async (dreamId: string, dallEPrompt: string, token: string) => {
    try {
        // Request permissions
        const hasPermission = await requestStoragePermissions();
        if (!hasPermission) {
            Alert.alert(
                'Storage Access Required',
                'To save your dream images, we need access to your storage. Please enable permissions in settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: openSettings },
                ]
            );
            throw new Error('STORAGE_PERMISSION_DENIED');
        }

        // Create directory structure
        const directory = `${FileSystem.documentDirectory}dream-images/`;
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

        // Generate unique filename
        const filename = `dream-${dreamId}-${Date.now()}.png`;
        const localUri = `${directory}${filename}`;

        // Get DALL-E image URL first
        const dalleResponse = await dallEApi.generateDallE(dallEPrompt, dreamId, token);

        // Validate response
        if (!dalleResponse?.imageUrl) {
            throw new Error('INVALID_DALLE_RESPONSE');
        }

        // Create temporary file URI for download
        const downloadUri = `${localUri}.tmp`;

        // Configure download
        const downloadResumable = FileSystem.createDownloadResumable(
            dalleResponse.imageUrl, // Remote URL
            downloadUri // Temporary local path
        );

        // Execute download
        const result = await downloadResumable.downloadAsync();

        if (!result || result.status !== 200) {
            await FileSystem.deleteAsync(downloadUri); // Clean up
            throw new Error('DOWNLOAD_FAILED');
        }

        // Move from temp location to final location
        await FileSystem.moveAsync({
            from: downloadUri,
            to: localUri,
        });

        // Update database
        await dreamApi.updateDreamImagePath(dreamId, localUri, token);

        return localUri;
    } catch (error) {
        console.error('Image Save Error:', error);
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
        // Generate & save DALL-E image. Use a flag to ensure this runs only once.
        const hasRun = { current: false };
        (async () => {
            if (hasRun.current) return;
            hasRun.current = true;
            if (!dreamData) {
                return;
            }
            const token = await getToken();
            const imagePath = await generateAndSaveDalleImage(dreamData.id, dreamData['dall-e-prompt'], token!);
            if (imagePath) {
                // Optionally check if the image has already been set
                if (dreamData.dalleImagePath !== imagePath) {
                    dreamData.dalleImagePath = imagePath;
                    useDreamResultStore.getState().setDreamData(dreamData);
                    addDream(dreamData); // Add the dream to the list
                }
            }
        })();
    }, []);

    if (!dreamData) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>No dream data available</Text>
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
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 30 }}
                className="flex-1 p-5"
            >
                {/* AI Generated Image */}
                <DreamImage
                    uri={dreamData.dalleImagePath}
                    style={{ width: '100%', height: IMAGE_HEIGHT, borderRadius: 16, marginBottom: 24 }}
                    onLoad={() => {
                        setImageLoaded(true);
                    }}
                />
                {/* Interpretation Card */}
                <View className="bg-white rounded-3xl p-4 mb-6 gap-2 shadow-xl">
                    <View className="self-center mb-2">
                        <CrescentMoonIcon />
                    </View>
                    <Text className="text-text font-nunito text-lg">{dreamData.summary}</Text>
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
                {/* Advice Card */}
                <View className="bg-white rounded-xl p-4 mt-6 gap-2 shadow-xl">
                    <View className="self-center mb-2">
                        <BulbIcon />
                    </View>
                    <Text className="text-text font-nunito text-lg">{dreamData.advice}</Text>
                </View>
            </ScrollView>

            {/* Floating "Go to Journal" Button */}
            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: 70,
                    right: 20,
                    opacity: fadeAnim,
                    transform: [
                        {
                            scale: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
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
                        style={{
                            backgroundColor: Colors.primary,
                            padding: 15,
                            borderRadius: 50,
                            flexDirection: 'row',
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 5,
                            elevation: 5,
                        }}
                    >
                        <Text style={{ fontFamily: 'Nunito', marginRight: 8 }}>Go to Dream Journal</Text>
                        <RightArrowIcon />
                    </Pressable>
                </Link>
            </Animated.View>

            {/* Bottom popup when the image is loaded but scrolled off screen */}
            {imageLoaded && showScrollToTop && (
                <View
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        right: 20,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        borderRadius: 25,
                        alignItems: 'center',
                    }}
                >
                    <Pressable
                        onPress={() => {
                            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                        }}
                    >
                        <Text style={{ color: 'white', fontFamily: 'Nunito' }}>Tap here to see the image!</Text>
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
        {emoji ? <Text className="text-4xl mr-2">{emoji}</Text> : icon === 'book' ? <BookIcon /> : <TagIcon />}
        <Text className="text-xl font-semibold text-text font-nunito">{title}</Text>
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
                <Text className="font-semibold">{title}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primary} />
            </Pressable>
            {isExpanded && <Text className="font-nunito mt-2">{content}</Text>}
        </View>
    );
};
