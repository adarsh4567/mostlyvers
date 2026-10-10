import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Book } from '../store/slices/booksSlice';
import { Colors, Fonts, Radii, Shadows } from '../theme';
import { formatPublishDate } from '../utils/dateFormat';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BookCover } from './BookCover';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  showPurchaseStatus?: boolean;
  actionLabel?: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, onPress, showPurchaseStatus, actionLabel }) => {
  const isNew = () => {
    const pubDate = new Date(book.publishedDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return pubDate > thirtyDaysAgo;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Cover */}
      <View style={styles.imageContainer}>
        <BookCover uri={book.coverImage} title={book.title} style={styles.coverImage} />
        {isNew() && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        {/* Author watermark on cover */}
        <View style={styles.coverWatermark}>
          <Text style={styles.coverWatermarkText}>MOSTLYVERS</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topLine}><Text style={styles.title} numberOfLines={2}>{book.title}</Text><View style={styles.dateContainer}><Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} /><Text style={styles.dateText}>{formatPublishDate(book.publishedDate)}</Text></View></View>
        <Text style={styles.description} numberOfLines={2}>{book.description}</Text>
        <View style={styles.tagsContainer}>{book.tags.slice(0, 2).map((tag, index) => <View key={index} style={styles.tagPill}><Text style={styles.tagText}>{tag}</Text></View>)}</View>
        <View style={styles.footerRow}>
          <Text style={styles.price}>{book.localizedPrice || (showPurchaseStatus ? `₹${book.price}` : '—')}</Text>
          {showPurchaseStatus && !actionLabel ? (
            <View style={styles.purchasedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.purchased} />
              <Text style={styles.purchasedText}>PURCHASED</Text>
            </View>
          ) : (
            <TouchableOpacity style={[styles.buyButton, !actionLabel && !book.localizedPrice && { opacity: 0.5 }]} onPress={onPress} disabled={!actionLabel && !book.localizedPrice}>
              <Text style={styles.buyButtonText}>{actionLabel || 'BUY NOW'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: Radii.card,
    marginHorizontal: 14,
    marginBottom: 10,
    ...Shadows.card,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    width: 94,
    height: 138,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: Colors.accent,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  coverWatermark: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(61,26,10,0.6)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  coverWatermarkText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    paddingLeft: 13,
    paddingVertical: 2,
    justifyContent: 'space-between',
  },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  tagPill: {
    backgroundColor: Colors.tagBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    borderWidth: 0,
  },
  tagText: {
    fontSize: 9,
    color: Colors.tagText,
    fontFamily: Fonts.body,
  },
  title: {
    flex: 1,
    fontSize: 21,
    fontFamily: Fonts.display,
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 21,
  },
  description: {
    fontSize: Fonts.smallSize,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 94,
  },
  dateText: {
    fontSize: Fonts.tinySize,
    fontFamily: Fonts.body,
    color: Colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontFamily: Fonts.bodyBlack,
    color: Colors.primary,
  },
  buyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: Radii.button,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  buyButtonText: {
    color: Colors.white,
    fontSize: Fonts.smallSize,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.5,
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.purchasedBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.purchased,
  },
  purchasedText: {
    color: Colors.purchased,
    fontSize: Fonts.tinySize,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.3,
  },
});

export default BookCard;
