import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { api, Transaction } from '../services/api';
import { colors, type, spacing, radius } from '../theme';

// Map categories to emojis for display
const CAT_EMOJIS: Record<string, string> = {
  food: '🍕',
  groceries: '🛒',
  transport: '🚗',
  rent: '🏠',
  emi: '💳',
  subscription: '📱',
  medical: '🏥',
  entertainment: '🎮',
  other: '💸',
};

// Map categories to display labels
const CAT_LABELS: Record<string, string> = {
  food: 'Food',
  groceries: 'Groceries',
  transport: 'Transport',
  rent: 'Rent',
  emi: 'EMI/Loan',
  subscription: 'Subscription',
  medical: 'Medical',
  entertainment: 'Entertainment',
  other: 'Other',
};

export default function TransactionsScreen() {
  const nav = useNavigation<any>();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await api.transactions.getThisMonth();
      setTxns(data);
    } catch (e) {
      console.error("Failed to load transactions", e);
      Alert.alert('Load Error', 'Failed to retrieve transactions. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group transactions by date
  const groupedTxns = txns.reduce((acc, txn) => {
    const dateStr = txn.txn_date.split('T')[0]; // simple YYYY-MM-DD grouping
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(txn);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedTxns).sort((a, b) => b.localeCompare(a));

  function formatDateHeader(dateStr: string) {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'd MMM, yyyy');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name='close' size={24} color={colors.muted} />
        </TouchableOpacity>
        <Text style={type.headline}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
        ) : sortedDates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.muted} />
            <Text style={[type.bodyLg, { color: colors.muted, marginTop: spacing.md }]}>
              No transactions this month.
            </Text>
            <Text style={[type.bodySm, { color: colors.muted, marginTop: 4, textAlign: 'center' }]}>
              Tap the + button on the Home screen to add your first transaction.
            </Text>
          </View>
        ) : (
          sortedDates.map((dateStr) => (
            <View key={dateStr} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{formatDateHeader(dateStr)}</Text>
              
              <View style={styles.card}>
                {groupedTxns[dateStr].map((txn, index, arr) => (
                  <View
                    key={txn.id}
                    style={[
                      styles.txnRow,
                      index === arr.length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <View style={styles.txnLeft}>
                      <View style={styles.iconWrap}>
                        <Text style={{ fontSize: 20 }}>
                          {CAT_EMOJIS[txn.category] || '💸'}
                        </Text>
                      </View>
                      <View>
                        <Text style={[type.bodyLg, { fontFamily: 'Inter_500Medium' }]}>
                          {txn.merchant || CAT_LABELS[txn.category] || 'Transaction'}
                        </Text>
                        <Text style={[type.bodySm, { color: colors.muted }]}>
                          {CAT_LABELS[txn.category] || 'Other'} {txn.note ? `• ${txn.note}` : ''}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        type.currencySm,
                        { color: txn.type === 'credit' ? colors.success : colors.text }
                      ]}
                    >
                      {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(10,10,15,0.70)',
  },
  scroll: {
    padding: spacing.base,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: spacing.xl,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    ...type.label,
    color: colors.muted,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    paddingRight: spacing.base,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.s2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
