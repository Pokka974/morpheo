// components/DreamImage.tsx
import { Image } from 'expo-image';
import { StyleProp, ImageStyle } from 'react-native';

interface DreamImageProps {
    uri?: string | null;
    base64Data?: string | null; // Add base64 data prop
    style?: StyleProp<ImageStyle>;
    onLoad?: () => void; // Added onLoad callback prop
}

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const DreamImage = ({ uri, base64Data, style, onLoad }: DreamImageProps) => {
    // Prioritize base64 data over URI for permanent storage
    const imageSource = base64Data ? { uri: base64Data } : uri ? { uri } : { blurhash };
    const recyclingKey = base64Data ? `base64-${base64Data.slice(0, 20)}` : uri || 'dream-placeholder';
    
    return (
        <Image
            style={style}
            source={imageSource}
            placeholder={{ blurhash }}
            transition={300}
            recyclingKey={recyclingKey}
            placeholderContentFit="scale-down"
            onLoad={onLoad} // Pass the onLoad callback to expo-image's onLoad prop
        />
    );
};

export default DreamImage;