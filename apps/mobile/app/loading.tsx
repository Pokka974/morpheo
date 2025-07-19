import { View, ActivityIndicator } from 'react-native';
import React from 'react';
import Colors from '@/constants/Colors';

const Loading = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
};

export default Loading;
