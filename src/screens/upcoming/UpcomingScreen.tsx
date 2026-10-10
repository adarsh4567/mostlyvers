import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import Header from '../../components/Header';
import { Colors, Fonts, Radii, Shadows } from '../../theme';
import { bookService } from '../../services/bookService';
import { purchaseService } from '../../services/purchaseService';
import { setUpcoming } from '../../store/slices/booksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { formatPublishDate } from '../../utils/dateFormat';
import { BookCover } from '../../components/BookCover';

export default function UpcomingScreen() {
  const dispatch = useDispatch();
  const { upcoming } = useSelector((state: RootState) => state.books);
	const { accessMode } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [prebookingId, setPrebookingId] = useState<string | null>(null);

  const fetchUpcoming = async () => {
    try { dispatch(setUpcoming(await bookService.getUpcoming())); }
    catch (error) { console.error('Error fetching upcoming books', error); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { fetchUpcoming(); }, []);

  const handlePrebook = async (book: any) => {
    try {
      setPrebookingId(book._id);
	  if (accessMode !== 'FULL') throw new Error('Transfer this account to this device before pre-booking.');
	  await purchaseService.prebookFree(book._id);
      await fetchUpcoming();
      Toast.show({ type: 'success', text1: 'Pre-book Successful!', text2: `You will be notified when ${book.title} releases.` });
    } catch (error: any) { Toast.show({ type: 'error', text1: 'Pre-book Failed', text2: error?.message || 'Please try again' }); }
    finally { setPrebookingId(null); }
  };

  if (isLoading && upcoming.length === 0) return <View style={styles.loading}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  const discount = upcoming[0]?.discountPercent || 15;

  return <View style={styles.container}>
    <Header title="Upcoming Books" subtitle="Stories coming soon to MOSTLYVERS" showLogo showBell />
    <FlatList
      data={upcoming}
      keyExtractor={item => item._id}
      refreshing={isRefreshing}
      onRefresh={async () => { setIsRefreshing(true); await fetchUpcoming(); setIsRefreshing(false); }}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<View style={styles.banner}><View style={styles.bannerIcon}><Ionicons name="hourglass-outline" size={26} color={Colors.primary} /></View><View style={{ flex: 1 }}><Text style={styles.bannerTitle}>Exciting stories are on their way!</Text><Text style={styles.bannerCopy}>Pre-book your favourite upcoming books and get {discount}% OFF on the release price.</Text></View><Ionicons name="library-outline" size={43} color={Colors.accent} /></View>}
      renderItem={({ item }) => {
        const booked = item.ownership === 'PREBOOKED' || item.ownership === 'OWNED';
        return <View style={styles.card}>
          <BookCover uri={item.coverImage} title={item.title} style={styles.cover} />
          <View style={styles.info}><Text style={styles.title} numberOfLines={2}>{item.title}</Text><Text style={styles.sparkle}>──── ✧</Text><Text style={styles.description} numberOfLines={3}>{item.description}</Text><View style={styles.tags}>{item.tags.slice(0, 2).map((tag: string) => <View style={styles.tag} key={tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View><View style={styles.release}><Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} /><Text style={styles.releaseText}>Expected Release: <Text style={{ color: Colors.prebookBtn }}>{formatPublishDate(item.publishedDate)}</Text></Text></View></View>
		  <View style={styles.priceColumn}><View style={styles.badge}><Text style={styles.badgeText}>FREE LAUNCH PRE-BOOK</Text></View><Text style={styles.priceLabel}>Price</Text><Text style={styles.releasePrice}>FREE</Text><View style={styles.dash} /><Text style={styles.priceLabel}>Pre-book today</Text><Text style={styles.prebookPrice}>FREE</Text><View style={styles.actionRow}><TouchableOpacity style={[styles.prebookButton, booked && styles.booked]} onPress={() => handlePrebook(item)} disabled={booked || prebookingId === item._id}>{prebookingId === item._id ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.buttonText}>{booked ? 'PRE-BOOKED ✓' : 'PRE-BOOK FREE'}</Text>}</TouchableOpacity><View style={styles.bookmark}><Ionicons name="bookmark-outline" size={19} color={Colors.prebookBtn} /></View></View></View>
        </View>;
      }}
    />
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, loading: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }, list: { paddingBottom: 112 },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7EEE4', borderRadius: Radii.card, marginHorizontal: 14, marginBottom: 14, padding: 13, gap: 10 }, bannerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.cardBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.divider }, bannerTitle: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.textPrimary }, bannerCopy: { fontFamily: Fonts.body, fontSize: 11, lineHeight: 16, color: Colors.textPrimary, marginTop: 3 },
  card: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: Radii.card, borderWidth: 1, borderColor: Colors.border, marginHorizontal: 12, marginBottom: 11, padding: 10, ...Shadows.card }, cover: { width: 82, height: 125, borderRadius: 7, alignSelf: 'center' }, info: { flex: 1, minWidth: 0, paddingLeft: 11, paddingRight: 7 }, title: { fontFamily: Fonts.display, color: Colors.textPrimary, fontSize: 20, lineHeight: 20 }, sparkle: { fontFamily: Fonts.body, fontSize: 8, color: Colors.accent, marginVertical: 2 }, description: { fontFamily: Fonts.body, color: Colors.textPrimary, fontSize: 10, lineHeight: 14 }, tags: { flexDirection: 'row', gap: 5, marginTop: 6 }, tag: { backgroundColor: '#F5EBE1', borderRadius: 12, paddingHorizontal: 7, paddingVertical: 3 }, tagText: { fontFamily: Fonts.body, color: Colors.textPrimary, fontSize: 8 }, release: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 }, releaseText: { fontFamily: Fonts.body, fontSize: 8.5, color: Colors.textSecondary },
  priceColumn: { width: 115, alignItems: 'center' }, badge: { backgroundColor: Colors.prebook, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4, alignSelf: 'stretch' }, badgeText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: 7.5, textAlign: 'center' }, priceLabel: { fontFamily: Fonts.body, color: Colors.textPrimary, fontSize: 8.5, marginTop: 5 }, releasePrice: { fontFamily: Fonts.bodyBlack, color: Colors.textPrimary, fontSize: 18 }, dash: { width: '90%', borderBottomWidth: 1, borderStyle: 'dashed', borderColor: Colors.border, marginVertical: 2 }, prebookPrice: { fontFamily: Fonts.bodyBlack, color: Colors.prebookBtn, fontSize: 18 }, actionRow: { flexDirection: 'row', gap: 4, marginTop: 5 }, prebookButton: { flex: 1, minHeight: 31, backgroundColor: Colors.prebookBtn, borderRadius: 7, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }, booked: { backgroundColor: Colors.success }, buttonText: { fontFamily: Fonts.bodyBold, fontSize: 7.5, color: Colors.white }, bookmark: { width: 29, height: 31, borderRadius: 7, borderWidth: 1, borderColor: Colors.prebookBtn, alignItems: 'center', justifyContent: 'center' },
});
