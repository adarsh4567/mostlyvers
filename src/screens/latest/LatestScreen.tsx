import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radii } from '../../theme';
import Header from '../../components/Header';
import BookCard from '../../components/BookCard';
import { bookService } from '../../services/bookService';
import { Book, setLatest } from '../../store/slices/booksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';

type LatestScreenNavigationProp = NativeStackNavigationProp<any>;

const LatestScreen = () => {
  const navigation = useNavigation<LatestScreenNavigationProp>();
  const dispatch = useDispatch();
  const { latest } = useSelector((state: RootState) => state.books);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLatest = async () => {
    try {
      const response = await bookService.getLatest();
      dispatch(setLatest(response));
    } catch (error) {
      console.error('Error fetching latest books', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchLatest();
    setIsRefreshing(false);
  };

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetailsScreen', { bookId });
  };

  if (isLoading && latest.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Latest Releases" subtitle="Fresh stories, newly released" showLogo showBell />

      <FlatList
        data={latest}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={<View style={styles.banner}><View style={styles.bannerIcon}><Ionicons name="calendar-outline" size={24} color={Colors.primary} /></View><Text style={styles.bannerText}>Books stay in Latest Releases for 2 months after publication. After that, they’ll remain in the Library.</Text><Ionicons name="library-outline" size={43} color={Colors.accent} /></View>}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => handleBookPress(item._id)}
            showPurchaseStatus={item.ownership === 'OWNED'}
            actionLabel="VIEW DETAILS"
          />
        )}
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
    paddingTop: 4,
  },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7EEE4', borderRadius: Radii.card, marginHorizontal: 14, marginBottom: 14, padding: 14, gap: 11 },
  bannerIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAD9C7', alignItems: 'center', justifyContent: 'center' },
  bannerText: { flex: 1, color: Colors.textPrimary, fontFamily: Fonts.body, fontSize: 12, lineHeight: 18 },
});

export default LatestScreen;
