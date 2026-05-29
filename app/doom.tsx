import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, type } from '../theme';
import { useStore } from '../store/useStore';

const PURCHASES = [
  { name: 'Swiggy',    time: '2h ago',   amt: 680  },
  { name: 'Amazon',    time: '6h ago',   amt: 1200 },
  { name: 'Zomato',    time: '8h ago',   amt: 340  },
  { name: 'Rapido',    time: '12h ago',  amt: 89   },
  { name: 'BigBasket', time: '18h ago',  amt: 560  },
  { name: 'Flipkart',  time: '32h ago',  amt: 499  },
  { name: 'Dunzo',     time: '44h ago',  amt: 479  },
];

export default function DoomScreen() {
  const nav  = useNavigation<any>();
  const store = useStore() as any;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* ── PURPLE GLOW HEADER ── */}
      <View style={styles.glowHeader}>
        <View style={styles.glowOrb} />
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.doomTitle}>🌀 Doom Spending Detected</Text>
        <Text style={styles.doomSub}>Pattern detected in the last 48 hours</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── STATS CARD ── */}
        <View style={styles.statsCard}>
          <Text style={[type.bodyLg, { color: colors.doom, fontFamily: 'Inter_600SemiBold', marginBottom: spacing.md }]}>
            You made {PURCHASES.length} purchases in the last 48 hours
          </Text>
          {[
            { label: 'Total spent',          value: '₹3,847', color: colors.warning },
            { label: 'Average per purchase', value: '₹549',   color: colors.text    },
            { label: 'Most recent',          value: 'Swiggy · 2h ago · ₹680', color: colors.muted },
          ].map((r) => (
            <View key={r.label} style={styles.statRow}>
              <Text style={[type.bodySm, { color: colors.muted }]}>{r.label}</Text>
              <Text style={[type.currencySm, { color: r.color }]}>{r.value}</Text>
            </View>
          ))}
        </View>

        {/* ── PATTERN TIMELINE ── */}
        <View style={styles.card}>
          <Text style={[type.label, { marginBottom: spacing.md }]}>PURCHASE TIMELINE</Text>
          <View style={styles.timeline}>
            {PURCHASES.map((p, i) => (
              <View key={p.name} style={styles.timelineItem}>
                <View style={[styles.purpleDot, { opacity: 1 - i * 0.1 }]} />
                <Text style={[type.bodySm, { color: colors.muted, fontSize: 11 }]}>
                  {p.name} · {p.time}
                </Text>
                <Text style={[type.currencySm, { color: colors.doom, fontSize: 11 }]}>
                  ₹{p.amt}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[type.bodySm, { color: colors.muted, fontStyle: 'italic', marginTop: spacing.sm, textAlign: 'center' }]}>
            This pattern often means financial anxiety, not hunger.
          </Text>
        </View>

        {/* ── ARTHA MESSAGE ── */}
        <View style={styles.speechCard}>
          <View style={styles.speechAvatar}>
            <Text style={{ fontSize: 20 }}>🤖</Text>
          </View>
          <View style={styles.speechBubble}>
            <Text style={[type.bodyLg, { lineHeight: 24 }]}>
              Hey Ravi, we noticed something.{'\n'}
              Small purchases when stressed are normal.{'\n'}
              But 7 in 48 hours can add up fast.{'\n'}
              You've spent ₹3,847 that wasn't planned. 💜
            </Text>
          </View>
        </View>

        {/* ── ACTION OPTIONS ── */}
        <TouchableOpacity
          style={styles.pauseBtn}
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              '⏸ Spending Pause Activated',
              'You have paused all non-essential spending for 24 hours. We will remind you when it lifts tomorrow.',
              [{ text: 'Got it', style: 'default' }]
            )
          }
        >
          <Ionicons name="pause-circle-outline" size={20} color={colors.warning} />
          <Text style={[type.bodyLg, { color: colors.warning, fontFamily: 'Inter_600SemiBold' }]}>
            Activate Spending Pause — 24 hrs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.breatheBtn}
          onPress={() => nav.navigate('Breathe')}
          activeOpacity={0.85}
        >
          <Ionicons name="leaf-outline" size={20} color="#fff" />
          <Text style={[type.bodyLg, { color: '#fff', fontFamily: 'Inter_600SemiBold' }]}>
            Try Breathing Exercise
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.impactBtn}
          activeOpacity={0.85}
          onPress={() => nav.navigate('Forecast')}
        >
          <Ionicons name="stats-chart-outline" size={20} color={colors.text} />
          <Text style={type.bodyLg}>See the Full Impact</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dismissLink}
          onPress={() => nav.goBack()}
        >
          <Text style={[type.bodySm, { color: colors.muted }]}>Dismiss — I'm okay</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.md },

  // Glow header
  glowHeader: {
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: `${colors.doom}30`,
    backgroundColor: `${colors.doom}10`,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute', top: -40, left: '50%',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: `${colors.doom}20`,
    transform: [{ translateX: -100 }],
  },
  backBtn: {
    position: 'absolute', top: spacing.md, left: spacing.containerMargin,
  },
  doomTitle: { ...type.headline, color: colors.doom, textAlign: 'center', marginTop: spacing.md },
  doomSub:   { ...type.bodySm, color: `${colors.doom}80`, marginTop: 4, textAlign: 'center' },

  // Stats
  statsCard: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${colors.doom}30`,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },

  // Timeline
  card: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  timeline:     { gap: spacing.sm },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  purpleDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.doom,
  },

  // Speech bubble
  speechCard: {
    flexDirection: 'row', gap: spacing.md,
    marginBottom: spacing.md, alignItems: 'flex-start',
  },
  speechAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: `${colors.doom}20`,
    borderWidth: 1, borderColor: `${colors.doom}40`,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: colors.s2,
    borderRadius: radius.lg,
    borderTopLeftRadius: 4,
    borderWidth: 1, borderColor: `${colors.doom}30`,
    borderLeftWidth: 3, borderLeftColor: colors.doom,
    padding: spacing.base,
  },

  // Action buttons
  pauseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1.5, borderColor: colors.warning,
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  breatheBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.doom,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    shadowColor: colors.doom,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  impactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.s2,
    borderWidth: 1, borderColor: colors.border,
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  dismissLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
