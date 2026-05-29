import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '../store/useStore';
import { colors, spacing, radius, type } from '../theme';

export default function SettingsScreen() {
  const nav = useNavigation<any>();
  const { monthlyIncome, balance, profile } = useStore();
  const [notifs, setNotifs] = useState({
    danger: true,
    doom: true,
    daily: false,
    bills: true,
  });

  const SettingsRow = ({
    label, value, onPress, right, last,
  }: { label: string; value?: string; onPress?: () => void; right?: React.ReactNode; last?: boolean }) => (
    <TouchableOpacity
      style={[styles.row, last && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={type.bodyLg}>{label}</Text>
      {right ?? (
        value ? (
          <View style={styles.rowRight}>
            <Text style={[type.bodySm, { color: colors.muted }]}>{value}</Text>
            {onPress && <Ionicons name="chevron-forward" size={14} color={colors.muted} />}
          </View>
        ) : null
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. PROFILE ── */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[type.headline]}>{profile?.name || 'Your Name'}</Text>
            <Text style={[type.bodySm, { color: colors.muted, marginTop: 2 }]}>
              {profile?.income_type
                ? profile.income_type.charAt(0).toUpperCase() + profile.income_type.slice(1)
                : 'Member'} · {profile?.city || 'India'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => nav.navigate('EditProfile')}>
            <Text style={[type.bodySm, { color: colors.accent }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── 2. FINANCIAL PROFILE ── */}
        <Text style={styles.sectionTitle}>FINANCIAL PROFILE</Text>
        <View style={styles.card}>
          <SettingsRow label="Monthly Income"  value={`₹${(monthlyIncome || 0).toLocaleString('en-IN')}`}  onPress={() => nav.navigate('EditProfile')} />
          <SettingsRow label="Current Balance" value={`₹${(balance || 0).toLocaleString('en-IN')}`}  onPress={() => nav.navigate('EditProfile')} />
          <SettingsRow label="Risk Profile"    value="Moderate"  />
          <SettingsRow label="Safety Buffer"   value={`${profile?.safety_pct || 0}%`}        last />
        </View>

        {/* ── 3. NOTIFICATIONS ── */}
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          {[
            { key: 'danger', label: 'Danger Window Alerts' },
            { key: 'doom',   label: 'Doom Spending Alerts' },
            { key: 'daily',  label: 'Daily Safe-to-Spend'  },
            { key: 'bills',  label: 'Bill Reminders'       },
          ].map(({ key, label }, i, arr) => (
            <SettingsRow
              key={key}
              label={label}
              last={i === arr.length - 1}
              right={
                <Switch
                  value={notifs[key as keyof typeof notifs]}
                  onValueChange={(v) => setNotifs(n => ({ ...n, [key]: v }))}
                  trackColor={{ false: colors.s3, true: `${colors.accent}80` }}
                  thumbColor={notifs[key as keyof typeof notifs] ? colors.accent : colors.muted}
                />
              }
            />
          ))}
        </View>

        {/* ── 4. AI SETTINGS ── */}
        <Text style={styles.sectionTitle}>AI SETTINGS</Text>
        <View style={styles.card}>
          <SettingsRow label="AI Coach"       onPress={() => nav.navigate('Coach')} value="Chat" />
          <SettingsRow label="Scheme Radar"   onPress={() => nav.navigate('Schemes')} value="View" />
          <SettingsRow label="Language"       value="English + Hindi" onPress={() => Alert.alert('Language', 'English and Hindi are currently supported.')} />
          <SettingsRow label="Response Style" value="Friendly"        onPress={() => Alert.alert('Response Style', 'AI responses are tuned to be friendly and empathetic.')} />
          <SettingsRow
            label="API Status"
            last
            right={
              <View style={styles.statusRow}>
                <View style={styles.greenDot} />
                <Text style={[type.bodySm, { color: colors.success }]}>Connected</Text>
              </View>
            }
          />
        </View>

        {/* ── 5. ABOUT ── */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <SettingsRow label="App Version"           value="1.0.0"  />
          <SettingsRow label="Privacy Policy"         onPress={() => Alert.alert('Privacy Policy', 'Artha stores all your financial data locally on your device. No data is sent to any server except your AI Coach messages (Anthropic Claude). Contact: support@artha.app')} />
          <SettingsRow label="Open Source Licenses"   onPress={() => Alert.alert('Licenses', 'This app uses open-source packages including React Native (MIT), Expo (MIT), and others.')} />
          <SettingsRow label="Export My Data"         onPress={() => Alert.alert('Export Data', 'Data export feature coming soon. Your data is stored in SQLite on-device and can be accessed via backup.')} last />
        </View>

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
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: 'rgba(10,10,15,0.70)',
  },
  headerTitle: { ...type.displayMobile },

  profileCard: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, marginBottom: spacing.md,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: `${colors.accent}20`,
    borderWidth: 2, borderColor: `${colors.accent}60`,
    alignItems: 'center', justifyContent: 'center',
  },
  profileInitials: { ...type.headline, color: colors.accent, fontSize: 20 },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: `${colors.accent}50`,
    backgroundColor: `${colors.accent}10`,
  },

  sectionTitle: {
    ...type.label,
    color: colors.muted,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowRight:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greenDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
});
