import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, Image,
  Animated, PanResponder, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, type } from '../theme';
import { useStore } from '../store/useStore';
import { api } from '../services/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COACH_BUTTON_SIZE = 46;

export default function HomeScreen() {
  const nav = useNavigation<any>();

  // ── Dynamic greeting based on time of day ──
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 200 })).current;
  const offset = useRef({ x: 0, y: 200 });

  useEffect(() => {
    const listener = pan.addListener((value) => {
      offset.current = { x: value.x, y: value.y };
    });
    return () => {
      pan.removeListener(listener);
    };
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: offset.current.x,
          y: offset.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (e, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();

        const currentX = offset.current.x + gestureState.dx;
        const currentY = offset.current.y + gestureState.dy;

        // Snap to nearest side edge
        const snapX = currentX < (SCREEN_WIDTH - COACH_BUTTON_SIZE) / 2
          ? 0
          : SCREEN_WIDTH - COACH_BUTTON_SIZE;

        const snapY = Math.min(
          Math.max(100, currentY),
          SCREEN_HEIGHT - 150
        );

        offset.current = { x: snapX, y: snapY };

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        Animated.parallel([
          Animated.spring(pan.x, {
            toValue: snapX,
            useNativeDriver: false,
            friction: 5,
            tension: 40,
          }),
          Animated.spring(pan.y, {
            toValue: snapY,
            useNativeDriver: false,
            friction: 5,
            tension: 40,
          }),
        ]).start();

        // Handle tap vs drag
        const dragDistance = Math.sqrt(
          gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy
        );
        if (dragDistance < 8) {
          nav.navigate('Coach');
        }
      },
    })
  ).current;
  const { safeToSpend, balance, monthlyIncome, dangerWindow, doomActive, profile, sts, isLoading, refreshAll } = useStore();

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll])
  );

  const billsReserved = sts?.reservedForBills ?? 0;
  const spentThisMonth = sts?.spentSoFar ?? 0;

  const budgetUsedPct = monthlyIncome > 0
    ? Math.min(100, Math.round(((monthlyIncome - (balance ?? 0)) / monthlyIncome) * 100))
    : 72;

  const safeAmt = safeToSpend ?? 12400;
  const balAmt  = balance   ?? 35430;

  const QuickAction = useCallback(
    ({ icon, label, color, route }: { icon: any; label: string; color: string; route: string }) => (
      <TouchableOpacity style={styles.quickBtn} onPress={() => nav.navigate(route)} activeOpacity={0.7}>
        <View style={[styles.quickIconWrap, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.quickLabel}>{label}</Text>
      </TouchableOpacity>
    ),
    [nav],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image
            source={require('../assets/logo_inside_round.png')}
            style={{ width: 34, height: 34, borderRadius: 17 }}
            resizeMode="cover"
          />
          <View>
            <Text style={styles.greeting}>
            {getGreeting()}, {profile?.name || 'there'} 👋
          </Text>
            <Text style={styles.subtitle}>Artha · अर्थ · Your safety net</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.bellWrap} onPress={() => nav.navigate('Alerts')}>
            <Ionicons name="notifications-outline" size={22} color={colors.muted} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => nav.navigate('Settings')}
          >
            <Text style={styles.avatarText}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshAll}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* ── HERO CARD — Safe to Spend ── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>SAFE TO SPEND TODAY</Text>
          <Text style={styles.heroAmount}>
            ₹{safeAmt.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.heroSub}>
            of ₹{balAmt.toLocaleString('en-IN')} available balance
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${budgetUsedPct}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>
            {budgetUsedPct}% of monthly budget used
          </Text>
        </View>

        {/* ── DANGER WINDOW BANNER ── */}
        {dangerWindow && (
          <TouchableOpacity style={styles.dangerBanner} onPress={() => nav.navigate('Forecast')} activeOpacity={0.8}>
            <Text style={styles.dangerIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dangerTitle}>Danger Window in {dangerWindow.firstDay ?? 8} days</Text>
              <Text style={styles.dangerSub}>Tap to see your forecast and fix →</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.amber} />
          </TouchableOpacity>
        )}

        {/* ── DOOM SPENDING ALERT ── */}
        {doomActive && (
          <TouchableOpacity style={styles.doomCard} onPress={() => nav.navigate('Doom')} activeOpacity={0.8}>
            <Text style={{ fontSize: 20 }}>🌀</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.doomTitle}>Doom Spending Detected</Text>
              <Text style={styles.doomSub}>7 impulse buys in 48hrs · Tap to see shield</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.doom} />
          </TouchableOpacity>
        )}

        {/* ── QUICK ACTIONS ── */}
        <View style={styles.quickRow}>
          <QuickAction icon="bulb-outline"        label="Jugaad"   color={colors.amber}  route="Jugaad"  />
          <QuickAction icon="wallet-outline"       label="Jars"     color={colors.accent} route="Jars"    />
          <QuickAction icon="leaf-outline"         label="Breathe"  color={colors.muted}  route="Breathe" />
        </View>

        {/* ── BALANCE BREAKDOWN ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Balance Breakdown</Text>
          {[
            { label: 'Reserved for bills', color: colors.amber,  amt: billsReserved },
            { label: 'Spent this month',   color: colors.danger,  amt: spentThisMonth },
            { label: 'Safety buffer',      color: colors.muted,   amt: Math.round((monthlyIncome * ((profile?.safety_pct ?? 5) / 100))) },
            { label: 'Safe to spend',      color: colors.accent,  amt: safeAmt, bold: true },
          ].map((row) => (
            <View key={row.label} style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.dot, { backgroundColor: row.color }]} />
                <Text style={[styles.breakdownLabel, row.bold && { color: colors.text, fontFamily: 'Inter_600SemiBold' }]}>
                  {row.label}
                </Text>
              </View>
              <Text style={[styles.breakdownAmt, { color: row.bold ? row.color : colors.text }]}>
                ₹{row.amt.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── FLOATING ADD TRANSACTION BUTTON ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => nav.navigate('AddTxn')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* ── FLOATING AI COACH BUTTON ── */}
      <Animated.View
        style={[
          styles.coachFabAnimated,
          {
            transform: pan.getTranslateTransform(),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons name="chatbubble-ellipses" size={18} color={colors.accent} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.md },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: spacing.containerMargin,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bellWrap: { position: 'relative' },
  badge: {
    position: 'absolute', top: 0, right: 0,
    width: 8, height: 8,
    backgroundColor: colors.danger,
    borderRadius: 4, borderWidth: 1.5, borderColor: colors.bg,
  },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${colors.accent}20`,
    borderWidth: 1, borderColor: `${colors.accent}50`,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'Inter_700Bold', color: colors.accent, fontSize: 13 },

  // Hero card
  heroCard: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  heroLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  heroAmount: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 38,
    color: colors.accent,
    lineHeight: 46,
    marginBottom: 4,
  },
  heroSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 6, backgroundColor: colors.s3,
    borderRadius: 3,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  progressLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.muted,
    textAlign: 'right',
  },

  // Danger banner
  dangerBanner: {
    backgroundColor: colors.amberDim,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.amber}30`,
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dangerIcon:  { fontSize: 16 },
  dangerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.amber },
  dangerSub:   { fontFamily: 'Inter_400Regular',  fontSize: 11, color: `${colors.amber}90`, marginTop: 2 },

  // Doom card
  doomCard: {
    backgroundColor: colors.doomDim,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.doom}30`,
    borderLeftWidth: 3,
    borderLeftColor: colors.doom,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  doomTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.doom },
  doomSub:   { fontFamily: 'Inter_400Regular',  fontSize: 11, color: `${colors.doom}90`, marginTop: 2 },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.s1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 76,
  },
  quickIconWrap: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
  },

  // Balance breakdown card
  card: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  breakdownAmt: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 13,
  },

  // FAB — Add Transaction
  fab: {
    position: 'absolute',
    bottom: 92,
    right: spacing.containerMargin,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  // FAB — AI Coach (Draggable Glassmorphic Orb)
  coachFabAnimated: {
    position: 'absolute',
    width: COACH_BUTTON_SIZE,
    height: COACH_BUTTON_SIZE,
    borderRadius: COACH_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(20, 20, 25, 0.85)',
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});