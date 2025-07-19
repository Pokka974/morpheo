// components/DreamImage.tsx
import { Image } from 'expo-image';
import { StyleProp, ImageStyle } from 'react-native';

interface DreamImageProps {
    uri?: string | null;
    style?: StyleProp<ImageStyle>;
    onLoad?: () => void; // Added onLoad callback prop
}

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const DreamImage = ({ uri, style, onLoad }: DreamImageProps) => {
    return (
        <Image
            style={style}
            source={uri ? { uri } : blurhash}
            placeholder={{ blurhash }}
            transition={300}
            recyclingKey={uri || 'dream-placeholder'}
            placeholderContentFit="scale-down"
            onLoad={onLoad} // Pass the onLoad callback to expo-image's onLoad prop
        />
    );
};

export default DreamImage;
