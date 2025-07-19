import * as MediaLibrary from 'expo-media-library';
import { Linking, Platform } from 'react-native';
import { Alert } from 'react-native';

const checkAndRequestPermissions = async () => {
    if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Storage Permission Required',
                'Please enable storage permissions in settings to save dream images',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings(),
                    },
                ]
            );
            return false;
        }
    }
    return true;
};

export default checkAndRequestPermissions;
