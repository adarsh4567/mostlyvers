import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { usePreventScreenCapture } from 'expo-screen-capture';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Colors } from '../../theme';
import BackButton from '../../components/BackButton';
import { readingService } from '../../services/readingService';
import { downloadService } from '../../services/downloadService';
import { ReadingLocator, ReadingSession } from '../../types/api';
import { ParsedEpub } from '../../utils/epub';
import { RootState } from '../../store';
import Toast from 'react-native-toast-message';
import { queueProgress } from '../../services/progressQueue';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ParamList = { BookReader: { bookId: string; startPage?: number; offline?: boolean } };
const protectHtml = (html: string) => html.replace(/<head([^>]*)>/i,
  '<head$1><meta name="viewport" content="width=device-width, initial-scale=1"/><style>html,body{user-select:none;-webkit-user-select:none;background:#FAF6F1;color:#1E0A02;line-height:1.65;padding:8px;max-width:100%;overflow-wrap:anywhere}img,svg{max-width:100%;height:auto}</style>');

export default function BookReaderScreen() {
  usePreventScreenCapture();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<ParamList, 'BookReader'>>();
  const { bookId, startPage = 1, offline = false } = route.params;
  const readerId = useSelector((state: RootState) => state.auth.user?.id);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [offlineBook, setOfflineBook] = useState<ParsedEpub | null>(null);
  const [index, setIndex] = useState(Math.max(0, startPage - 1));
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (offline) {
          if (!readerId) throw new Error('Sign in online before opening this download.');
          const parsed = await downloadService.openOffline(bookId, readerId);
          if (active) setOfflineBook(parsed);
        } else {
          const result = await readingService.createSession(bookId);
          if (!active) return;
          setSession(result);
          setVersion(result.progress?.version || 0);
          const savedPage = result.bookmark?.displayedPage || result.progress?.locator.displayedPage;
          if (savedPage && startPage === 1) setIndex(Math.max(0, savedPage - 1));
        }
      } catch (error: any) {
        Toast.show({ type: 'error', text1: 'Unable to open book', text2: error?.message });
        setLoading(false);
      }
    })();
    return () => { active = false; if (progressTimer.current) clearTimeout(progressTimer.current); };
  }, [bookId, offline, readerId, startPage]);

  const total = offlineBook?.resources.length || session?.spine.length || 0;
  const locator = useCallback((): ReadingLocator => ({
    href: offlineBook?.resources[index]?.href || session?.resources.find(r => r.id === session.spine[index])?.href || '',
    progression: total > 1 ? index / (total - 1) : 0,
    displayedPage: index + 1, displayedPageCount: total,
  }), [index, offlineBook, session, total]);

  useEffect(() => {
    if (!offlineBook && !session) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const content = offlineBook ? offlineBook.resources[index]?.html : await readingService.getResource(session!.id, session!.spine[index]);
        if (active) setHtml(protectHtml(content || '<html><head></head><body>Content unavailable.</body></html>'));
        if (!offline && session) {
          if (progressTimer.current) clearTimeout(progressTimer.current);
          progressTimer.current = setTimeout(async () => {
            const currentLocator = locator();
            try { const saved = await readingService.updateProgress(bookId, currentLocator, version); setVersion(saved.version); }
            catch { queueProgress(bookId, currentLocator, version); }
          }, 750);
        }
      } catch (error: any) { Toast.show({ type: 'error', text1: 'Unable to load chapter', text2: error?.message }); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [bookId, index, locator, offline, offlineBook, session]);

  const bookmark = async () => {
    if (offline) { queueProgress(bookId, locator(), version); Toast.show({ type: 'info', text1: 'Saved locally', text2: 'Progress will sync when you are online.' }); return; }
    try { await readingService.setBookmark(bookId, locator()); Toast.show({ type: 'success', text1: 'Bookmarked', text2: `Saved at location ${index + 1}` }); }
    catch (error: any) { Toast.show({ type: 'error', text1: 'Bookmark failed', text2: error?.message }); }
  };

  return <View style={styles.container}>
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}><BackButton /><Text style={styles.headerTitle}>Location {index + 1} of {total || '—'}</Text>
      <TouchableOpacity onPress={bookmark}><Ionicons name="bookmark-outline" size={24} color={Colors.primary} /></TouchableOpacity></View>
    <View style={styles.content}>{loading && <View style={styles.loader}><ActivityIndicator size="large" color={Colors.accent} /></View>}
      <WebView originWhitelist={['about:blank']} source={{ html }} style={[styles.webview, loading && { opacity: 0 }]}
        onShouldStartLoadWithRequest={request => request.url === 'about:blank'} javaScriptEnabled={false} allowsLinkPreview={false}
        showsVerticalScrollIndicator={false} bounces={false} /></View>
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <TouchableOpacity onPress={() => setIndex(value => Math.max(0, value - 1))} disabled={index === 0} style={styles.navButton}>
        <Ionicons name="chevron-back" size={24} color={index === 0 ? Colors.border : Colors.primary} /><Text style={[styles.navText, index === 0 && styles.disabled]}>Prev</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => setIndex(value => Math.min(total - 1, value + 1))} disabled={!total || index >= total - 1} style={styles.navButton}>
        <Text style={[styles.navText, (!total || index >= total - 1) && styles.disabled]}>Next</Text><Ionicons name="chevron-forward" size={24} color={!total || index >= total - 1 ? Colors.border : Colors.primary} /></TouchableOpacity>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary }, content: { flex: 1 },
  loader: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1 }, webview: { flex: 1, backgroundColor: 'transparent' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  navButton: { flexDirection: 'row', alignItems: 'center', padding: 8 }, navText: { fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginHorizontal: 4 }, disabled: { color: Colors.border },
});
