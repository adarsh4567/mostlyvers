import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import { PurchasedBook } from '../store/slices/booksSlice';
import { Colors, Fonts, Radii, Shadows } from '../theme';

interface Props {
  book: PurchasedBook;
  onAction: (action: string) => void;
  progressPercent: number;
  lastReadDate?: string;
  isDownloaded: boolean;
  hasStartedReading: boolean;
}

export default function PurchasedBookCard({ book, onAction, progressPercent, lastReadDate, isDownloaded, hasStartedReading }: Props) {
  const page = book.bookmark?.page;
  return <View style={styles.card}>
    <Image source={book.coverImage} style={styles.cover} contentFit="cover" />
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={3}>{book.title}</Text>
      {hasStartedReading ? <><Text style={styles.chapter}>Continue your story</Text><View style={styles.pageRow}><Ionicons name="bookmark" size={14} color={Colors.primary} /><Text style={styles.page}>Page {page || '—'}{book.totalPages ? ` of ${book.totalPages}` : ''}</Text></View></> : <Text style={styles.notStarted}>You haven’t started reading yet.</Text>}
      <View style={styles.progressRow}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, progressPercent))}%` }]} /></View><Text style={styles.percent}>{Math.round(progressPercent)}%</Text></View>
      {!!lastReadDate && <View style={styles.lastReadPill}><Ionicons name="bookmark" size={11} color={Colors.accent} /><Text style={styles.lastRead}>Last read {formatDistanceToNow(new Date(lastReadDate))} ago</Text></View>}
    </View>
    <View style={styles.actions}>
      <TouchableOpacity style={styles.primary} onPress={() => onAction(hasStartedReading ? 'CONTINUE' : 'START')}><Ionicons name={hasStartedReading ? 'bookmark-outline' : 'book-outline'} size={17} color={Colors.white} /><Text style={styles.primaryText}>{hasStartedReading ? 'CONTINUE WITH BOOKMARK' : 'READ NOW'}</Text></TouchableOpacity>
      {hasStartedReading && <Action icon="refresh-outline" text="RESTART" onPress={() => onAction('RESTART')} />}
      <Action icon={isDownloaded ? 'checkmark-circle-outline' : 'download-outline'} text={isDownloaded ? 'OPEN OFFLINE' : 'DOWNLOAD FOR OFFLINE'} onPress={() => onAction(isDownloaded ? 'OPEN_OFFLINE' : 'DOWNLOAD')} />
      <Action icon="chatbubble-ellipses-outline" text="FEEDBACK" subtle onPress={() => onAction('FEEDBACK')} />
    </View>
  </View>;
}

function Action({ icon, text, subtle, onPress }: { icon: keyof typeof Ionicons.glyphMap; text: string; subtle?: boolean; onPress: () => void }) {
  return <TouchableOpacity style={[styles.action, subtle && styles.actionSubtle]} onPress={onPress}><Ionicons name={icon} size={17} color={Colors.primary} /><Text style={styles.actionText}>{text}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: Radii.card, marginHorizontal: 12, marginBottom: 11, padding: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  cover: { width: 82, height: 124, borderRadius: 7, alignSelf: 'center' }, info: { flex: 1, minWidth: 0, paddingHorizontal: 10, paddingVertical: 2 },
  title: { fontFamily: Fonts.display, fontSize: 21, lineHeight: 21, color: Colors.textPrimary }, chapter: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.accent, marginTop: 7 }, pageRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }, page: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textSecondary }, notStarted: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textSecondary, marginTop: 17, lineHeight: 15 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 9 }, progressTrack: { height: 4, flex: 1, borderRadius: 3, backgroundColor: Colors.progressBg, overflow: 'hidden' }, progressFill: { height: 4, backgroundColor: Colors.accent }, percent: { fontFamily: Fonts.body, fontSize: 10, marginLeft: 5, color: Colors.textPrimary },
  lastReadPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F7EEE4', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 6, marginTop: 9 }, lastRead: { flex: 1, fontFamily: Fonts.body, fontSize: 8.5, color: Colors.textSecondary },
  actions: { width: 128, justifyContent: 'center', gap: 5 }, primary: { minHeight: 41, paddingHorizontal: 7, borderRadius: 9, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, primaryText: { color: Colors.white, fontFamily: Fonts.bodyBold, fontSize: 8.5, lineHeight: 11, textAlign: 'center', flexShrink: 1 }, action: { minHeight: 34, borderWidth: 1, borderColor: Colors.primary, borderRadius: 9, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, actionSubtle: { borderWidth: 0, backgroundColor: '#F5EBE1' }, actionText: { fontFamily: Fonts.body, fontSize: 8.5, lineHeight: 11, color: Colors.textPrimary, textAlign: 'center', flexShrink: 1 },
});
