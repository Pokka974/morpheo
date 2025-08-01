import React from 'react';
import { View } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const RightArrowIcon = ({ width = 35, height = 35, style }: any) => {
    return (
        <View style={style}>
            <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
                <Path
                    opacity="0.5"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.25 12C3.25 11.5858 3.58579 11.25 4 11.25H13.25V12.75H4C3.58579 12.75 3.25 12.4142 3.25 12Z"
                    fill="#1C274C"
                />
                <Path
                    d="M13.25 12.75V18C13.25 18.3034 13.4327 18.5768 13.713 18.6929C13.9932 18.809 14.3158 18.7449 14.5303 18.5304L20.5303 12.5304C20.671 12.3897 20.75 12.1989 20.75 12C20.75 11.8011 20.671 11.6103 20.5303 11.4697L14.5303 5.46969C14.3158 5.25519 13.9932 5.19103 13.713 5.30711C13.4327 5.4232 13.25 5.69668 13.25 6.00002V11.25V12.75Z"
                    fill="#1C274C"
                />
            </Svg>
        </View>
    );
};

export default RightArrowIcon;
