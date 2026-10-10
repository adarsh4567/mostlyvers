import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import Header from '../../components/Header';
import { contentService } from '../../services/contentService';
import { YoutubeAsset } from '../../types/api';
import { Colors, Fonts, Radii, Shadows } from '../../theme';
import { getSafeYoutubeUrl } from '../../utils/links';
import { BookCover } from '../../components/BookCover';

export default function QRScreen() {
  const [items, setItems] = useState<YoutubeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setError(''); setItems(await contentService.getQRCodes()); }
    catch (value: any) { setError(value?.message || 'Unable to load YouTube songs.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  return <View style={styles.container}>
    <Header title="QR – YouTube Songs" subtitle="Scan & Enjoy Exclusive Book Songs" showLogo showBell />
    {!!error && <TouchableOpacity onPress={load} style={styles.error}><Text style={styles.errorText}>{error} Tap to retry.</Text></TouchableOpacity>}
    <FlatList
      data={items}
      keyExtractor={item => item.bookId}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.accent} />}
      contentContainerStyle={styles.list}
	  ListHeaderComponent={<><View style={styles.banner}><View style={styles.youtubeIcon}><Ionicons name="logo-youtube" size={25} color={Colors.white} /></View><Text style={styles.bannerText}>Listen to the official theme songs for books you own on YouTube.</Text><Ionicons name="headset-outline" size={43} color={Colors.accent} /></View><View style={styles.sectionHeading}><Ionicons name="musical-notes-outline" size={22} color={Colors.primary} /><Text style={styles.sectionTitle}>Your Book Songs (YouTube QR)</Text><View style={styles.headingLine} /></View></>}
      ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>No YouTube songs are available yet.</Text></View>}
      renderItem={({ item }) => <SongCard item={item} />}
    />
  </View>;
}

function SongCard({ item }: { item: YoutubeAsset }) {
  const url = item.unlocked ? getSafeYoutubeUrl(item.youtubeUrl || item.qrPayload) : null;
  return <View style={styles.card}>
	<View style={[styles.status, item.unlocked ? styles.purchased : styles.upcoming]}><Text style={styles.statusText}>{item.unlocked ? 'Owned ✓' : 'Locked'}</Text></View>
    <BookCover uri={item.coverUrl} title={item.title} style={styles.cover} />
    <View style={styles.info}><Text style={styles.title} numberOfLines={3}>{item.title}</Text><Text style={styles.author}>SIDDHI</Text><Text style={styles.miniOrnament}>────  ♫  ────</Text><Text style={styles.songCopy} numberOfLines={4}>{item.songName}</Text><View style={styles.themePill}><Ionicons name="musical-notes" size={13} color={Colors.primary} /><Text style={styles.themeText}>Book Song / Theme</Text></View></View>
    {url ? <View style={styles.qrPanel}><Text style={styles.watchTitle}>♫  Watch on YouTube</Text><View style={styles.qr}><QRCode value={url} size={76} color="#111" backgroundColor={Colors.white} /></View><TouchableOpacity style={styles.watchButton} onPress={() => Linking.openURL(url)}><Ionicons name="play" size={16} color={Colors.white} /><Text style={styles.watchButtonText}>WATCH ON YOUTUBE</Text></TouchableOpacity></View>
      : <View style={styles.locked}><Text style={styles.watchTitle}>♫  Watch on YouTube</Text><Ionicons name="lock-closed" size={34} color={Colors.primary} /><Text style={styles.lockedTitle}>QR Locked</Text><Text style={styles.lockedCopy}>Purchase this book to access its song QR.</Text></View>}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, padding: 24 }, list: { paddingHorizontal: 12, paddingBottom: 112 },
  error: { backgroundColor: '#FFF0F0', margin: 12, padding: 12, borderRadius: 8 }, errorText: { color: Colors.error, textAlign: 'center', fontFamily: Fonts.body }, empty: { color: Colors.textSecondary, fontFamily: Fonts.body },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7EEE4', borderRadius: Radii.card, marginBottom: 14, padding: 13, gap: 11 }, youtubeIcon: { width: 43, height: 37, borderRadius: 8, backgroundColor: '#A95532', alignItems: 'center', justifyContent: 'center' }, bannerText: { flex: 1, fontFamily: Fonts.body, fontSize: 12, lineHeight: 17, color: Colors.textPrimary },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingHorizontal: 4 }, sectionTitle: { fontFamily: Fonts.display, color: Colors.textPrimary, fontSize: 19 }, headingLine: { flex: 1, height: 1, backgroundColor: Colors.accent },
  card: { minHeight: 170, flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: Radii.card, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: Colors.accent, ...Shadows.card }, status: { position: 'absolute', right: 8, top: -1, zIndex: 2, borderBottomLeftRadius: 9, borderBottomRightRadius: 9, paddingHorizontal: 9, paddingVertical: 3 }, purchased: { backgroundColor: '#19763C' }, upcoming: { backgroundColor: '#E9B986' }, statusText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: 8.5 }, cover: { width: 91, height: 143, borderRadius: 8, alignSelf: 'center' }, info: { flex: 1, minWidth: 0, paddingHorizontal: 10, paddingTop: 6 }, title: { fontFamily: Fonts.display, fontSize: 20, lineHeight: 20, color: Colors.textPrimary }, author: { fontFamily: Fonts.bodyBold, color: Colors.primary, fontSize: 10, marginTop: 5 }, miniOrnament: { fontFamily: Fonts.body, color: Colors.accent, fontSize: 8, marginVertical: 4 }, songCopy: { fontFamily: Fonts.displayMedium, color: Colors.textPrimary, fontSize: 13, lineHeight: 15 }, themePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F6E9D8', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4, marginTop: 7, alignSelf: 'flex-start' }, themeText: { fontFamily: Fonts.bodyBold, fontSize: 8, color: Colors.textPrimary },
  qrPanel: { width: 132, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7E6', borderRadius: 12, padding: 7, marginTop: 14 }, watchTitle: { fontFamily: Fonts.displayMedium, fontSize: 12, color: Colors.textPrimary, textAlign: 'center', marginBottom: 5 }, qr: { padding: 5, backgroundColor: Colors.white, borderRadius: 7, borderWidth: 1, borderColor: Colors.accentLight }, watchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 7, marginTop: 7, alignSelf: 'stretch' }, watchButtonText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: 7.5, textAlign: 'center' }, locked: { width: 132, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFE7DE', borderRadius: 12, padding: 9, marginTop: 14 }, lockedTitle: { fontFamily: Fonts.display, color: Colors.textPrimary, fontSize: 17, marginTop: 4 }, lockedCopy: { fontFamily: Fonts.body, fontSize: 9, color: Colors.textSecondary, textAlign: 'center', lineHeight: 12, marginTop: 3 },
});
