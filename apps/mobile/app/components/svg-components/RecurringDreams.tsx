import React from 'react';
import { View } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

const RecurringDreamsIcon = ({ width = 35, height = 35, style }: any) => {
    return (
        <View style={style}>
            <Svg height={height} width={width} viewBox="0 0 64 64">
                {/* First dream circle */}
                <Circle cx="18" cy="20" r="10" fill="#a3cef1" stroke="#274c77" strokeWidth="2" />
                {/* Second dream circle */}
                <Circle cx="46" cy="20" r="10" fill="#a3cef1" stroke="#274c77" strokeWidth="2" />
                {/* Third dream circle */}
                <Circle cx="32" cy="44" r="10" fill="#a3cef1" stroke="#274c77" strokeWidth="2" />
                
                {/* Connection lines between dreams */}
                <Path 
                    d="M 26 24 L 38 24" 
                    stroke="#6096ba" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                />
                <Path 
                    d="M 24 28 L 28 36" 
                    stroke="#6096ba" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                />
                <Path 
                    d="M 40 28 L 36 36" 
                    stroke="#6096ba" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                />
                
                {/* Dream symbols inside circles */}
                <Circle cx="18" cy="20" r="3" fill="#274c77" />
                <Circle cx="46" cy="20" r="3" fill="#274c77" />
                <Circle cx="32" cy="44" r="3" fill="#274c77" />
                
                {/* Small connecting dots */}
                <Circle cx="32" cy="24" r="1.5" fill="#6096ba" />
                <Circle cx="26" cy="32" r="1.5" fill="#6096ba" />
                <Circle cx="38" cy="32" r="1.5" fill="#6096ba" />
            </Svg>
        </View>
    );
};

export default RecurringDreamsIcon;