import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Fonts, Radii } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(String(user?.age || ''));
  const [gender, setGender] = useState(user?.gender || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePictureUrl || '');
  const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
      setSelectedAsset(result.assets[0]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updatedUser = await authService.updateProfile({ name, phone, age: Number(age), gender });
      if (selectedAsset) {
        const formData = new FormData();
        formData.append('profilePicture', {
          uri: selectedAsset.uri, name: selectedAsset.fileName || 'profile.jpg', type: selectedAsset.mimeType || 'image/jpeg',
        } as any);
        updatedUser = await authService.updateProfilePicture(formData);
      }
      dispatch(updateUser(updatedUser));

      Toast.show({ type: 'success', text1: 'Success', text2: 'Profile updated successfully.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" leftComponent={<BackButton />} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage}>
            <View style={styles.avatarContainer}>
              <Image
                source={profilePicture || 'https://ui-avatars.com/api/?name=' + (user?.name || 'U') + '&background=E8DDD0&color=3D1A0A'}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color={Colors.white} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.email}
            editable={false}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Add your phone number"
            placeholderTextColor={Colors.textSecondary}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="number-pad" />

          <Text style={styles.label}>Gender</Text>
          <TextInput style={styles.input} value={gender} onChangeText={setGender} />

          <TouchableOpacity
            style={[styles.button, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>SAVE CHANGES</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  formContainer: {},
  label: {
    fontSize: Fonts.bodySize,
    color: Colors.textPrimary,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.input,
    padding: 14,
    fontSize: Fonts.bodySize,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  disabledInput: {
    backgroundColor: '#F0EBE6',
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radii.button,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Fonts.subheadingSize,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
