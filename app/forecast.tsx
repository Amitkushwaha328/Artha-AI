import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, type } from '../theme';
import { useStore } from '../store/useStore';
import { api, Bill, Profile } from '../services/api';

const { width } = Dimensions.get('window');
const CHART_W = width - (spacing.containerMargin * 2) - (spacing.base * 2);
const CHART_H = 180;

const ICON_MAP: Record<string, string> = {
  rent: 'home-outline',
  emi: 'card-outline',
  subscription: 'play-circle-outline',
  other: 'receipt-outline',
};

export default function ForecastScreen() {
  const nav = useNavigation<any>();
  const { dangerWindow, refreshAll } = useStore();

  const [bills, setBills]       = useState<Bill[]>([]);
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [paidBills, setPaidBills] = useState<string[]>([]);  // bill names paid this month
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const [b, p, paid] = await Promise.all([
        api.bills.getAll(),
        api.profile.get(),
        api.bills.getPaidThisMonth(),
        refreshAll(), // also update store's dangerWindow calculation
      ]);
      setBills(b);
      setProfile(p ?? null);
      setPaidBills(paid);
    } catch (e) {
      console.error('Forecast load error:', e);
      Alert.alert('Load Error', 'Failed to retrieve forecast data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshAll]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Mark a bill as paid: add a debit transaction for it
  async function markBillPaid(bill: Bill) {
    Alert.alert(
      `Mark ${bill.name} as Paid?`,
      `This will record a ₹${bill.amount.toLocaleString('en-IN')} debit transaction for ${bill.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid ✓',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.transactions.add({
                amount: bill.amount,
                type: 'debit',
                category: bill.category,
                merchant: bill.name,
                note: 'Bill payment',
                txn_date: new Date().toISOString(),
                is_recurring: 1,
                member_id: 0,
              });
              await refreshAll();
              await loadData(); // refresh the paid list
            } catch {
              Alert.alert('Error', 'Could not record payment.');
            }
          },
        },
      ]
    );
  }

  // Build expected income row from profile
  const expectedIncomes = profile
    ? [{ name: 'Monthly Income', date: `Day ${profile.salary_day}`, amt: profile.monthly_income }]
    : [];

  const dayOfMonth = new Date().getDate();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>30-Day Forecast</Text>
          <Text style={styles.headerSub}>Your financial weather report</Text>
        </View>
        <TouchableOpacity onPress={() => nav.navigate('Alerts')}>
          <Ionicons name="notifications-outline" size={22} color={colors.muted} />
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
        {/* ── DANGER WINDOW ALERT CARD ── */}
        {dangerWindow?.hasDanger && (
          <View style={styles.dangerCard}>
            <View style={styles.dangerGlowBg} />
            <View style={styles.dangerRow}>
              <View style={styles.dangerIconWrap}>
                <Ionicons name="warning" size={20} color={colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dangerTitle}>
                  🔴 Danger Window: Day {dangerWindow.firstDay ?? 8}
                </Text>
                <Text style={styles.dangerBody}>
                  Balance may hit{' '}
                  <Text style={{ fontFamily: 'JetBrainsMono_500Medium' }}>₹0</Text>
                  {' '}on {dangerWindow.firstDate ?? 'Jun 3rd'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.jugaadBtn}
              onPress={() => nav.navigate('Jugaad')}
              activeOpacity={0.85}
            >
              <Text style={styles.jugaadBtnText}>1-TAP JUGAAD FIX</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── 30-DAY CHART ── */}
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={type.label}>BALANCE TRAJECTORY</Text>
            <View style={styles.stablePill}>
              <Text style={styles.stableText}>
                {dangerWindow?.hasDanger ? 'RISK AHEAD' : 'STABLE'}
              </Text>
            </View>
          </View>
          <View style={styles.chartWrap}>
            <Svg width={CHART_W} height={CHART_H}>
              <Defs>
                <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0"    stopColor={colors.accent} />
                  <Stop offset="0.3"  stopColor={colors.accent} />
                  <Stop offset="0.4"  stopColor={colors.danger} />
                  <Stop offset="0.55" stopColor={colors.danger} />
                  <Stop offset="0.65" stopColor={colors.accent} />
                  <Stop offset="1"    stopColor={colors.accent} />
                </LinearGradient>
              </Defs>
              <Line
                x1={0} y1={CHART_H / 2}
                x2={CHART_W} y2={CHART_H / 2}
                stroke={`${colors.danger}40`}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Path
                d={`M ${CHART_W * 0.3} 0 L ${CHART_W * 0.55} 0 L ${CHART_W * 0.55} ${CHART_H} L ${CHART_W * 0.3} ${CHART_H} Z`}
                fill={`${colors.danger}10`}
              />
              <Path
                d={`M 0 ${CHART_H * 0.33} C ${CHART_W * 0.125} ${CHART_H * 0.33}, ${CHART_W * 0.2} ${CHART_H * 0.66}, ${CHART_W * 0.3} ${CHART_H * 0.78} C ${CHART_W * 0.35} ${CHART_H * 0.83}, ${CHART_W * 0.4} ${CHART_H * 0.89}, ${CHART_W * 0.45} ${CHART_H * 0.78} C ${CHART_W * 0.5} ${CHART_H * 0.66}, ${CHART_W * 0.55} ${CHART_H * 0.44}, ${CHART_W * 0.65} ${CHART_H * 0.33} C ${CHART_W * 0.8} ${CHART_H * 0.17}, ${CHART_W * 0.9} ${CHART_H * 0.22}, ${CHART_W} ${CHART_H * 0.22}`}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <Circle cx={CHART_W * 0.35} cy={CHART_H * 0.8} r={5} fill={colors.bg} stroke={colors.danger} strokeWidth={2} />
            </Svg>
          </View>
          <View style={styles.xAxis}>
            {['Today', 'Day 7', 'Day 15', 'Day 22', 'Day 30'].map((l, i) => (
              <Text key={l} style={[styles.xLabel, i === 1 && { color: colors.danger }]}>{l}</Text>
            ))}
          </View>
        </View>

        {/* ── UPCOMING BILLS (from DB) ── */}
        <Text style={[type.label, styles.sectionLabel]}>UPCOMING BILLS</Text>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
        ) : bills.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[type.bodySm, { color: colors.muted }]}>No recurring bills added yet.</Text>
          </View>
        ) : (
          bills.map((b) => {
            const isPaid = paidBills.includes(b.name.toLowerCase());
            const isOverdue = b.due_day < dayOfMonth && !isPaid;

            return (
              <TouchableOpacity
                key={b.id}
                style={[styles.listItem, isPaid && styles.listItemPaid]}
                onPress={() => !isPaid && markBillPaid(b)}
                activeOpacity={isPaid ? 1 : 0.7}
              >
                <View style={styles.listLeft}>
                  <View style={[styles.listIcon, isPaid && { backgroundColor: `${colors.accent}18` }]}>
                    <Ionicons
                      name={(ICON_MAP[b.category] || 'receipt-outline') as any}
                      size={18}
                      color={isPaid ? colors.accent : colors.muted}
                    />
                  </View>
                  <View>
                    <Text style={[type.bodyLg, isPaid && { color: colors.muted }]}>{b.name}</Text>
                    <Text style={[type.label, { textTransform: 'none', letterSpacing: 0, fontSize: 11 }]}>
                      {isPaid
                        ? '✅ Paid this month'
                        : isOverdue
                        ? `⚠️ Overdue (Due: Day ${b.due_day})`
                        : `Due: Day ${b.due_day}`}
                    </Text>
                  </View>
                </View>
                <View style={styles.billRight}>
                  <Text style={[type.currencySm, { color: isPaid ? colors.muted : colors.danger }]}>
                    -₹{b.amount.toLocaleString('en-IN')}
                  </Text>
                  {!isPaid && (
                    <Text style={styles.tapToPay}>Tap to mark paid</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* ── EXPECTED INCOME (from profile) ── */}
        <Text style={[type.label, styles.sectionLabel]}>EXPECTED INCOME</Text>
        {expectedIncomes.map((inc) => (
          <View key={inc.name} style={[styles.listItem, { borderColor: `${colors.accent}30` }]}>
            <View style={styles.listLeft}>
              <View style={[styles.listIcon, { backgroundColor: `${colors.accent}18`, borderColor: `${colors.accent}30` }]}>
                <Ionicons name="briefcase-outline" size={18} color={colors.accent} />
              </View>
              <View>
                <Text style={type.bodyLg}>{inc.name}</Text>
                <Text style={[type.label, { color: colors.muted, textTransform: 'none', letterSpacing: 0, fontSize: 11 }]}>{inc.date}</Text>
              </View>
            </View>
            <Text style={[type.currencySm, { color: colors.accent }]}>
              +₹{inc.amt.toLocaleString('en-IN')}
            </Text>
          </View>
        ))}

        {/* Add income */}
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={() => nav.navigate('AddTxn')}
        >
          <Ionicons name="add" size={18} color={colors.muted} />
          <Text style={[type.bodySm, { color: colors.muted }]}>Add Expected Income</Text>
        </TouchableOpacity>

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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: 'rgba(10,10,15,0.70)',
  },
  headerLeft: { flex: 1 },
  headerTitle: { ...type.displayMobile },
  headerSub:   { ...type.bodySm, color: colors.muted, marginTop: 2 },

  dangerCard: {
    backgroundColor: `${colors.danger}12`,
    borderWidth: 1, borderColor: `${colors.danger}33`,
    borderRadius: radius.lg, padding: spacing.base + 4,
    marginBottom: spacing.sectionGap, overflow: 'hidden',
  },
  dangerGlowBg: {
    position: 'absolute', top: -40, right: -40,
    width: 120, height: 120,
    backgroundColor: `${colors.danger}25`, borderRadius: 60,
  },
  dangerRow:     { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  dangerIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${colors.danger}18`,
    borderWidth: 1, borderColor: `${colors.danger}30`,
    alignItems: 'center', justifyContent: 'center',
  },
  dangerTitle: { ...type.bodyLg, color: colors.danger, fontFamily: 'Inter_600SemiBold' },
  dangerBody:  { ...type.bodySm, color: colors.text, marginTop: 4 },
  jugaadBtn: {
    backgroundColor: colors.accent, borderRadius: radius.xl,
    paddingVertical: 14, alignItems: 'center',
  },
  jugaadBtnText: { ...type.label, color: '#111', fontSize: 13, letterSpacing: 1 },

  card: {
    backgroundColor: colors.s1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base, marginBottom: spacing.sectionGap,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  stablePill:  { backgroundColor: `${colors.accent}18`, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  stableText:  { ...type.label, color: colors.accent, fontSize: 10 },
  chartWrap:   { borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  xLabel: { ...type.label, color: colors.muted, fontSize: 9, textTransform: 'none', letterSpacing: 0, fontFamily: 'JetBrainsMono_500Medium' },

  sectionLabel: { marginBottom: spacing.md, marginTop: spacing.sm },

  listItem: {
    backgroundColor: `rgba(17,17,24,0.8)`,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: spacing.base,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: spacing.sm,
  },
  listItemPaid: {
    opacity: 0.7,
    borderColor: `${colors.accent}30`,
  },
  listLeft:  { flexDirection: 'row', alignItems: 'center', gap: spacing.base, flex: 1 },
  listIcon:  {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.s2, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  billRight: { alignItems: 'flex-end', gap: 2 },
  tapToPay:  { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.muted },

  emptyBox: {
    backgroundColor: colors.s1, borderRadius: radius.lg,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md,
  },
  addBtn: {
    borderRadius: radius.lg, borderWidth: 1,
    borderStyle: 'dashed', borderColor: colors.border,
    padding: spacing.base, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginBottom: spacing.md,
  },
});
