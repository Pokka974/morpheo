// DreamCard.tsx
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, ScrollView, Modal } from 'react-native';
import { DreamData } from '../store/dreamResultStore';
import PastelChip from './PastelChip';
import { Image } from 'expo-image';
import getUniquePastelColors from '../utils/pastelColors';

interface DreamCardProps {
  dream: DreamData;
  onPress: () => void;
}
const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const DreamCard = ({ dream, onPress }: DreamCardProps) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipTitle, setTooltipTitle] = useState('');
  const [tooltipContent, setTooltipContent] = useState('');

  const showTooltip = (title: string, content: string) => {
    setTooltipTitle(title);
    setTooltipContent(content);
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  // Create a deterministic mapping of emotion to pastel color.
  // First, create a unique set of emotions, then generate as many unique colors,
  // and finally map back to the original list of emotions.
  const emotionColors = useMemo(() => {
    // Create a unique array of emotions
    const uniqueEmotions = Array.from(new Set(dream.emotions));
    // Generate an array of unique pastel colors for the unique emotions.
    const colors = getUniquePastelColors(uniqueEmotions.length);
    // Create a mapping from an emotion to a color.
    const mapping: Record<string, string> = {};
    uniqueEmotions.forEach((emotion, index) => {
      mapping[emotion] = colors[index];
    });
    // Map back to the original list so that each chip gets its predetermined color.
    return dream.emotions.map((emotion) => mapping[emotion]);
  }, [dream.emotions]);

  // Handle cultural emojis, assuming the emoji is the last part of the key.
  const culturalEmojis = Object.keys(dream.culturalReferences).map((key) => {
    const parts = key.split(' ');
    return parts[parts.length - 1];
  });

  return (
    <>
      <View className="flex-row h-40 bg-white rounded-xl overflow-hidden shadow-sm my-2 mx-4">
        {/* Image on the left taking 1/3 of the card width */}
        <Pressable onPress={onPress} className="w-2/5 h-full">
          <Image
            placeholderContentFit="scale-down"
            transition={300}
            style={{ width: '100%', height: '100%' }}
            placeholder={{ blurhash }}
            source={{ uri: dream.dalleImagePath }}
            contentFit="cover"
          />
        </Pressable>
        <View className="flex-1 p-2 justify-between gap-3">
          {/* Title and emoji */}
          <Pressable onPress={onPress} className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text
                className="flex-1 font-nunito text-lg font-bold text-gray-800"
                numberOfLines={1}
              >
                {dream.title}
              </Text>
              <Text className="ml-1 text-lg">{dream.emoji}</Text>
            </View>
            {/* Description truncated with ellipsis */}
            <Pressable
              onLongPress={() => showTooltip('Summary', dream.summary)}
            >
              <Text
                className="font-nunito text-sm mb-3 text-gray-600"
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {dream.summary}
              </Text>
            </Pressable>
          </Pressable>
          <View className="flex-row items-center">
            {/* Horizontal scroll for emotion chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
              onStartShouldSetResponder={() => true}
            >
              {dream.emotions.map((emotion, index) => (
                <PastelChip
                  key={`${emotion}-${index}`}
                  text={emotion}
                  bgColor={emotionColors[index]}
                  size="sm" // Make chips smaller in the DreamCard
                />
              ))}
            </ScrollView>
            <View className="flex-row ml-2">
              {culturalEmojis.map((emoji, index) => (
                <Text
                  key={`${emoji}-${index}`}
                  className="font-nunito text-sm mr-1"
                >
                  {emoji}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Tooltip Modal */}
      <Modal
        visible={tooltipVisible}
        transparent
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <Pressable
          onPress={hideTooltip}
          className="flex-1 bg-black/50 justify-center items-center p-4"
        >
          <Pressable className="bg-white p-4 rounded-xl max-w-[80%]">
            <Text className="font-nunito font-bold text-lg mb-2 text-gray-800">
              {tooltipTitle}
            </Text>
            <Text className="font-nunito text-base text-gray-600">
              {tooltipContent}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default DreamCard;
