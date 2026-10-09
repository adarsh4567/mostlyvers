import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radii } from '../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import Header from '../../components/Header';
import PurchasedBookCard from '../../components/PurchasedBookCard';
import { readingService } from '../../services/readingService';
import { downloadService } from '../../services/downloadService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setMyBooks } from '../../store/slices/booksSlice';
import { setDownloads } from '../../store/slices/readingSlice';

type ReadingScreenNavigationProp = NativeStackNavigationProp<any>;

const ReadingScreen = () => {
  const navigation = useNavigation<ReadingScreenNavigationProp>();
  const dispatch = useDispatch();
  const { myBooks } = useSelector((state: RootState) => state.books);
  const { downloads } = useSelector((state: RootState) => state.reading);
  const { user, accessMode } = useSelector((state: RootState) => state.auth);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReadingData = async () => {
    try {
      const books = await readingService.getMyBooks();
      dispatch(setMyBooks(books));

      const downloadedIds = await downloadService.getMyDownloads();
      dispatch(setDownloads(downloadedIds));
    } catch (error) {
      console.error('Error fetching reading data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadingData();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchReadingData();
    setIsRefreshing(false);
  };

  const handleAction = async (bookId: string, action: string, currentBook: any) => {
    if (accessMode !== 'FULL' && action !== 'MORE') {
      Alert.alert('Device transfer required', 'Transfer your account to this device before reading, downloading, or leaving feedback.');
      return;
    }
    switch (action) {
      case 'START':
        navigation.navigate('ReadingStack', { screen: 'BookReaderScreen', params: { bookId, startPage: 1 } });
        break;
      case 'CONTINUE':
        navigation.navigate('ReadingStack', { screen: 'BookReaderScreen', params: { bookId, startPage: currentBook.bookmark?.page || 1 } });
        break;
      case 'OPEN_OFFLINE':
        navigation.navigate('ReadingStack', { screen: 'BookReaderScreen', params: { bookId, offline: true } });
        break;
      case 'DOWNLOAD':
        if (!user) return;
        try {
          Alert.alert('Download started', 'Keep MOSTLYVERS open while the encrypted book is downloaded.');
          await downloadService.downloadBook(bookId, user.id, { title: currentBook.title, coverUrl: currentBook.coverImage });
          dispatch(setDownloads([...new Set([...downloads, bookId])]));
          Alert.alert('Download complete', 'The encrypted book is ready for offline reading.');
        } catch (error: any) { Alert.alert('Download failed', error?.message || 'Please try again.'); }
        break;
      case 'FEEDBACK':
        navigation.navigate('ReadingStack', { screen: 'FeedbackScreen', params: { bookId } });
        break;
      case 'RESTART':
        navigation.navigate('ReadingStack', { screen: 'BookReaderScreen', params: { bookId, startPage: 1 } });
        break;
    }
  };

  if (isLoading && myBooks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
	  <Header title="Reading" subtitle="Your owned stories" showLogo showBell />

      <FlatList
        data={myBooks}
		ListHeaderComponent={<View style={styles.banner}><View style={styles.bannerIcon}><Ionicons name="bookmark" size={23} color={Colors.primary} /></View><Text style={styles.bannerText}>Here are all the books you own. Continue your journey or start a new adventure.</Text><Ionicons name="cafe-outline" size={39} color={Colors.accent} /></View>}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const hasStarted = item.bookmark !== null && item.bookmark !== undefined;
          const progressPercent = hasStarted && item.totalPages && item.bookmark
            ? (item.bookmark.page / item.totalPages) * 100
            : 0;

          return (
            <PurchasedBookCard
              book={item}
              onAction={(action) => handleAction(item._id, action, item)}
              progressPercent={item.progressPercent ?? progressPercent}
              lastReadDate={item.lastReadAt}
              isDownloaded={downloads.includes(item._id)}
              hasStartedReading={hasStarted}
            />
          );
        }}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    paddingBottom: 110,
  },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7EEE4', borderRadius: Radii.card, marginHorizontal: 14, marginBottom: 14, padding: 13, gap: 10 },
  bannerIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAD9C7', alignItems: 'center', justifyContent: 'center' },
  bannerText: { flex: 1, color: Colors.textPrimary, fontFamily: Fonts.body, fontSize: 12, lineHeight: 17 },
});

export default ReadingScreen;
