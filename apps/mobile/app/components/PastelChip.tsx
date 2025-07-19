// PastelChip.tsx
import React from 'react';
import { Text, View } from 'react-native';

interface PastelChipProps {
    text: string;
    bgColor?: string; // Pass your random pastel hue from outside
    size?: 'sm' | 'md' | 'lg';
}

const PastelChip: React.FC<PastelChipProps> = ({ text, bgColor, size = 'md' }) => {
    // Define size-related styles
    let paddingVertical: number;
    let paddingHorizontal: number;
    let fontSize: number;

    switch (size) {
        case 'sm':
            paddingVertical = 4;
            paddingHorizontal = 8;
            fontSize = 12;
            break;
        case 'lg':
            paddingVertical = 8;
            paddingHorizontal = 16;
            fontSize = 16;
            break;
        case 'md':
        default:
            paddingVertical = 6;
            paddingHorizontal = 12;
            fontSize = 14;
            break;
    }

    return (
        <View
            style={{
                backgroundColor: bgColor || 'hsl(200, 100%, 85%)', // default pastel if not provided
                paddingVertical,
                paddingHorizontal,
                borderRadius: 9999,
                marginRight: 5,
                borderWidth: 0.5,
                borderColor: '#4B5563',
            }}
        >
            <Text
                style={{
                    color: '#4B5563',
                    fontSize,
                    fontWeight: '500',
                }}
            >
                {text}
            </Text>
        </View>
    );
};

export default PastelChip;
