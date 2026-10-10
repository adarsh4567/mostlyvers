import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Fonts } from '../theme';

export const shouldUseBookCoverPlaceholder = (uri?: string | null) => !uri?.trim();

export function BookCover({ uri, title, style, contentFit = 'cover' }: { uri?: string | null; title: string; style?: StyleProp<ViewStyle>; contentFit?: 'cover' | 'contain' }) {
  if (!shouldUseBookCoverPlaceholder(uri)) return <View style={[style, styles.frame]}><Image source={uri!} style={StyleSheet.absoluteFill} contentFit={contentFit} accessibilityLabel={`${title} cover`} /></View>;
  return <View style={[style, styles.frame, styles.placeholder]} accessibilityLabel={`${title} cover placeholder`}><Text style={styles.mark}>MV</Text><Text style={styles.title} numberOfLines={4}>{title}</Text><Text style={styles.brand}>MOSTLYVERS</Text></View>;
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden' },
  placeholder: { alignItems: 'center', justifyContent: 'center', padding: 8, backgroundColor: Colors.primary },
  mark: { color: Colors.accent, fontFamily: Fonts.display, fontWeight: '700', fontSize: 22, lineHeight: 24 },
  title: { color: Colors.white, fontFamily: Fonts.display, fontWeight: '700', textAlign: 'center', fontSize: 13, lineHeight: 14, marginVertical: 5 },
  brand: { color: '#E8D0B1', fontFamily: Fonts.bodyBold, fontSize: 6, letterSpacing: 1 },
});
