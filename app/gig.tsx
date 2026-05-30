import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type } from '../theme';
import { useStore } from '../store/useStore';
import { api, Invoice, Transaction } from '../services/api';
import { format, parseISO } from 'date-fns';

const RING_R = 44;
const RING_C = 2 * Math.PI * RING_R;

const STATUS_COLOR: Record<string, string> = {
  collected: colors.accent,
  pending:   colors.amber,
  overdue:   colors.danger,
};

export default function GigScreen() {
  const nav = useNavigation<any>();
  const { jugaadScore, monthlyIncome } = useStore();

  const [invoices, setInvoices]   = useState<Invoice[]>([]);
  const [expenses, setExpenses]   = useState<Transaction[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const [inv, txns] = await Promise.all([
        api.invoices.getAll(),
        api.transactions.getThisMonth(),
      ]);
      setInvoices(inv);
      // Only show debit (expense) transactions, max 5
      setExpenses(txns.filter(t => t.type === 'debit').slice(0, 5));
    } catch (e) {
      console.error('Gig load error:', e);
      Alert.alert('Load Error', 'Failed to retrieve gig data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Derived stats from invoices
  const totalEarned   = invoices.reduce((s, i) => s + i.amount, 0);
  const totalReceived = invoices.filter(i => i.status === 'collected').reduce((s, i) => s + i.amount, 0);
  const totalPending  = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue  = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  const ringFill = (jugaadScore / 100) * RING_C;

  const CAT_EMOJI: Record<string, string> = {
    food: '🍕', groceries: '🛒', transport: '🚗', rent: '🏠',
    emi: '💳', subscription: '📱', medical: '🏥', entertainment: '🎮', other: '💸',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gig Dashboard</Text>
          <Text style={styles.subtitle}>Your freelance money control center</Text>
        </View>
        <TouchableOpacity onPress={() => nav.navigate('AddTxn')}>
          <View style={styles.addBtn}>
            <Ionicons name="add" size={20} color={colors.accent} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* ── MONTHLY INCOME SUMMARY ── */}
            <View style={styles.card}>
              <Text style={type.label}>TOTAL INVOICED</Text>
              <Text style={[type.currencyHero, { color: colors.accent, marginVertical: spacing.sm }]}>
                ₹{totalEarned.toLocaleString('en-IN')}
              </Text>
              <Text style={[type.bodySm, { color: colors.muted, marginBottom: spacing.md }]}>
                across {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
              </Text>

              {/* Progress bar */}
              {totalEarned > 0 && (
                <>
                  <View style={styles.incomeBarRow}>
                    <Text style={[type.bodySm, { color: colors.text }]}>Received</Text>
                    {totalPending > 0 && <Text style={[type.bodySm, { color: colors.amber }]}>Pending</Text>}
                    {totalOverdue > 0 && <Text style={[type.bodySm, { color: colors.danger }]}>Overdue</Text>}
                  </View>
                  <View style={styles.incomeTrack}>
                    {totalReceived > 0 && <View style={[styles.incomeReceived, { flex: Math.round((totalReceived / totalEarned) * 100) }]} />}
                    {totalPending > 0  && <View style={[styles.incomePending,  { flex: Math.round((totalPending  / totalEarned) * 100) }]} />}
                    {totalOverdue > 0  && <View style={[styles.incomeOverdue,  { flex: Math.round((totalOverdue  / totalEarned) * 100) }]} />}
                  </View>
                  <View style={styles.incomeBarRow}>
                    <Text style={[type.currencySm, { color: colors.accent }]}>₹{totalReceived.toLocaleString('en-IN')}</Text>
                    {totalPending > 0 && <Text style={[type.currencySm, { color: colors.amber }]}>₹{totalPending.toLocaleString('en-IN')}</Text>}
                    {totalOverdue > 0 && <Text style={[type.currencySm, { color: colors.danger }]}>₹{totalOverdue.toLocaleString('en-IN')}</Text>}
                  </View>
                </>
              )}
            </View>

            {/* ── JUGAAD SCORE ── */}
            <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: spacing.lg }]}>
              <View style={styles.ringWrap}>
                <Svg width={100} height={100}>
                  <Circle cx={50} cy={50} r={RING_R} fill="none" stroke={colors.border} strokeWidth={8} />
                  <Circle
                    cx={50} cy={50} r={RING_R}
                    fill="none" stroke={colors.amber} strokeWidth={8}
                    strokeDasharray={`${ringFill} ${RING_C}`}
                    strokeLinecap="round"
                    rotation={-90} originX={50} originY={50}
                  />
                </Svg>
                <View style={styles.ringCenter}>
                  <Text style={[type.currencyLg, { color: colors.amber, fontSize: 20 }]}>{jugaadScore}</Text>
                  <Text style={[type.label, { color: colors.muted, fontSize: 8 }]}>/100</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.label}>YOUR JUGAAD SCORE</Text>
                <Text style={[type.bodyLg, { color: colors.amber, fontFamily: 'Inter_700Bold', marginTop: 4 }]}>
                  Good Resilience
                </Text>
                <Text style={[type.bodySm, { color: colors.muted, marginTop: 4 }]}>
                  3 money hacks available →
                </Text>
                <TouchableOpacity
                  style={styles.jugaadLink}
                  onPress={() => nav.navigate('Jugaad')}
                >
                  <Text style={[type.bodySm, { color: colors.accent }]}>See Jugaad Hacks</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.accent} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── ACTIVE INVOICES (from DB) ── */}
            <Text style={[type.label, styles.sectionLabel]}>ACTIVE INVOICES</Text>

            {invoices.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={[type.bodySm, { color: colors.muted }]}>No invoices yet. Add your first gig!</Text>
              </View>
            ) : (
              invoices.map((inv) => (
                <View key={inv.id} style={styles.clientCard}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.clientInitial}>{inv.client.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.bodyLg, { fontFamily: 'Inter_600SemiBold' }]}>{inv.client}</Text>
                    <Text style={[type.bodySm, { color: colors.muted }]}>{inv.project}</Text>
                    {inv.due_date && (
                      <Text style={[type.label, { fontSize: 10, textTransform: 'none', letterSpacing: 0, marginTop: 2 }]}>
                        Due: {format(parseISO(inv.due_date), 'd MMM')}
                      </Text>
                    )}
                  </View>
                  <View style={styles.right}>
                    <View style={[styles.statusPill, { backgroundColor: `${STATUS_COLOR[inv.status] || colors.muted}20` }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLOR[inv.status] || colors.muted }]}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </Text>
                    </View>
                    <Text style={[type.currencySm, { color: colors.text }]}>
                      ₹{inv.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              ))
            )}

            {/* Add Invoice */}
            <TouchableOpacity
              style={styles.addGigBtn}
              activeOpacity={0.7}
              onPress={() => nav.navigate('AddTxn')}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.muted} />
              <Text style={[type.bodySm, { color: colors.muted }]}>Add New Gig / Invoice</Text>
            </TouchableOpacity>

            {/* ── RECENT EXPENSES (from DB) ── */}
            <View style={styles.expenseHeader}>
              <Text style={type.label}>RECENT EXPENSES</Text>
              <TouchableOpacity onPress={() => nav.navigate('Transactions')}>
                <Text style={[type.bodySm, { color: colors.accent }]}>View All</Text>
              </TouchableOpacity>
            </View>

            {expenses.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={[type.bodySm, { color: colors.muted }]}>No expenses this month yet.</Text>
              </View>
            ) : (
              expenses.map((e) => (
                <View key={e.id} style={styles.expenseRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                    <Text style={{ fontSize: 18 }}>{CAT_EMOJI[e.category] || '💸'}</Text>
                    <View>
                      <Text style={type.bodyLg}>{e.merchant || e.category}</Text>
                      <Text style={[type.bodySm, { color: colors.muted, fontSize: 11 }]}>
                        {format(parseISO(e.txn_date), 'd MMM, hh:mm a')}
                      </Text>
                    </View>
                  </View>
                  <Text style={[type.currencySm, { color: colors.danger }]}>
                    -₹{e.amount.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.md },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: 'rgba(10,10,15,0.70)',
  },
  title:    { ...type.displayMobile },
  subtitle: { ...type.bodySm, color: colors.muted, marginTop: 2 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${colors.accent}20`,
    borderWidth: 1, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },

  card: {
    backgroundColor: colors.s1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base, marginBottom: spacing.md,
  },

  incomeBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  incomeTrack: {
    flexDirection: 'row', height: 8, borderRadius: 4,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm, backgroundColor: colors.s2,
  },
  incomeReceived: { backgroundColor: colors.accent },
  incomePending:  { backgroundColor: colors.amber },
  incomeOverdue:  { backgroundColor: colors.danger },

  ringWrap:   { width: 100, height: 100, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  jugaadLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },

  sectionLabel: { marginBottom: spacing.sm, marginTop: spacing.sm },

  emptyBox: {
    backgroundColor: colors.s1, borderRadius: radius.lg,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md,
  },

  clientCard: {
    backgroundColor: 'rgba(17,17,24,0.8)',
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, marginBottom: spacing.sm,
  },
  clientAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${colors.accent}20`,
    borderWidth: 1, borderColor: `${colors.accent}40`,
    alignItems: 'center', justifyContent: 'center',
  },
  clientInitial: { ...type.bodyLg, color: colors.accent, fontFamily: 'Inter_700Bold' },
  right: { alignItems: 'flex-end', gap: 4 },
  statusPill: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { ...type.label, fontSize: 10, textTransform: 'none', letterSpacing: 0 },

  addGigBtn: {
    borderRadius: radius.lg, borderWidth: 1,
    borderStyle: 'dashed', borderColor: colors.border,
    padding: spacing.base, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginBottom: spacing.md,
  },

  expenseHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  expenseRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
});
