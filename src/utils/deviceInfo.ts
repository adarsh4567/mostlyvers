import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { DeviceContext } from '../types/api';
import { getOrCreateInstallationId } from './secureStorage';
import { getPlayIntegrityProof } from '../services/integrityService';

export const getDeviceName = (): string => {
  if (Device.manufacturer && Device.modelName) {
    return `${Device.manufacturer} ${Device.modelName}`;
  }
  return Device.modelName || Device.deviceName || 'Unknown Device';
};

export const getDeviceContext = async (integrityAction = 'GENERAL'): Promise<DeviceContext> => {
  const installationId = await getOrCreateInstallationId();
  const appVersion = Application.nativeApplicationVersion || '0.0.0';
  const packageName = Application.applicationId || 'com.mostlyvers.app';
  return {
    installationId,
    displayName: getDeviceName(),
    platform: 'ANDROID',
    osVersion: String(Platform.Version),
    appVersion,
    packageName,
    ...await getPlayIntegrityProof(integrityAction, installationId, packageName, appVersion),
  };
};
