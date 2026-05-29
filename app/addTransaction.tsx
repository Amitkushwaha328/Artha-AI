import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { addTransaction } from '../db/queries';
import { useStore } from '../store/useStore';
import { colors, type, spacing, radius } from '../theme';

const CATEGORIES = [
  { key:'food',         label:'Food',          icon:'🍕' },
  { key:'groceries',    label:'Groceries',      icon:'🛒' },
  { key:'transport',    label:'Transport',      icon:'🚗' },
  { key:'rent',         label:'Rent',           icon:'🏠' },
  { key:'emi',          label:'EMI/Loan',       icon:'💳' },
  { key:'subscription', label:'Subscription',   icon:'📱' },
  { key:'medical',      label:'Medical',        icon:'🏥' },
  { key:'entertainment',label:'Entertainment',  icon:'🎮' },
  { key:'other',        label:'Other',          icon:'💸' },
];

// ── UPI SMS PARSER ────────────────────────────────────────────
// Handles common patterns from HDFC, ICICI, SBI, Paytm, PhonePe, GPay
function parseUpiSms(text: string): {
  amount: string; merchant: string; type: 'debit' | 'credit'; category: string;
} | null {
  const lower = text.toLowerCase();

  // Detect type
  const isDebit =
    lower.includes('debited') || lower.includes('sent') ||
    lower.includes('paid') || lower.includes('payment of') ||
    lower.includes('withdrawn') || lower.includes('spent');
  const isCredit =
    lower.includes('credited') || lower.includes('received') ||
    lower.includes('money received') || lower.includes('added to');

  if (!isDebit && !isCredit) return null;

  // Extract amount — try common patterns: Rs., INR, ₹
  const amtPatterns = [
    /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹)/i,
    /(?:amount|amt|for)\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];
  let amount = '';
  for (const pat of amtPatterns) {
    const m = text.match(pat);
    if (m) { amount = m[1].replace(/,/g, ''); break; }
  }
  if (!amount) return null;

  // Extract merchant — look for "to/from/at/via <merchant>"
  const merchantPatterns = [
    /(?:to|paid to|sent to)\s+([A-Za-z0-9 &'.@-]{2,30}?)(?:\s+(?:on|via|upi|ref|for|\.|from|using)|\d|$)/i,
    /(?:at|from)\s+([A-Za-z0-9 &'.@-]{2,30}?)(?:\s+(?:on|via|upi|ref|for|\.|upi id)|\d|$)/i,
    /(?:merchant|vendor):\s*([A-Za-z0-9 &'.@-]{2,30})/i,
  ];
  let merchant = '';
  for (const pat of merchantPatterns) {
    const m = text.match(pat);
    if (m) { merchant = m[1].trim(); break; }
  }

  // Auto-detect category from merchant / keywords
  const ml = merchant.toLowerCase() + ' ' + lower;
  let category = 'other';
  if (/zomato|swiggy|blinkit|domino|mcd|restaurant|cafe|hotel|food|starbucks|kfc/.test(ml)) category = 'food';
  else if (/uber|ola|rapido|auto|metro|bus|train|irctc|flight|airport|cab/.test(ml)) category = 'transport';
  else if (/netflix|hotstar|prime|spotify|youtube|zee5|sony|disney/.test(ml)) category = 'subscription';
  else if (/bigbasket|more|dmart|reliance|grocery|vegetables|fruits/.test(ml)) category = 'groceries';
  else if (/rent|landlord|housing|society/.test(ml)) category = 'rent';
  else if (/emi|loan|bank|home loan|car loan|equitas/.test(ml)) category = 'emi';
  else if (/hospital|pharmacy|medplus|medicine|doctor|clinic|diagnostic/.test(ml)) category = 'medical';
  else if (/steam|playstore|game|pvr|inox|cinema|movie/.test(ml)) category = 'entertainment';

  return {
    amount,
    merchant: merchant || 'UPI Payment',
    type: isDebit ? 'debit' : 'credit',
    category,
  };
}

export default function AddTransactionScreen() {
  const nav = useNavigation();
  const { updateBalance } = useStore();

  const [amount,    setAmount]    = useState('');
  const [merchant,  setMerchant]  = useState('');
  const [note,      setNote]      = useState('');
  const [category,  setCategory]  = useState('other');
  const [typeState, setTypeState] = useState<'debit'|'credit'>('debit');
  const [saving,    setSaving]    = useState(false);
  const [smsText,   setSmsText]   = useState('');
  const [showSms,   setShowSms]   = useState(false);
  const [parseError, setParseError] = useState('');

  // Paste from clipboard and parse
  async function handleSmsPaste() {
    try {
      const text = await Clipboard.getString();
      if (!text) {
        setSmsText('');
        setParseError('Clipboard is empty. Copy a UPI SMS first.');
        return;
      }
      setSmsText(text);
      setParseError('');
      handleSmsparse(text);
    } catch {
      setParseError('Could not read clipboard.');
    }
  }

  function handleSmsparse(text: string) {
    const result = parseUpiSms(text);
    if (!result) {
      setParseError('Could not read this SMS format. Please fill in manually.');
      return;
    }
    setAmount(result.amount);
    setMerchant(result.merchant);
    setTypeState(result.type);
    setCategory(result.category);
    setParseError('');
    setShowSms(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  async function handleSave() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      await addTransaction({
        amount: amt, type: typeState, category, merchant, note,
        txn_date: new Date().toISOString(),
        is_recurring: 0, member_id: 0,
      });
      await updateBalance(amt, typeState === 'credit' ? 'add' : 'subtract');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      nav.goBack();
    } catch {
      Alert.alert('Error', 'Could not save transaction');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name='close' size={24} color={colors.muted} />
        </TouchableOpacity>
        <Text style={type.headline}>Add Transaction</Text>
        {/* UPI SMS button */}
        <TouchableOpacity
          style={s.smsBtn}
          onPress={() => setShowSms(!showSms)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.accent} />
          <Text style={s.smsBtnTxt}>UPI SMS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* ── UPI SMS PASTE PANEL ── */}
        {showSms && (
          <View style={s.smsPanel}>
            <Text style={[type.label, { marginBottom: 6 }]}>PASTE UPI SMS</Text>
            <Text style={[type.bodySm, { color: colors.muted, marginBottom: spacing.sm }]}>
              Copy a UPI payment SMS from your messages app, then tap "Paste & Auto-fill" below.
            </Text>
            <TextInput
              style={s.smsInput}
              multiline
              numberOfLines={4}
              placeholder={'e.g. "Rs.240 debited from A/c **1234 to Zomato on 28-05-25. UPI Ref: 12345"'}
              placeholderTextColor={colors.muted}
              value={smsText}
              onChangeText={(t) => { setSmsText(t); setParseError(''); }}
            />
            {parseError ? (
              <Text style={s.parseErr}>{parseError}</Text>
            ) : null}
            <View style={s.smsActions}>
              <TouchableOpacity style={s.pasteBtn} onPress={handleSmsPaste}>
                <Ionicons name="clipboard-outline" size={16} color={colors.accent} />
                <Text style={s.pasteBtnTxt}>Paste from Clipboard</Text>
              </TouchableOpacity>
              {smsText.length > 10 && (
                <TouchableOpacity style={s.parseBtn} onPress={() => handleSmsparse(smsText)}>
                  <Text style={s.parseBtnTxt}>Auto-fill ✨</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── DEBIT / CREDIT TOGGLE ── */}
        <View style={s.typeToggle}>
          {(['debit','credit'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[s.typeBtn, typeState === t && {
                backgroundColor: t === 'debit' ? colors.danger + '33' : colors.accent + '33',
                borderColor:     t === 'debit' ? colors.danger : colors.accent,
              }]}
              onPress={() => setTypeState(t)}
            >
              <Text style={{ color: t === 'debit' ? colors.danger : colors.accent,
                fontFamily: 'Inter_500Medium', fontSize: 14 }}>
                {t === 'debit' ? '↓ Spent' : '↑ Received'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── AMOUNT INPUT ── */}
        <View style={s.amtWrap}>
          <Text style={s.rupee}>₹</Text>
          <TextInput
            style={s.amtInput}
            placeholder='0'
            placeholderTextColor={colors.muted}
            keyboardType='numeric'
            value={amount}
            onChangeText={setAmount}
            autoFocus={!showSms}
          />
        </View>

        {/* ── MERCHANT ── */}
        <TextInput
          style={s.input}
          placeholder='Merchant / Paid to (optional)'
          placeholderTextColor={colors.muted}
          value={merchant}
          onChangeText={setMerchant}
        />

        {/* ── NOTE ── */}
        <TextInput
          style={s.input}
          placeholder='Note (optional)'
          placeholderTextColor={colors.muted}
          value={note}
          onChangeText={setNote}
        />

        {/* ── CATEGORY CHIPS ── */}
        <Text style={[type.label, { marginBottom: 8, marginTop: 16 }]}>Category</Text>
        <View style={s.chipGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[s.chip, category === c.key && s.chipActive]}
              onPress={() => setCategory(c.key)}
            >
              <Text style={{ fontSize: 16 }}>{c.icon}</Text>
              <Text style={[s.chipLabel, category === c.key && { color: colors.accent }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── SAVE BUTTON ── */}
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={s.saveTxt}>
            {saving ? 'Saving…' : `Save ${typeState === 'debit' ? 'expense' : 'income'}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.bg },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  smsBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6,
               borderRadius: radius.full, borderWidth: 1, borderColor: `${colors.accent}50`, backgroundColor: `${colors.accent}10` },
  smsBtnTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.accent },

  smsPanel: {
    backgroundColor: colors.s1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: `${colors.accent}30`,
    padding: spacing.base, marginBottom: spacing.md,
  },
  smsInput: {
    backgroundColor: colors.s3, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.borderMid,
    padding: 12, color: colors.text,
    fontFamily: 'Inter_400Regular', fontSize: 13,
    minHeight: 90, textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  parseErr: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.danger, marginBottom: spacing.sm },
  smsActions: { flexDirection: 'row', gap: spacing.sm },
  pasteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: `${colors.accent}15`,
    borderRadius: radius.md, borderWidth: 1, borderColor: `${colors.accent}40`,
    paddingVertical: 10,
  },
  pasteBtnTxt: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.accent },
  parseBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.accent, borderRadius: radius.md,
  },
  parseBtnTxt: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#111' },

  scroll:    { padding: 16, paddingBottom: 60 },
  typeToggle:{ flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn:   { flex: 1, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  amtWrap:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  rupee:     { fontSize: 36, color: colors.muted, fontFamily: 'Inter_700Bold', marginRight: 4 },
  amtInput:  { flex: 1, fontSize: 52, color: colors.text, fontFamily: 'Inter_700Bold' },
  input:     { backgroundColor: colors.s2, borderRadius: radius.md, padding: 14, color: colors.text,
               marginBottom: 10, fontFamily: 'Inter_400Regular', fontSize: 15,
               borderWidth: 1, borderColor: colors.border },
  chipGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.s2,
               borderRadius: radius.full, paddingVertical: 8, paddingHorizontal: 12,
               borderWidth: 1, borderColor: colors.border },
  chipActive:{ borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  chipLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.muted },
  saveBtn:   { backgroundColor: colors.accent, borderRadius: radius.lg, padding: 16, alignItems: 'center', marginTop: 32 },
  saveTxt:   { color: '#111', fontFamily: 'Inter_700Bold', fontSize: 16 },
});