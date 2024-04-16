import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import CameraView from './src/components/CameraView';

const App = () => {
    return (
        <SafeAreaView style={styles.container}>
            <CameraView />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;
