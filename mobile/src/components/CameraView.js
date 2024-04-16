import React, { useRef } from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import { RNCamera } from 'react-native-camera';
import axios from 'axios';

const CameraView = () => {
    const cameraRef = useRef(null);

    const takePicture = async () => {
        if (cameraRef.current) {
            const options = { quality: 0.5, base64: true };
            const data = await cameraRef.current.takePictureAsync(options);
            await annotateImage(data.base64);
        }
    };

    const annotateImage = async (imageData) => {
        try {
            const response = await axios.post('http://localhost:5000/annotate', { image: imageData });
            console.log('Annotations:', response.data);
        } catch (error) {
            console.error('An error occurred while annotating the image:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <RNCamera
                ref={cameraRef}
                style={{ flex: 1 }}
                type={RNCamera.Constants.Type.back}
                captureAudio={false}
            >
                {({ camera, status }) => {
                    if (status !== 'READY') return <View />;
                    return (
                        <TouchableHighlight onPress={takePicture}>
                            <Text>SNAP</Text>
                        </TouchableHighlight>
                    );
                }}
            </RNCamera>
        </View>
    );
};

export default CameraView;
