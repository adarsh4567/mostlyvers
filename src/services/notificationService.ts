import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import api from './api';
import type { NotificationPage } from '../types/api';

Notifications.setNotificationHandler({
	handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: true }),
});

export const notificationService = {
	register: async () => {
		if (!Device.isDevice) return;
		const projectId = (
			process.env.EXPO_PUBLIC_EAS_PROJECT_ID
			|| Constants.easConfig?.projectId
			|| Constants.expoConfig?.extra?.eas?.projectId
		)?.trim();
		if (!projectId || /^0+$/.test(projectId.replace(/-/g, ''))) return;
		if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('default', { name: 'MOSTLYVERS', importance: Notifications.AndroidImportance.DEFAULT });
		let permission = await Notifications.getPermissionsAsync();
		if (permission.status !== 'granted') permission = await Notifications.requestPermissionsAsync();
		if (permission.status !== 'granted') return;
		const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
		await api.post('/me/push-tokens', { token, provider: 'EXPO' });
	},
	list: async (): Promise<NotificationPage> => (await api.get('/me/notifications')).data,
	read: async (id: string): Promise<void> => { await api.post(`/me/notifications/${id}/read`); },
	readAll: async (): Promise<void> => { await api.post('/me/notifications/read-all'); },
};
