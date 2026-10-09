import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Fonts, Radii } from '../../theme';
import BackButton from '../../components/BackButton';
import { bookService } from '../../services/bookService';
import { purchaseService } from '../../services/purchaseService';
import { Book } from '../../store/slices/booksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { formatPublishDate } from '../../utils/dateFormat';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

type ParamList = {
  BookDetails: { bookId: string };
};

const BookDetailsScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'BookDetails'>>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const dispatch = useDispatch();

  const { bookId } = route.params;
	const { accessMode } = useSelector((state: RootState) => state.auth);

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const isPurchased = book?.ownership === 'OWNED';

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await bookService.getBookDetails(bookId);
        setBook(data);
      } catch (error) {
        console.error('Error fetching book details', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const handlePurchase = async () => {
    if (!book) return;
    try {
      setIsPurchasing(true);
	  if (accessMode !== 'FULL') throw new Error('Transfer this account to the current device before claiming books.');
	  await purchaseService.claimBook(bookId);
      setBook(await bookService.getBookDetails(bookId));

      Toast.show({
        type: 'success',
		text1: 'Book Claimed!',
        text2: `You can now read ${book.title}`,
      });

    } catch (error: any) {
      Toast.show({
        type: 'error',
		text1: 'Claim Failed',
        text2: error?.message || 'Please try again',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Book not found.</Text>
        <BackButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerAbsolute}>
          <View style={styles.backButtonBg}>
             <BackButton color={Colors.white} />
          </View>
        </View>

        <Image source={book.coverImage} style={styles.coverImage} contentFit="cover" />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>By Siddhi</Text>

          <View style={styles.tagsContainer}>
            {book.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{formatPublishDate(book.publishedDate)}</Text>
          </View>

		  <Text style={styles.price}>{isPurchased ? 'Owned' : 'Free during launch'}</Text>

          <View style={styles.divider} />

          <Text style={styles.descriptionHeader}>Synopsis</Text>
          <Text style={styles.description}>{book.description}</Text>

          {isPurchased && book.youtubeUrl && (
            <View style={styles.qrBanner}>
              <Ionicons name="musical-notes" size={24} color={Colors.accent} />
              <Text style={styles.qrBannerText}>This book has an associated song!</Text>
            </View>
          )}

        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {isPurchased ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.purchasedButton]}
            onPress={() => navigation.navigate('ReadingStack', { screen: 'ReadingScreen' })}
          >
            <Text style={styles.purchasedButtonText}>PURCHASED ✓</Text>
            <Text style={styles.purchasedSubText}>GO TO READING</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.buyButton]}
            onPress={handlePurchase}
			disabled={isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
			  <Text style={styles.buyButtonText}>CLAIM FREE</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
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
  scrollContent: {
    paddingBottom: 100, // space for bottom bar
  },
  headerAbsolute: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
  },
  backButtonBg: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: 350,
  },
  contentContainer: {
    padding: 24,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  title: {
    fontSize: Fonts.headingSize,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  author: {
    fontSize: Fonts.subheadingSize,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    color: Colors.textSecondary,
    fontSize: Fonts.smallSize,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: Fonts.bodySize,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  descriptionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  qrBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    padding: 16,
    borderRadius: Radii.card,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.accent,
    gap: 12,
  },
  qrBannerText: {
    color: Colors.primary,
    fontWeight: 'bold',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: Radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButton: {
    backgroundColor: Colors.accent,
  },
  buyButtonText: {
    color: Colors.white,
    fontSize: Fonts.subheadingSize,
    fontWeight: 'bold',
  },
  purchasedButton: {
    backgroundColor: Colors.purchasedBg,
    borderWidth: 1,
    borderColor: Colors.purchased,
  },
  purchasedButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchasedSubText: {
    color: Colors.primary,
    fontSize: 10,
    marginTop: 2,
  },
});

export default BookDetailsScreen;
