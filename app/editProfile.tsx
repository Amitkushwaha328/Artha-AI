import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getProfile, updateProfile } from '../db/queries';
import { useStore } from '../store/useStore';
import { colors, type, spacing, radius } from '../theme';

const INCOME_TYPES = ['salary', 'gig', 'mixed', 'pocket'] as const;

export default function EditProfileScreen() {
  const nav = useNavigation<any>();
  const { refreshAll } = useStore();

  // Profile fields — no current_balance here (it's auto-calculated)
  const [name, setName]             = useState('');
  const [city, setCity]             = useState('');
  const [income, setIncome]         = useState('');
  const [salaryDay, setSalaryDay]   = useState('');
  const [safetyPct, setSafetyPct]   = useState('');
  const [incomeType, setIncomeType] = useState<'salary' | 'gig' | 'mixed' | 'pocket'>('salary');
  const [claudeKey, setClaudeKey]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [loaded, setLoaded]         = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const p = await getProfile();
        if (p) {
          setName(p.name || '');
          setCity(p.city || '');
          setIncome(p.monthly_income > 0 ? p.monthly_income.toString() : '');
          setSalaryDay(p.salary_day?.toString() || '28');
          setSafetyPct(p.safety_pct?.toString() || '5');
          setIncomeType((p.income_type as any) || 'salary');
          setClaudeKey(p.claude_key || '');
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoaded(true);
      }
    }
    loadData();
  }, []);

  async function handleSave() {
    const inc = parseFloat(income);
    const pct = parseFloat(safetyPct);
    const day = parseInt(salaryDay, 10);

    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter your name.');
      return;
    }
    if (isNaN(inc) || inc <= 0) {
      Alert.alert('Invalid Income', 'Please enter a valid monthly income amount.');
      return;
    }
    if (isNaN(pct) || pct < 0 || pct > 100) {
      Alert.alert('Invalid Buffer', 'Safety buffer must be between 0% and 100%.');
      return;
    }
    if (isNaN(day) || day < 1 || day > 31) {
      Alert.alert('Invalid Day', 'Salary day must be between 1 and 31.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        city: city.trim(),
        monthly_income: inc,
        salary_day: day,
        safety_pct: pct,
        income_type: incomeType,
        claude_key: claudeKey.trim(),
        // Note: current_balance is NOT updated here — it's auto-calculated from transactions
      });
      await refreshAll();
      Alert.alert('Saved! ✅', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => nav.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save. Please try again.');
      console.error('EditProfile save error:', e);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={[type.bodySm, { color: colors.muted }]}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name='close' size={24} color={colors.muted} />
        </TouchableOpacity>
        <Text style={type.headline}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.saveLink, saving && { opacity: 0.5 }]}>
            {saving ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── SECTION: PERSONAL ── */}
        <Text style={styles.sectionTitle}>PERSONAL</Text>
        <View style={styles.card}>
          <Field label="Your Name" hint="First name or nickname">
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ravi"
              placeholderTextColor={colors.hint}
              autoCorrect={false}
            />
          </Field>
          <Field label="City" hint="Where you live" last>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Mumbai"
              placeholderTextColor={colors.hint}
              autoCorrect={false}
            />
          </Field>
        </View>

        {/* ── SECTION: FINANCIAL ── */}
        <Text style={styles.sectionTitle}>FINANCIAL SETTINGS</Text>
        <View style={styles.card}>
          {/* Income type toggle */}
          <Text style={styles.fieldLabel}>Income Type</Text>
          <Text style={styles.hint}>How you earn your money</Text>
          <View style={styles.toggleRow}>
            {INCOME_TYPES.map((t) => {
              const label = t === 'pocket' ? 'Pocket Money' : t.charAt(0).toUpperCase() + t.slice(1);
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.toggleBtn, incomeType === t && styles.toggleBtnActive]}
                  onPress={() => setIncomeType(t)}
                >
                  <Text style={[styles.toggleTxt, incomeType === t && styles.toggleTxtActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Field
            label={incomeType === 'pocket' ? 'Monthly Pocket Money (₹)' : 'Monthly Income (₹)'}
            hint={incomeType === 'pocket'
              ? 'How much pocket money you receive per month from family.'
              : 'Your regular take-home income per month'}
          >
            <TextInput
              style={styles.input}
              keyboardType='numeric'
              value={income}
              onChangeText={setIncome}
              placeholder="e.g. 72000"
              placeholderTextColor={colors.hint}
            />
          </Field>

          <Field label="Salary / Income Credit Day" hint="Which day of the month does your salary arrive?">
            <TextInput
              style={styles.input}
              keyboardType='numeric'
              value={salaryDay}
              onChangeText={setSalaryDay}
              placeholder="e.g. 28"
              placeholderTextColor={colors.hint}
              maxLength={2}
            />
          </Field>

          <Field label="Safety Buffer %" hint="% of income kept aside as emergency buffer. Reduces Safe-to-Spend." last>
            <View style={styles.pctRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType='numeric'
                value={safetyPct}
                onChangeText={setSafetyPct}
                placeholder="e.g. 5"
                placeholderTextColor={colors.hint}
                maxLength={3}
              />
              <Text style={styles.pctSymbol}>%</Text>
            </View>
          </Field>
        </View>

        {/* ── BALANCE INFO CARD (read-only) ── */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={styles.infoText}>
            <Text style={{ color: colors.accent, fontFamily: 'Inter_600SemiBold' }}>Current Balance</Text>
            {' '}is calculated automatically — it starts with your monthly income and reduces as you add debit transactions. Add transactions from the Home screen to keep it accurate.
          </Text>
        </View>

        {/* ── SECTION: AI ── */}
        {/* API key is managed by the app internally - no user input needed */}

        {/* ── BIG SAVE BUTTON ── */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle" size={20} color="#111" />
          <Text style={styles.saveTxt}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper component for consistent field layout
function Field({ label, hint, children, last }: {
  label: string; hint: string; children: React.ReactNode; last?: boolean;
}) {
  return (
    <View style={last ? undefined : { marginBottom: spacing.sm }}>
      <Text style={fieldStyles.label}>{label}</Text>
      <Text style={fieldStyles.hint}>{hint}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
});

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(10,10,15,0.70)',
  },
  saveLink: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: colors.accent,
  },
  scroll: {
    padding: spacing.base,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.s3,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    color: colors.text,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.borderMid,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.s2,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}18`,
  },
  toggleTxt: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.muted,
  },
  toggleTxtActive: {
    color: colors.accent,
    fontFamily: 'Inter_700Bold',
  },
  pctRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pctSymbol: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: `${colors.accent}10`,
    borderWidth: 1,
    borderColor: `${colors.accent}30`,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyeBtn: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 16,
    marginTop: spacing.sm,
  },
  saveTxt: {
    color: '#111',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
