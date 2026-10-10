import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootState } from '../../store';
import { clearAuth, updateDeviceAccess } from '../../store/slices/authSlice';
import { readerApi, useGetNotificationsQuery } from '../../store/apiSlice';
import { authService } from '../../services/authService';
import { deviceService } from '../../services/deviceService';
import { purchaseService } from '../../services/purchaseService';
import { navigationRef, setApiToken } from '../../services/api';
import { clearSessionTokens } from '../../utils/secureStorage';
import { formatMoney, Transaction } from '../../types/api';
import { downloadService } from '../../services/downloadService';
import { Colors, Fonts, Radii, Shadows } from '../../theme';
import { BookCover } from '../../components/BookCover';

export default function AccountScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user, accessMode, deviceAccess } = useSelector((state: RootState) => state.auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
	const { data: notifications } = useGetNotificationsQuery();
  const downloads = downloadService.getLocalDownloads().filter(item => !user || item.readerId === user.id);

  useEffect(() => {
    deviceService.getMyDevices().then(value => dispatch(updateDeviceAccess(value))).catch(() => undefined);
    purchaseService.getTransactions().then(value => setTransactions(value.items.slice(0, 2))).catch(() => undefined);
  }, [dispatch]);

  const logout = () => Alert.alert('Log Out', 'Are you sure you want to log out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log Out', style: 'destructive', onPress: async () => {
      try { await authService.logout(); } catch { /* local logout still proceeds */ }
      if (user) await downloadService.lockReaderDownloads(user.id);
      await clearSessionTokens(); setApiToken(null); dispatch(readerApi.util.resetApiState()); dispatch(clearAuth());
      if (navigationRef.isReady()) navigationRef.reset({ index: 0, routes: [{ name: 'Auth', params: { screen: 'LoggedOut' } }] });
    } },
  ]);

  const requestDeletion = () => Alert.alert('Delete Account', 'We will email you a confirmation link. Confirming it signs you out and permanently deletes your personal account data.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Send Link', style: 'destructive', onPress: async () => {
      try { await authService.requestAccountDeletion(); Alert.alert('Check your email', 'If the account is eligible, a confirmation link has been sent.'); }
      catch { Alert.alert('Unable to request deletion', 'Please check your connection and try again.'); }
    } },
  ]);

  return <View style={[styles.container, { paddingTop: insets.top }]}>
	<View style={styles.topBar}><Ionicons name="menu-outline" size={29} color={Colors.textPrimary} /><Text style={styles.heading}>My Account</Text><TouchableOpacity style={styles.bell} onPress={() => navigation.navigate('NotificationsScreen')}><Ionicons name="notifications-outline" size={26} color={Colors.textPrimary} />{!!notifications?.unreadCount && <View style={styles.badge}><Text style={styles.badgeText}>{notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}</Text></View>}</TouchableOpacity></View>
    <Text style={styles.ornament}>──────  ♥  ──────</Text>
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={[styles.panel, styles.profilePanel]}>
        <View><Image source={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Reader')}&background=EBD6BD&color=4A210D`} style={styles.avatar} /><View style={styles.camera}><Ionicons name="camera-outline" size={16} color={Colors.primary} /></View></View>
        <View style={styles.profileInfo}><Text style={styles.name}>{user?.name || 'Reader'}  <Text style={styles.pen}>♢</Text></Text><Meta icon="mail-outline" text={user?.email || '—'} /><Meta icon="call-outline" text={user?.phone || '—'} /><Meta icon="calendar-outline" text={user?.age ? `${user.age} years` : '—'} /><Meta icon="person-outline" text={user?.gender || '—'} /></View>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ProfileScreen')}><Ionicons name="pencil-outline" size={14} color={Colors.primary} /><Text style={styles.editText}>EDIT PROFILE</Text></TouchableOpacity>
      </View>

      <View style={styles.panel}><SectionTitle icon="phone-portrait-outline" title="Device Access" />
        <View style={styles.deviceRow}><View style={styles.deviceCard}><Ionicons name="phone-portrait-outline" size={39} color={Colors.primary} /><View style={{ flex: 1 }}><Text style={styles.smallLabel}>Current Authorized Device</Text><Text style={styles.deviceName}>{deviceAccess?.currentDevice?.displayName || 'No authorized device'}</Text><Text style={styles.muted}>{deviceAccess?.currentDevice ? `Authorized ${new Date(deviceAccess.currentDevice.authorizedAt).toLocaleDateString()}` : 'Browse-only access'}</Text></View></View>
          <View style={styles.transfer}><Text style={styles.transferCopy}>You can change your authorized device up to {deviceAccess?.maximumChanges ?? 0} times.</Text><View style={styles.remaining}><Text style={styles.remainingLabel}>Remaining Device Change Opportunities</Text><Text style={styles.remainingNumber}>{deviceAccess?.changesRemaining ?? 0}</Text></View><TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('DeviceAccessScreen')}><Text style={styles.primaryButtonText}>CHANGE DEVICE</Text></TouchableOpacity></View></View>
		<View style={styles.note}><Ionicons name="information-circle-outline" size={21} color={Colors.primary} /><Text style={styles.noteText}>Device transfer is free during launch. Your claimed books, bookmarks, reading progress and eligible QR access move to the newly authorized device.</Text></View>
      </View>

      <View style={styles.panel}><SectionTitle icon="receipt-outline" title="Payment History" action="View All  ›" onPress={() => navigation.navigate('PaymentHistoryScreen')} />{transactions.length ? transactions.map(item => <TouchableOpacity key={item.id} style={styles.previewRow} onPress={() => navigation.navigate('PaymentHistoryScreen')}>{item.book ? <BookCover uri={item.book.coverUrl} title={item.book.title} style={styles.previewCover} /> : <View style={styles.previewIcon}><Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} /></View>}<View style={styles.previewInfo}><Text style={styles.previewTitle}>{item.book?.title || 'Device Change'}</Text><Text style={styles.muted}>{new Date(item.createdAt).toLocaleDateString()}</Text></View><Text style={styles.amount}>{formatMoney(item.amount)}</Text><View style={styles.paid}><Text style={styles.paidText}>{item.status === 'COMPLETED' ? '✓ PAID ✓' : item.status}</Text></View><Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} /></TouchableOpacity>) : <Text style={styles.empty}>No transactions yet.</Text>}</View>

      <View style={styles.panel}><SectionTitle icon="download-outline" title="Downloads" action="View All  ›" onPress={() => navigation.navigate('DownloadsScreen')} />{downloads[0] ? <View style={styles.previewRow}><BookCover uri={downloads[0].coverUrl} title={downloads[0].title || 'Downloaded book'} style={styles.previewCover} /><View style={styles.previewInfo}><Text style={styles.previewTitle}>{downloads[0].title || 'Downloaded book'}</Text><Text style={styles.muted}>{(downloads[0].contentLength / 1048576).toFixed(1)} MB</Text></View><TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('ReadingStack', { screen: 'BookReaderScreen', params: { bookId: downloads[0].bookId, offline: true } })}><Text style={styles.outlineText}>OPEN OFFLINE</Text></TouchableOpacity></View> : <Text style={styles.empty}>No offline books on this device.</Text>}</View>

	  <View style={styles.panel}><Menu icon="notifications-outline" title="Notifications" subtitle="Updates from MOSTLYVERS" onPress={() => navigation.navigate('NotificationsScreen')} /><Menu icon="information-circle-outline" title="About App" subtitle="Rules, policies and important information" onPress={() => navigation.navigate('AboutAppScreen')} /><Menu icon="mail-outline" title="Contact Us" subtitle="Instagram, YouTube, Email" onPress={() => navigation.navigate('ContactScreen')} /><Menu icon="person-outline" title="About Author" subtitle="Know more about the author" onPress={() => navigation.navigate('AboutAuthorScreen')} last /></View>
      <TouchableOpacity style={styles.deleteAccount} onPress={requestDeletion}><Ionicons name="trash-outline" size={18} color={Colors.error} /><Text style={styles.logoutText}>DELETE ACCOUNT</Text></TouchableOpacity>
      <TouchableOpacity style={styles.logout} onPress={logout}><Ionicons name="power-outline" size={19} color={Colors.error} /><Text style={styles.logoutText}>LOG OUT</Text></TouchableOpacity>
    </ScrollView>
  </View>;
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.metaRow}><Ionicons name={icon} size={15} color={Colors.primary} /><Text style={styles.metaText}>{text}</Text></View>; }
function SectionTitle({ icon, title, action, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; action?: string; onPress?: () => void }) { return <View style={styles.sectionTitleRow}><Ionicons name={icon} size={19} color={Colors.primary} /><Text style={styles.sectionTitle}>{title}</Text>{action && <TouchableOpacity onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></TouchableOpacity>}</View>; }
function Menu({ icon, title, subtitle, onPress, last }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; onPress: () => void; last?: boolean }) { return <TouchableOpacity style={[styles.menu, last && { borderBottomWidth: 0 }]} onPress={onPress}><Ionicons name={icon} size={23} color={Colors.primary} /><View style={{ flex: 1 }}><Text style={styles.menuTitle}>{title}</Text><Text style={styles.menuSubtitle}>{subtitle}</Text></View><Ionicons name="chevron-forward" size={17} color={Colors.textSecondary} /></TouchableOpacity>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 }, heading: { fontFamily: Fonts.display, fontSize: 34, color: Colors.textPrimary }, bell: { position: 'relative' }, badge: { position: 'absolute', top: -6, right: -5, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, badgeText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: 9 }, ornament: { textAlign: 'center', color: Colors.accent, fontFamily: Fonts.body, fontSize: 10, letterSpacing: 2, marginBottom: 10 }, scroll: { paddingHorizontal: 12, paddingBottom: 112 },
  panel: { backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border, borderRadius: Radii.card, padding: 12, marginBottom: 10, ...Shadows.card }, profilePanel: { flexDirection: 'row', alignItems: 'center' }, avatar: { width: 76, height: 76, borderRadius: 38 }, camera: { position: 'absolute', right: -2, bottom: -2, width: 27, height: 27, borderRadius: 14, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }, profileInfo: { flex: 1, marginLeft: 13 }, name: { fontFamily: Fonts.display, fontSize: 23, color: Colors.textPrimary, lineHeight: 25 }, pen: { fontFamily: Fonts.body, fontSize: 13 }, metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 }, metaText: { fontFamily: Fonts.body, fontSize: 10.5, color: Colors.textPrimary }, editButton: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 4, borderWidth: 1, borderColor: Colors.accent, borderRadius: 7, paddingVertical: 6, paddingHorizontal: 8 }, editText: { fontFamily: Fonts.bodyBold, fontSize: 8.5, color: Colors.primary },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }, sectionTitle: { flex: 1, fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.textPrimary }, sectionAction: { fontFamily: Fonts.body, fontSize: 11, color: Colors.primary }, deviceRow: { flexDirection: 'row', gap: 10 }, deviceCard: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F9F2EA', borderRadius: 9, borderWidth: 1, borderColor: Colors.border, padding: 9 }, smallLabel: { fontFamily: Fonts.body, color: Colors.textPrimary, fontSize: 8 }, deviceName: { fontFamily: Fonts.bodyBold, color: Colors.textPrimary, fontSize: 12, marginTop: 2 }, muted: { fontFamily: Fonts.body, color: Colors.textSecondary, fontSize: 8.5, marginTop: 3 }, transfer: { flex: 1.1 }, transferCopy: { fontFamily: Fonts.body, fontSize: 9.5, lineHeight: 13, color: Colors.textPrimary }, remaining: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F2EA', borderWidth: 1, borderColor: Colors.border, borderRadius: 7, padding: 7, marginTop: 6 }, remainingLabel: { flex: 1, fontFamily: Fonts.body, fontSize: 8, lineHeight: 10, color: Colors.textPrimary }, remainingNumber: { fontFamily: Fonts.bodyBlack, fontSize: 23, color: Colors.primary }, primaryButton: { backgroundColor: Colors.primary, borderRadius: 7, padding: 8, alignItems: 'center', marginTop: 6 }, primaryButtonText: { fontFamily: Fonts.bodyBold, fontSize: 9, color: Colors.white }, note: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'flex-start' }, noteText: { flex: 1, fontFamily: Fonts.body, fontSize: 9, lineHeight: 13, color: Colors.textSecondary },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border }, previewCover: { width: 30, height: 43, borderRadius: 3 }, previewIcon: { width: 32, height: 43, borderRadius: 5, backgroundColor: '#F6EDE4', alignItems: 'center', justifyContent: 'center' }, previewInfo: { flex: 1 }, previewTitle: { fontFamily: Fonts.bodyBold, color: Colors.textPrimary, fontSize: 10.5 }, amount: { fontFamily: Fonts.bodyBold, fontSize: 10, color: Colors.textPrimary }, paid: { backgroundColor: Colors.purchasedBg, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 }, paidText: { fontFamily: Fonts.bodyBold, fontSize: 7.5, color: Colors.success }, empty: { fontFamily: Fonts.body, color: Colors.textSecondary, fontSize: 10, paddingVertical: 7 }, outlineButton: { borderWidth: 1, borderColor: Colors.accent, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 7 }, outlineText: { fontFamily: Fonts.bodyBold, fontSize: 7.5, color: Colors.primary },
  menu: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, paddingVertical: 10 }, menuTitle: { fontFamily: Fonts.bodyBold, color: Colors.textPrimary, fontSize: 13 }, menuSubtitle: { fontFamily: Fonts.body, color: Colors.textSecondary, fontSize: 9.5, marginTop: 2 }, deleteAccount: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: Colors.error, borderRadius: Radii.card, backgroundColor: Colors.cardBg, padding: 13, marginBottom: 10 }, logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: Radii.card, backgroundColor: Colors.cardBg, padding: 13 }, logoutText: { fontFamily: Fonts.bodyBold, color: Colors.error, fontSize: 12 },
});
