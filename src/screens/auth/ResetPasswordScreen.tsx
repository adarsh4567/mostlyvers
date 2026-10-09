import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authService } from '../../services/authService';
import { Colors, Fonts, Radii } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'ResetPassword'>>();
  const [token, setToken] = useState(route.params?.token || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!token || password.length < 8 || password !== confirm) { setMessage('Enter the reset code and matching password of at least 8 characters.'); return; }
    setLoading(true);
    try { await authService.confirmPasswordReset(token, password); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }
    catch (error: any) { setMessage(error.message || 'Unable to reset password.'); }
    finally { setLoading(false); }
  };
  return <View style={styles.container}><Header title="Choose Password" leftComponent={<BackButton />} /><View style={styles.content}>
    <TextInput style={styles.input} value={token} onChangeText={setToken} autoCapitalize="none" placeholder="Reset code" />
    <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="New password" />
    <TextInput style={styles.input} value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Confirm password" />
    {!!message && <Text style={styles.message}>{message}</Text>}
    <TouchableOpacity style={styles.button} onPress={submit} disabled={loading}>{loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>RESET PASSWORD</Text>}</TouchableOpacity>
  </View></View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, content: { padding: 24 },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: Radii.input, padding: 14, marginBottom: 16, fontFamily: Fonts.body },
  message: { color: Colors.error, marginBottom: 16, fontFamily: Fonts.body }, button: { backgroundColor: Colors.primary, borderRadius: Radii.button, padding: 16, alignItems: 'center' },
  buttonText: { color: Colors.white, fontFamily: Fonts.bodyBold },
});
