import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Colors, Fonts, Radii, ARROW_HEART } from '../../theme';
import { authService } from '../../services/authService';
import { setApiToken } from '../../services/api';
import { useDispatch } from 'react-redux';
import { setSession } from '../../store/slices/authSlice';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const appNavigation = useNavigation<AppNavigationProp>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setIsLoading(true);
      const session = await authService.login(email, password);
      setApiToken(session.accessToken);
      dispatch(setSession(session));
      appNavigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Ionicons name="leaf-outline" style={styles.leafTL} />
      <Ionicons name="leaf-outline" style={styles.leafTR} />
      <Ionicons name="leaf-outline" style={styles.leafBL} />
      <Ionicons name="leaf-outline" style={styles.leafBR} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/mostlyvers-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <Text style={styles.brand}>MOSTLYVERS</Text>
        <Text style={styles.tagline}>Stories Beyond Imagination</Text>
        <Text style={styles.divider}>{ARROW_HEART}</Text>

        <Text style={styles.welcomeHeading}>Welcome Back!</Text>
        <Text style={styles.welcomeSub}>Login to continue your reading journey</Text>

        <View style={{ height: 28 }} />

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor={Colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'LOGGING IN...' : 'LOGIN'}
          </Text>
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
          <Ionicons name="person-add-outline" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.secondaryButtonText}>SIGN UP</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
        <Text style={styles.footer}>
          New to MOSTLYVERS?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Signup')}>
            Create an account
          </Text>
        </Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  leafTL: { position: 'absolute', top: 20, left: -22, fontSize: 100, color: Colors.accent, opacity: 0.12, transform: [{ rotate: '-30deg' }] },
  leafTR: { position: 'absolute', top: 20, right: -22, fontSize: 100, color: Colors.accent, opacity: 0.12, transform: [{ rotate: '30deg' }, { scaleX: -1 }] },
  leafBL: { position: 'absolute', bottom: 40, left: -24, fontSize: 110, color: Colors.accent, opacity: 0.12, transform: [{ rotate: '20deg' }] },
  leafBR: { position: 'absolute', bottom: 40, right: -24, fontSize: 110, color: Colors.accent, opacity: 0.12, transform: [{ rotate: '-20deg' }, { scaleX: -1 }] },
  logoCircle: {
    width: 154,
    height: 154,
    borderRadius: 77,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
    overflow: 'hidden',
  },
  logo: { width: '100%', height: '100%' },
  brand: {
    fontSize: Fonts.displaySize,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    letterSpacing: 2.2,
    textAlign: 'center',
  },
  tagline: {
    fontSize: Fonts.bodySize,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  divider: {
    color: Colors.accent,
    fontSize: 14,
    letterSpacing: 4,
    marginVertical: 14,
    textAlign: 'center',
  },
  welcomeHeading: {
    fontSize: 24,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: Fonts.bodySize,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radii.input,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: 14,
    width: '100%',
    height: 58,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: Fonts.bodySize,
    fontFamily: Fonts.body,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: 4,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: Colors.primary,
    fontSize: Fonts.smallSize,
    fontFamily: Fonts.bodyBold,
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: Fonts.smallSize,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radii.button,
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
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
  orLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  orText: {
    marginHorizontal: 12,
    color: Colors.textMuted,
    fontSize: Fonts.smallSize,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: Radii.button,
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
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerLink: {
    color: Colors.primary,
    fontFamily: Fonts.bodyBold,
  },
});

export default LoginScreen;
