import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Colors, Fonts, Radii, ARROW_HEART } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const { height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Decorative corner leaves (using text art / emoji as placeholder) */}
      <Text style={styles.leafTopLeft}>🌿</Text>
      <Text style={styles.leafTopRight}>🌿</Text>
      <Text style={styles.leafBottomLeft}>🌿</Text>
      <Text style={styles.leafBottomRight}>🌿</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo circle */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/mostlyvers-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {/* Brand heading */}
        <Text style={styles.brand}>MOSTLYVERS</Text>
        <Text style={styles.tagline}>Stories Beyond Imagination</Text>

        {/* Heart divider */}
        <Text style={styles.divider}>{ARROW_HEART}</Text>

        {/* Welcome block */}
        <Text style={styles.welcomeHeading}>Welcome Back!</Text>
        <Text style={styles.welcomeSub}>Login to continue your reading journey</Text>

        {/* Spacer */}
        <View style={{ height: 32 }} />

        {/* Login Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>LOGIN</Text>
        </TouchableOpacity>

        {/* OR divider */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>✦  SIGN UP</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
        <Text style={styles.footer}>
          New to MOSTLYVERS?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Signup')}>
            Create an account
          </Text>
        </Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  leafTopLeft: {
    position: 'absolute', top: 40, left: -10, fontSize: 60, opacity: 0.18,
    transform: [{ rotate: '-30deg' }],
  },
  leafTopRight: {
    position: 'absolute', top: 40, right: -10, fontSize: 60, opacity: 0.18,
    transform: [{ rotate: '30deg' }, { scaleX: -1 }],
  },
  leafBottomLeft: {
    position: 'absolute', bottom: 100, left: -10, fontSize: 60, opacity: 0.18,
    transform: [{ rotate: '20deg' }],
  },
  leafBottomRight: {
    position: 'absolute', bottom: 100, right: -10, fontSize: 60, opacity: 0.18,
    transform: [{ rotate: '-20deg' }, { scaleX: -1 }],
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.tagBg,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
    overflow: 'hidden',
  },
  logo: {
    width: 120,
    height: 120,
  },
  brand: {
    fontSize: Fonts.displaySize,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    letterSpacing: 3,
    textAlign: 'center',
  },
  tagline: {
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  divider: {
    color: Colors.accent,
    fontSize: 14,
    letterSpacing: 4,
    marginVertical: 16,
    textAlign: 'center',
  },
  welcomeHeading: {
    fontSize: 26,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 17,
    borderRadius: Radii.button,
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 2,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    marginHorizontal: 12,
    color: Colors.textMuted,
    fontSize: Fonts.smallSize,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: Radii.button,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.5,
  },
  footer: {
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerLink: {
    color: Colors.accent,
    fontFamily: Fonts.bodyBold,
  },
});

export default WelcomeScreen;
