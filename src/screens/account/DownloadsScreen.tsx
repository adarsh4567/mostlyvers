import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { Colors, Fonts, Radii, Shadows } from '../../theme';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { downloadService } from '../../services/downloadService';
import { removeDownload } from '../../store/slices/readingSlice';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const DownloadsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();
  const { downloads } = useSelector((state: RootState) => state.reading);
  const { myBooks } = useSelector((state: RootState) => state.books);
  const readerId = useSelector((state: RootState) => state.auth.user?.id);

  const [downloadedBooks, setDownloadedBooks] = useState<any[]>([]);

  useEffect(() => {
    const loadBooks = async () => {
      const localRecords = downloadService.getLocalDownloads().filter(item => !readerId || item.readerId === readerId);
      let serverBooks = new Map<string, any>();
      try {
        const server = await downloadService.getServerDownloads();
        serverBooks = new Map(server.map(record => [record.book.id, record.book]));
      } catch { /* Local metadata keeps downloads usable while offline. */ }
      const booksWithMeta = await Promise.all(
        localRecords.map(async (record) => {
          const book = myBooks.find(b => b._id === record.bookId);
          const serverBook = serverBooks.get(record.bookId);
          const viewBook = book || (serverBook ? { _id: serverBook.id, title: serverBook.title, coverImage: serverBook.coverUrl } : { _id: record.bookId, title: record.title || 'Downloaded book', coverImage: record.coverUrl });
          return { ...viewBook, size: (record.contentLength / (1024 * 1024)).toFixed(1) + ' MB', downloadedOn: new Date(record.downloadedAt).toLocaleDateString(), leaseExpiresAt: record.leaseExpiresAt };
        })
      );

      setDownloadedBooks(booksWithMeta.filter(Boolean));
    };

    loadBooks();
  }, [downloads, myBooks, readerId]);

  const handleDelete = (bookId: string, title: string) => {
    Alert.alert(
      "Remove Download",
      `Remove '${title}' from offline storage? Deleting a download does not delete your purchase.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await downloadService.deleteDownload(bookId, readerId);
            dispatch(removeDownload(bookId));
          }
        }
      ]
    );
  };

  const handleOpenOffline = (bookId: string) => {
    navigation.navigate('ReadingStack', {
      screen: 'BookReaderScreen',
      params: { bookId, offline: true }
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image source={item.coverImage} style={styles.coverImage} contentFit="cover" />
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.date}>Downloaded on {item.downloadedOn}</Text>
          <Text style={styles.size}>{item.size}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.openBtn}
          onPress={() => handleOpenOffline(item._id)}
        >
          <Text style={styles.openBtnText}>OPEN OFFLINE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item._id, item.title)}
        >
          <Text style={styles.deleteBtnText}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Downloads" leftComponent={<BackButton />} />

      <FlatList
        data={downloadedBooks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-download-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>You haven't downloaded any books yet.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radii.card,
    padding: 12,
    marginBottom: 16,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  coverImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: Fonts.subheadingSize,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  date: {
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  size: {
    fontSize: Fonts.smallSize,
    color: Colors.accent,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  openBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  openBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: 10,
    borderRadius: Radii.button,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
  },
});

export default DownloadsScreen;
