import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { contentService, HomeContent } from '../../services/contentService';
import { BookSummary } from '../../types/api';
import { Colors, Fonts, Layout, Radii, Shadows } from '../../theme';
import { useGetNotificationsQuery } from '../../store/apiSlice';
import { BookCover } from '../../components/BookCover';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
	const { data: notifications } = useGetNotificationsQuery();
  const load = useCallback(async () => {
    try { setError(''); setData(await contentService.getHome()); }
    catch (value: any) { setError(value?.message || 'Unable to load Home.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  const openTab = (name: string, params?: unknown) => navigation.navigate(name, params);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => openTab('AccountStack')} accessibilityLabel="Open account menu"><Ionicons name="menu-outline" size={30} color={Colors.textPrimary} /></TouchableOpacity>
		<TouchableOpacity style={styles.bell} accessibilityLabel="Notifications" onPress={() => openTab('AccountStack', { screen: 'NotificationsScreen' })}><Ionicons name="notifications-outline" size={27} color={Colors.textPrimary} />{!!notifications?.unreadCount && <View style={styles.notificationBadge}><Text style={styles.notificationText}>{notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}</Text></View>}</TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.accent} />}>
        <View style={styles.brandBlock}>
          <Image source={require('../../assets/mostlyvers-logo.png')} style={styles.logo} contentFit="cover" />
          <Text style={styles.brand}>MOSTLYVERS</Text>
          <Text style={styles.tagline}>Stories Beyond Imagination</Text>
          <Text style={styles.ornament}>──────  ♥  ──────</Text>
        </View>

        {!!error && <TouchableOpacity onPress={load} style={styles.error}><Text style={styles.errorText}>{error} Tap to retry.</Text></TouchableOpacity>}
        {data && <>
          <View style={styles.welcome}>
            <View style={styles.welcomeCopy}><Text style={styles.welcomeTitle}>{data.welcomeMessage || 'Welcome to MOSTLYVERS'}</Text><Text style={styles.body}>{data.thankYouMessage}</Text></View>
            <View style={styles.booksArt}><Ionicons name="book-outline" size={43} color={Colors.accent} /><Ionicons name="leaf-outline" size={38} color={Colors.divider} /></View>
          </View>

          <View style={styles.continueCard}>
            <View style={styles.sectionHeader}><View style={styles.sectionLabel}><Ionicons name="bookmark" size={17} color={Colors.primary} /><Text style={styles.sectionTitle}>Continue Reading</Text></View><TouchableOpacity onPress={() => openTab('ReadingStack')}><Text style={styles.viewAll}>View All  ›</Text></TouchableOpacity></View>
            {data.continueReading ? <ContinueReading item={data.continueReading} onPress={() => openTab('ReadingStack', { screen: 'BookReaderScreen', params: { bookId: data.continueReading!.book.id } })} /> : <Text style={styles.empty}>Your current story will appear here after you begin reading.</Text>}
          </View>

          <View style={styles.grid}>
            <FeatureCard icon="sparkles-outline" title="Latest Release" book={data.latest} action="EXPLORE" onPress={() => openTab('LatestStack')} />
            <FeatureCard icon="hourglass-outline" title="Upcoming Book" book={data.upcoming} action="VIEW" onPress={() => openTab('UpcomingStack')} />
            <FeatureCard icon="library-outline" title="Explore Library" copy="Find your next favourite story." action="BROWSE BOOKS" onPress={() => openTab('LibraryStack')} />
            <FeatureCard icon="musical-notes-outline" title="Songs & QR" copy="Scan, listen and feel the magic of the stories." action="EXPLORE" onPress={() => openTab('QRStack')} />
            <FeatureCard icon="leaf-outline" title="About Author" imageUrl={data.author.photoUrl} copy={data.author.bioSnippet || 'Meet the heart behind the stories.'} action="KNOW MORE" onPress={() => openTab('AccountStack', { screen: 'AboutAuthorScreen' })} />
            <FeatureCard icon="mail-outline" title="Contact" copy="Let’s connect and stay in touch." action="CONNECT" onPress={() => openTab('AccountStack', { screen: 'ContactScreen' })} />
          </View>
        </>}
      </ScrollView>
    </View>
  );
}

function ContinueReading({ item, onPress }: { item: NonNullable<HomeContent['continueReading']>; onPress: () => void }) {
  const percent = Math.max(0, Math.min(100, item.progress.progressPercent));
  return <View style={styles.continueBody}>
    <BookCover uri={item.book.coverUrl} title={item.book.title} style={styles.continueCover} />
    <View style={styles.continueInfo}><Text style={styles.bookTitle} numberOfLines={2}>{item.book.title}</Text><Text style={styles.chapter}>Your saved place</Text><Text style={styles.page}>Page {item.progress.locator.displayedPage || '—'} of {item.progress.locator.displayedPageCount || '—'}</Text><View style={styles.progressRow}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View><Text style={styles.percent}>{Math.round(percent)}%</Text></View></View>
    <TouchableOpacity style={styles.continueButton} onPress={onPress}><Text style={styles.continueButtonText}>CONTINUE</Text></TouchableOpacity>
  </View>;
}

