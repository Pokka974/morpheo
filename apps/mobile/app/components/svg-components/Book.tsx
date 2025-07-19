import React from 'react';
import { View } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const BookIcon = ({ width = 35, height = 35, style }: any) => {
    return (
        <View style={style}>
            <Svg height={height} width={width} viewBox="0 0 64 64">
                <Path fill="#274c77" d="M32,51h-3l-2-2H10V19h4v24s12.15-3,18,8Z" />
                <Path fill="#274c77" d="M50,43V19h4v30h-17s-2,2-2,2h-3c5.85-11,18-8,18-8Z" />
                <Path fill="#6096ba" d="M32,51c-5.85-11-18-8-18-8V16l6-2v25c6.63,0,12,5.37,12,12Z" />
                <Path fill="#6096ba" d="M44,14l6,2v27s-12.15-3-18,8c0-6.63,5.37-12,12-12V14Z" />
                <Path
                    fill="#a3cef1"
                    d="M32,25c0-6.63-5.37-12-12-12v26c6.63,0,12,5.37,12,12,0-6.63,5.37-12,12-12V13c-6.63,0-12,5.37-12,12Z"
                />
            </Svg>
        </View>
    );
};

export default BookIcon;
