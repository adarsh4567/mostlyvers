import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authService } from '../../services/authService';
import { Colors, Fonts, Radii } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setMessage('If an account exists, reset instructions have been sent.');
    } catch (error: any) { setMessage(error.message || 'Unable to request a reset.'); }
    finally { setLoading(false); }
  };
  return <View style={styles.container}>
    <Header title="Reset Password" leftComponent={<BackButton />} />
    <View style={styles.content}>
      <Text style={styles.copy}>Enter your account email. For privacy, the same confirmation is shown for every address.</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="Email" />
      {!!message && <Text style={styles.message}>{message}</Text>}
      <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>{loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>SEND RESET LINK</Text>}</TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}><Text style={styles.link}>I already have a reset code</Text></TouchableOpacity>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, content: { padding: 24 },
  copy: { color: Colors.textSecondary, fontSize: Fonts.bodySize, fontFamily: Fonts.body, lineHeight: 22, marginBottom: 20 },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: Radii.input, padding: 14, marginBottom: 16, fontFamily: Fonts.body },
  message: { color: Colors.textSecondary, marginBottom: 16, fontFamily: Fonts.body },
  button: { backgroundColor: Colors.primary, borderRadius: Radii.button, padding: 16, alignItems: 'center' },
  buttonText: { color: Colors.white, fontFamily: Fonts.bodyBold }, link: { color: Colors.primary, textAlign: 'center', marginTop: 24, fontFamily: Fonts.bodyBold },
});
