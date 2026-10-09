import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Fonts } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const LogoutScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/mostlyvers-logo.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <Text style={styles.title}>You have been logged out.</Text>
      <Text style={styles.subtitle}>Thank you for visiting MOSTLYVERS.</Text>
      <TouchableOpacity style={styles.login} onPress={() => navigation.navigate('Login')}><Text style={styles.loginText}>LOGIN</Text></TouchableOpacity>
      <TouchableOpacity style={styles.signup} onPress={() => navigation.navigate('Signup')}><Text style={styles.signupText}>SIGN UP</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: Fonts.subheadingSize,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
  },
  login: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center', marginTop: 28 },
  loginText: { color: Colors.white, fontFamily: Fonts.bodyBold },
  signup: { borderColor: Colors.primary, borderWidth: 1, borderRadius: 12, paddingVertical: 14, width: '100%', alignItems: 'center', marginTop: 12 },
  signupText: { color: Colors.primary, fontFamily: Fonts.bodyBold },
});

export default LogoutScreen;
