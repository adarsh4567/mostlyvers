import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../theme';

const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/mostlyvers-logo.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <ActivityIndicator size="large" color={Colors.accent} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  loader: {
    marginTop: 32,
  },
});

export default LoadingScreen;
