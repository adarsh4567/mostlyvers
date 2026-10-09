import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radii } from '../../theme';
import Header from '../../components/Header';
import BookCard from '../../components/BookCard';
import { bookService } from '../../services/bookService';
import { Book, setLibrary } from '../../store/slices/booksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import Ionicons from '@expo/vector-icons/Ionicons';

type LibraryScreenNavigationProp = NativeStackNavigationProp<any, 'BookDetailsScreen'>;

const LibraryScreen = () => {
  const navigation = useNavigation<LibraryScreenNavigationProp>();
  const dispatch = useDispatch();
  const { library, libraryTotal } = useSelector((state: RootState) => state.books);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newestFirst, setNewestFirst] = useState(true);

  const fetchBooks = async (query = '') => {
    try {
      const response = await bookService.getLibrary(query);
      dispatch(setLibrary({ books: response.books, total: response.total }));
    } catch (error) {
      console.error('Error fetching library', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Simple debounce for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchBooks(searchQuery);
    setIsRefreshing(false);
  };

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetailsScreen', { bookId });
  };

  return (
    <View style={styles.container}>
      <Header title="Library" subtitle="Explore all released stories" showLogo showBell />

      <View style={styles.searchRow}>
        <View style={styles.searchContainer}><Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} /><TextInput style={styles.searchInput} placeholder="Search a book..." placeholderTextColor={Colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} /></View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setNewestFirst(value => !value)}><Ionicons name="options-outline" size={18} color={Colors.textPrimary} /><Text style={styles.filterText}>Filter</Text></TouchableOpacity>
      </View>

      <View style={styles.metaContainer}>
        <Text style={styles.sortText}>{newestFirst ? 'Newest to Oldest' : 'Oldest to Newest'}  ↕</Text>
        <Text style={styles.countText}>Total Books: {libraryTotal}</Text>
      </View>

      <FlatList
        data={newestFirst ? library : [...library].reverse()}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => handleBookPress(item._id)}
            showPurchaseStatus={item.ownership === 'OWNED'}
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
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, marginBottom: 10 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    borderRadius: Radii.input,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: Fonts.bodySize,
    fontFamily: Fonts.body,
    color: Colors.textPrimary,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F7F0E8',
    borderRadius: 10,
  },
  countText: {
    fontSize: Fonts.smallSize,
    color: Colors.textPrimary,
    fontFamily: Fonts.bodyBold,
  },
  sortText: {
    fontSize: Fonts.smallSize,
    color: Colors.textPrimary,
    fontFamily: Fonts.bodyBold,
  },
  filterButton: { height: 48, minWidth: 82, borderRadius: Radii.input, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.cardBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  filterText: { fontFamily: Fonts.body, color: Colors.textPrimary, fontSize: 13 },
  listContent: {
    paddingBottom: 110,
  },
});

export default LibraryScreen;
