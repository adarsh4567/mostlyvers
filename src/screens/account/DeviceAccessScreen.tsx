import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Colors, Fonts, Radii, Shadows } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { deviceService } from '../../services/deviceService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateDeviceAccess } from '../../store/slices/authSlice';
import { formatMoney, DeviceAccess } from '../../types/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const DeviceAccessScreen = () => {
  const dispatch = useDispatch();
  const [deviceInfo, setDeviceInfo] = useState<DeviceAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const info = await deviceService.getMyDevices();
        setDeviceInfo(info);
        dispatch(updateDeviceAccess(info));
      } catch (error) {
        console.error('Error fetching device data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChangeDevice = () => {
    Alert.alert(
      "Change Authorized Device",
	  'This free-launch transfer will authorize this device and revoke the previous one. Continue?',
      [
        { text: "Cancel", style: "cancel" },
        {
		  text: 'Transfer',
          onPress: async () => {
            setIsChanging(true);
            try {
			  const info = await deviceService.transferFree();

              Toast.show({ type: 'success', text1: 'Success', text2: 'Device changed successfully.' });
              // Refresh info
              setDeviceInfo(info);
              dispatch(updateDeviceAccess(info));
            } catch (error) {
			  Toast.show({ type: 'error', text1: 'Transfer Failed', text2: 'Device change was not completed.' });
            } finally {
              setIsChanging(false);
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Device Access" leftComponent={<BackButton />} />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="hardware-chip" size={32} color={Colors.primary} />
          </View>

          <Text style={styles.label}>Current Authorized Device</Text>
          <Text style={styles.deviceName}>{deviceInfo?.currentDevice?.displayName || 'No device authorized'}</Text>
          <Text style={styles.dateText}>{deviceInfo?.currentDevice ? `Authorized on: ${new Date(deviceInfo.currentDevice.authorizedAt).toLocaleDateString()}` : 'This device has browse-only access'}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{deviceInfo?.changesUsed}</Text>
              <Text style={styles.statLabel}>Changes Used</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{deviceInfo?.changesRemaining}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          {deviceInfo?.transferAllowed ? (
            <TouchableOpacity
              style={[styles.button, isChanging && styles.buttonDisabled]}
              onPress={handleChangeDevice}
              disabled={isChanging}
            >
              {isChanging ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
				<Text style={styles.buttonText}>TRANSFER TO THIS DEVICE</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={20} color={Colors.error} />
              <Text style={styles.warningText}>You have reached the maximum number of device changes allowed.</Text>
            </View>
          )}
        </View>

        <Text style={styles.noteTitle}>Important Information</Text>
        <Text style={styles.noteText}>
          To protect the authors work, MOSTLYVERS restricts account access to one primary device.
		  During free launch, device transfer has no charge and transfers access to all your claimed books.
          You can change your device up to {deviceInfo?.maximumChanges ?? 0} times under the current policy.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radii.card,
    padding: 24,
    alignItems: 'center',
    ...Shadows.card,
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0EBE6',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radii.button,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Fonts.subheadingSize,
    fontWeight: 'bold',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FADBD8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  warningText: {
    color: Colors.error,
    fontSize: Fonts.smallSize,
    marginLeft: 8,
    flex: 1,
  },
  noteTitle: {
    fontSize: Fonts.subheadingSize,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  noteText: {
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});

export default DeviceAccessScreen;
