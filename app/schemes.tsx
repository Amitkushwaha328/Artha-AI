import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, type } from '../theme';

const SCHEMES = [
  {
    icon: '🏦', name: 'PMJDY',
    full: 'Pradhan Mantri Jan Dhan Yojana',
    tagline: 'Zero-balance account + ₹2L insurance',
    match: 'HIGH', matchColor: colors.success, matchBg: `${colors.success}18`,
    action: 'Apply in 2 min →',
  },
  {
    icon: '🪙', name: 'APY',
    full: 'Atal Pension Yojana',
    tagline: '₹5,000/month pension for freelancers',
    match: 'HIGH', matchColor: colors.success, matchBg: `${colors.success}18`,
    action: 'Apply →',
  },
  {
    icon: '🚀', name: 'DPIIT',
    full: 'DPIIT Startup Recognition',
    tagline: 'Tax exemptions + fast-track compliance',
    match: 'MEDIUM', matchColor: colors.amber, matchBg: `${colors.amber}18`,
    action: 'Check Eligibility →',
  },
  {
    icon: '💊', name: 'PM-JAY',
    full: 'Ayushman Bharat PM-JAY',
    tagline: '₹5 lakh health cover per year',
    match: 'CHECK', matchColor: colors.warning, matchBg: `${colors.warning}18`,
    action: 'Verify →',
  },
];

const FILTERS = ['All', 'Banking', 'Pension', 'Health', 'Business', 'Tax'];

export default function SchemesScreen() {
  const nav = useNavigation<any>();
  const [filter, setFilter] = useState('All');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Scheme Radar</Text>
          <Text style={styles.headerSub}>Matched to your profile</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── PROFILE MATCH BANNER ── */}
        <View style={styles.matchBanner}>
          <View style={styles.matchIconWrap}>
            <Text style={{ fontSize: 24 }}>✅</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.bodyLg, { fontFamily: 'Inter_600SemiBold', color: colors.success }]}>
              4 schemes matched to your profile
            </Text>
            <Text style={[type.bodySm, { color: colors.muted, marginTop: 4 }]}>
              Freelancer · Age 32 · Income ₹72,000/yr · Maharashtra
            </Text>
          </View>
        </View>

        {/* ── FILTER CHIPS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, f === filter && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, f === filter && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── SCHEME CARDS ── */}
        {SCHEMES.map((s) => (
          <View key={s.name} style={styles.schemeCard}>
            <View style={styles.schemeTop}>
              <Text style={{ fontSize: 28 }}>{s.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[type.bodyLg, { fontFamily: 'Inter_700Bold' }]}>{s.name}</Text>
                <Text style={[type.bodySm, { color: colors.muted, marginTop: 2 }]}>{s.full}</Text>
              </View>
              <View style={[styles.matchPill, { backgroundColor: s.matchBg }]}>
                <Text style={[styles.matchText, { color: s.matchColor }]}>{s.match}</Text>
              </View>
            </View>
            <Text style={[type.bodySm, { color: colors.text, marginTop: spacing.sm, lineHeight: 20 }]}>
              {s.tagline}
            </Text>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.applyBtn} activeOpacity={0.8}>
              <Text style={styles.applyText}>{s.action}</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.accent} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: spacing.containerMargin, paddingTop: spacing.md },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: 'rgba(10,10,15,0.70)',
    gap: spacing.md,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { ...type.headline },
  headerSub:    { ...type.bodySm, color: colors.muted, marginTop: 2 },

  matchBanner: {
    backgroundColor: `${colors.success}12`,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${colors.success}30`,
    padding: spacing.base,
    flexDirection: 'row', alignItems: 'flex-start',
    gap: spacing.md, marginBottom: spacing.md,
  },
  matchIconWrap: { paddingTop: 2 },

  filterScroll:  { marginBottom: spacing.md },
  filterContent: { paddingBottom: 4, gap: spacing.sm, flexDirection: 'row' },
  filterChip: {
    backgroundColor: colors.s1,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  filterChipActive: { backgroundColor: `${colors.accent}20`, borderColor: colors.accent },
  filterText:       { ...type.bodySm, color: colors.muted },
  filterTextActive: { color: colors.accent, fontFamily: 'Inter_600SemiBold' },

  schemeCard: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  schemeTop:  { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  matchPill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  matchText:  { ...type.label, fontSize: 9, letterSpacing: 0.5 },
  divider:    { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'flex-end', gap: 4,
  },
  applyText: { ...type.bodySm, color: colors.accent, fontFamily: 'Inter_600SemiBold' },
});