function FeatureCard({ icon, title, book, imageUrl, copy, action, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; book?: BookSummary; imageUrl?: string; copy?: string; action: string; onPress: () => void }) {
  return <TouchableOpacity style={styles.featureCard} onPress={onPress} activeOpacity={0.82}>
    <View style={styles.featureHeading}><Ionicons name={icon} size={20} color={Colors.accent} /><Text style={styles.featureTitle}>{title}</Text></View>
    {book ? <BookCover uri={book.coverUrl} title={book.title} style={styles.featureCover} /> : imageUrl ? <Image source={imageUrl} style={styles.authorPhoto} contentFit="cover" /> : <View style={styles.featureIllustration}><Ionicons name={icon} size={46} color={Colors.accent} /></View>}
    <Text style={styles.featureBookTitle} numberOfLines={2}>{book?.title}</Text>
    <Text style={styles.featureCopy} numberOfLines={3}>{book?.shortDescription || copy}</Text>
    <View style={styles.smallButton}><Text style={styles.smallButtonText}>{action}</Text></View>
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  topBar: { position: 'absolute', zIndex: 2, left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' }, bell: { position: 'relative' }, notificationBadge: { position: 'absolute', right: -5, top: -7, backgroundColor: Colors.accent, width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, notificationText: { fontFamily: Fonts.bodyBold, fontSize: 10, color: Colors.white },
  scroll: { width: '100%', maxWidth: Layout.maxContentWidth, alignSelf: 'center', padding: Layout.screenPadding, paddingBottom: 112 },
  brandBlock: { alignItems: 'center', marginTop: 4, marginBottom: 12 }, logo: { width: 84, height: 84, borderRadius: 42 }, brand: { fontFamily: Fonts.display, fontSize: 36, color: Colors.textPrimary, letterSpacing: 1.7, lineHeight: 40 }, tagline: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textPrimary }, ornament: { fontFamily: Fonts.body, color: Colors.accent, letterSpacing: 2, fontSize: 11, marginTop: 5 },
  error: { backgroundColor: '#FFF0F0', padding: 12, borderRadius: 8, marginBottom: 12 }, errorText: { color: Colors.error, textAlign: 'center', fontFamily: Fonts.body },
  welcome: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 12 }, welcomeCopy: { flex: 1 }, welcomeTitle: { fontFamily: Fonts.display, fontSize: 24, color: Colors.textPrimary, marginBottom: 5 }, body: { fontFamily: Fonts.body, color: Colors.textPrimary, fontSize: 14, lineHeight: 20 }, booksArt: { width: 76, alignItems: 'center', marginLeft: 8 },
  continueCard: { backgroundColor: Colors.cardBg, borderRadius: Radii.card, padding: 13, borderWidth: 1, borderColor: Colors.border, ...Shadows.card }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }, sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 }, sectionTitle: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.textPrimary }, viewAll: { fontFamily: Fonts.body, color: Colors.textPrimary, fontSize: 12 },
  continueBody: { flexDirection: 'row', alignItems: 'center' }, continueCover: { width: 78, height: 112, borderRadius: 7 }, continueInfo: { flex: 1, paddingHorizontal: 12 }, bookTitle: { fontFamily: Fonts.bodyBold, fontSize: 17, color: Colors.textPrimary, lineHeight: 21 }, chapter: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.accent, marginTop: 8 }, page: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textSecondary, marginTop: 3 }, progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 9 }, progressTrack: { height: 5, flex: 1, borderRadius: 3, backgroundColor: Colors.progressBg, overflow: 'hidden' }, progressFill: { height: 5, backgroundColor: Colors.accent, borderRadius: 3 }, percent: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textPrimary, marginLeft: 7 }, continueButton: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 13 }, continueButtonText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: 10 }, empty: { color: Colors.textSecondary, fontFamily: Fonts.body, paddingVertical: 12, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12, gap: 10 }, featureCard: { width: '48.5%', minHeight: 224, backgroundColor: Colors.cardBg, borderRadius: Radii.card, borderWidth: 1, borderColor: Colors.border, padding: 11, alignItems: 'center', ...Shadows.card }, featureHeading: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 7 }, featureTitle: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.textPrimary, flex: 1 }, featureCover: { width: 64, height: 88, borderRadius: 5, marginTop: 10 }, authorPhoto: { width: 68, height: 68, borderRadius: 34, marginTop: 12 }, featureIllustration: { height: 76, alignItems: 'center', justifyContent: 'center' }, featureBookTitle: { fontFamily: Fonts.bodyBold, textAlign: 'center', color: Colors.textPrimary, fontSize: 12, lineHeight: 15, marginTop: 6 }, featureCopy: { fontFamily: Fonts.body, textAlign: 'center', color: Colors.textSecondary, fontSize: 11, lineHeight: 15, marginTop: 4, flexGrow: 1 }, smallButton: { backgroundColor: '#F4E8DA', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 13, marginTop: 9 }, smallButtonText: { color: Colors.textPrimary, fontFamily: Fonts.bodyBold, fontSize: 9 },
});
