import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme';

const SectionDivider: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <View style={styles.heartContainer}>
        {/* Heart is part of the accent/aesthetic */}
        <View style={styles.heart} />
      </View>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.accent,
    opacity: 0.5,
  },
  heartContainer: {
    paddingHorizontal: 8,
  },
  heart: {
    width: 8,
    height: 8,
    backgroundColor: Colors.accent,
    transform: [{ rotate: '45deg' }],
  },
});

export default SectionDivider;
