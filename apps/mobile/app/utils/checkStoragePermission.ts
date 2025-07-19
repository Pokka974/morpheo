// utils/storagePermissions.ts
import { Linking, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

const requestStoragePermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        // Android 13+ uses granular permissions
        const { status } = await MediaLibrary.requestPermissionsAsync();
        return status === 'granted';
    }

    if (Platform.OS === 'android') {
        // Legacy Android permission handling
        const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();

        if (!canAskAgain) {
            // Show custom modal explaining why permission is needed
            return false;
        }

        if (status !== 'granted') {
            const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
            return newStatus === 'granted';
        }
    }

    // iOS automatically handles permissions through system prompt
    return true;
};

export const openSettings = () => {
    if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
    } else {
        Linking.openSettings();
    }
};

export default requestStoragePermissions;
