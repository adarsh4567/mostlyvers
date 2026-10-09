import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import { purchaseService } from '../../services/purchaseService';
import { formatMoney, Transaction } from '../../types/api';
import { Colors, Fonts, Radii, Shadows } from '../../theme';

export default function PaymentHistoryScreen() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const load = async () => {
    try { setError(''); setItems((await purchaseService.getTransactions()).items); }
    catch (value: any) { setError(value?.message || 'Unable to load transactions.'); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  return <View style={styles.container}><Header title="Payment History" leftComponent={<BackButton />} />
    {!!error && <Text style={styles.error}>{error}</Text>}
    <FlatList data={items} keyExtractor={item => item.id} refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}
      contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.center}><Ionicons name="receipt-outline" size={48} color={Colors.border} /><Text style={styles.empty}>No payment history found.</Text></View>}
      renderItem={({ item }) => <View style={styles.card}>
        {item.book ? <Image source={item.book.coverUrl} style={styles.cover} contentFit="cover" /> : <View style={styles.icon}><Ionicons name="phone-portrait-outline" size={24} color={Colors.primary} /></View>}
        <View style={styles.info}><Text style={styles.title}>{item.book?.title || 'Device Change'}</Text><Text style={styles.meta}>{item.type.replaceAll('_', ' ')} · {new Date(item.createdAt).toLocaleDateString()}</Text><Text style={styles.reference}>{item.providerTransactionReference || item.id}</Text></View>
        <View style={styles.right}><Text style={styles.amount}>{formatMoney(item.amount)}</Text><Text style={[styles.status, item.status === 'COMPLETED' ? styles.success : styles.warning]}>{item.status}</Text></View>
      </View>} />
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }, list: { padding: 16, paddingBottom: 50 },
  error: { color: Colors.error, textAlign: 'center', padding: 12 }, empty: { color: Colors.textSecondary, marginTop: 12 },
  card: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: Radii.card, padding: 12, marginBottom: 12, ...Shadows.card }, cover: { width: 44, height: 64, borderRadius: 5 },
  icon: { width: 44, height: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.border, borderRadius: 5 }, info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  title: { fontSize: Fonts.bodySize, fontWeight: '700', color: Colors.textPrimary }, meta: { fontSize: Fonts.smallSize, color: Colors.textSecondary, marginTop: 3 }, reference: { fontSize: Fonts.tinySize, color: Colors.textMuted, marginTop: 3 },
  right: { alignItems: 'flex-end', justifyContent: 'center' }, amount: { fontWeight: '700', color: Colors.primary }, status: { fontSize: 10, fontWeight: '700', marginTop: 7 }, success: { color: Colors.success }, warning: { color: Colors.error },
});
