import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { Colors, Fonts, Radii } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import ErrorMessage from '../../components/ErrorMessage';
import { authService } from '../../services/authService';
import { setApiToken } from '../../services/api';
import { useDispatch } from 'react-redux';
import { setSession } from '../../store/slices/authSlice';
import { RootStackParamList } from '../../navigation/AppNavigator';
import * as ImagePicker from 'expo-image-picker';

type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;
type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const appNavigation = useNavigation<AppNavigationProp>();
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
	const [otp, setOtp] = useState('');
	const [otpChallengeId, setOtpChallengeId] = useState('');
	const [otpHint, setOtpHint] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    const parsedAge = Number(age);
    if (!name || !age || !gender || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120) {
      setError('Please enter a valid age (13–120)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
	  if (!otpChallengeId) {
		const challenge = await authService.requestSignupOTP(email);
		setOtpChallengeId(challenge.challengeId);
		setOtpHint(challenge.developmentCode ? `Development code: ${challenge.developmentCode}` : 'We sent a six-digit code to your email.');
		return;
	  }
	  if (!/^\d{6}$/.test(otp)) { setError('Enter the six-digit verification code.'); return; }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('age', String(parsedAge));
      formData.append('gender', gender);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
	  formData.append('otpChallengeId', otpChallengeId);
	  formData.append('otp', otp);
      if (profilePicture) {
        formData.append('profilePicture', {
          uri: profilePicture.uri,
          name: profilePicture.fileName || 'profile.jpg',
          type: profilePicture.mimeType || 'image/jpeg',
        } as any);
      }

      const session = await authService.signup(formData);
      setApiToken(session.accessToken);
      dispatch(setSession(session));

      appNavigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title="Create Account"
        subtitle="Begin your journey with mostlyvers"
        leftComponent={<BackButton />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.textSecondary}
            value={email}
			onChangeText={value => { setEmail(value); setOtpChallengeId(''); setOtp(''); setOtpHint(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="Enter your age" placeholderTextColor={Colors.textSecondary} />

          <Text style={styles.label}>Gender</Text>
          <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="Enter your gender" placeholderTextColor={Colors.textSecondary} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Enter your phone number" placeholderTextColor={Colors.textSecondary} />

          <TouchableOpacity style={styles.imageButton} onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
            if (!result.canceled) setProfilePicture(result.assets[0]);
          }}>
            <Text style={styles.imageButtonText}>{profilePicture ? 'PROFILE PICTURE SELECTED' : 'ADD PROFILE PICTURE (OPTIONAL)'}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor={Colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

		  {otpChallengeId ? <><Text style={styles.label}>Email Verification Code</Text><TextInput style={styles.input} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder="6-digit code" placeholderTextColor={Colors.textSecondary} /><Text style={styles.otpHint}>{otpHint}</Text></> : null}

          <ErrorMessage message={error} />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
			<Text style={styles.buttonText}>{isLoading ? 'PLEASE WAIT...' : otpChallengeId ? 'VERIFY & CREATE ACCOUNT' : 'SEND EMAIL CODE'}</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: Fonts.bodySize,
    fontFamily: Fonts.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.input,
    padding: 14,
    fontSize: Fonts.bodySize,
    fontFamily: Fonts.body,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  imageButton: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radii.button, padding: 12, alignItems: 'center', marginBottom: 16 },
  imageButtonText: { color: Colors.primary, fontFamily: Fonts.bodyBold, fontSize: Fonts.smallSize },
	otpHint: { color: Colors.textSecondary, fontFamily: Fonts.body, fontSize: Fonts.smallSize, marginTop: -8, marginBottom: 12 },
  buttonText: {
    color: Colors.white,
    fontSize: Fonts.subheadingSize,
    fontFamily: Fonts.bodyBold,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: Fonts.bodySize,
    fontFamily: Fonts.body,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: Fonts.bodySize,
    fontFamily: Fonts.bodyBold,
  },
});

export default SignupScreen;
