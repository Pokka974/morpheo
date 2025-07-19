import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Colors from '@/constants/Colors';

type GeneralLinearBackgroundProps = {
    children: React.ReactNode;
};

const GeneralLinearBackground: React.FC<GeneralLinearBackgroundProps> = ({ children }) => {
    return (
        <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.background}>
            <View style={styles.overlay}>{children}</View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});

export default GeneralLinearBackground;
