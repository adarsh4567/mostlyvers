import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../theme';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
};

const styles = StyleSheet.create({
  error: {
    color: Colors.error,
    fontSize: Fonts.smallSize,
    marginTop: 4,
    marginBottom: 8,
  },
});

export default ErrorMessage;
