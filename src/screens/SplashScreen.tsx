import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors, Fonts, ARROW_HEART } from '../theme';
import { useDispatch } from 'react-redux';
import { setSession, clearAuth } from '../store/slices/authSlice';
import { setApiToken, initializeToken } from '../services/api';
import { authService } from '../services/authService';
import { clearSessionTokens } from '../utils/secureStorage';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await initializeToken();
        const session = await authService.restoreSession();
        if (session) {
          dispatch(setSession(session));
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } else {
          setApiToken(null);
          dispatch(clearAuth());
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        }
      } catch (error) {
        await clearSessionTokens();
        setApiToken(null);
        dispatch(clearAuth());
        navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
      }
    };

    checkAuth();
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoCircle}>
        <Image
          source={require('../assets/mostlyvers-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {/* Brand */}
      <Text style={styles.brand}>MOSTLYVERS</Text>
      <Text style={styles.tagline}>Stories Beyond Imagination</Text>
      <Text style={styles.divider}>{ARROW_HEART}</Text>

      {/* Loading */}
      <ActivityIndicator size="small" color={Colors.accent} style={styles.loader} />
      <Text style={styles.loadingText}>Opening your world of stories...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  leaf1: {
    position: 'absolute', top: 80, left: 10,
    fontSize: 64, opacity: 0.15,
    transform: [{ rotate: '-20deg' }],
  },
  leaf2: {
    position: 'absolute', bottom: 120, right: 10,
    fontSize: 64, opacity: 0.15,
    transform: [{ rotate: '20deg' }, { scaleX: -1 }],
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    overflow: 'hidden',
  },
  logo: { width: '100%', height: '100%' },
  brand: {
    fontSize: 32,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    letterSpacing: 3,
    marginBottom: 6,
  },
  tagline: {
    fontSize: Fonts.bodySize,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  divider: {
    color: Colors.accent,
    fontSize: 13,
    letterSpacing: 4,
    marginVertical: 20,
  },
  loader: { marginBottom: 10 },
  loadingText: {
    fontSize: Fonts.smallSize,
    fontFamily: Fonts.body,
    color: Colors.textMuted,
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
});

export default SplashScreen;
