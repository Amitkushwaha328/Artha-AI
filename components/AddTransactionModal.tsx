import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Modal, ScrollView } from 'react-native';
import { colors, radius } from '../theme';
import { spacing } from '../theme';
import { addTransaction } from '../db/queries';

const CATEGORIES = ['food', 'groceries', 'transport', 'rent', 'emi', 'subscription', 'medical', 'entertainment', 'other'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AddTransactionModal({ visible, onClose, onSaved }: Props) {
  const [amount, setAmount]     = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('other');
  const [type, setType]         = useState<'debit' | 'credit'>('debit');

  const save = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    await addTransaction({
      amount: parseFloat(amount),
      type, category, merchant,
      txn_date: new Date().toISOString(),
      note: '',
      is_recurring: 0,
      member_id: 0,
    });
    setAmount(''); setMerchant(''); setCategory('other'); setType('debit');
    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Transaction</Text>
          <Pressable onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></Pressable>
        </View>

        {/* Debit / Credit Toggle */}
        <View style={styles.typeRow}>
          {(['debit', 'credit'] as const).map(t => (
            <Pressable key={t} style={[styles.typeBtn, type === t && { backgroundColor: t === 'debit' ? colors.red + '33' : colors.green + '33', borderColor: t === 'debit' ? colors.red : colors.green }]}
              onPress={() => setType(t)}>
              <Text style={[styles.typeBtnText, { color: type === t ? (t === 'debit' ? colors.red : colors.green) : colors.muted }]}>
                {t === 'debit' ? '▼ Spent' : '▲ Received'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Amount */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Amount (₹)</Text>
          <TextInput style={styles.input} placeholder="0" placeholderTextColor={colors.muted}
            keyboardType="numeric" onChangeText={setAmount} value={amount} />
        </View>

        {/* Merchant */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Merchant / Note (optional)</Text>
          <TextInput style={styles.input} placeholder="Zomato, Rent, etc." placeholderTextColor={colors.muted}
            onChangeText={setMerchant} value={merchant} />
        </View>

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map(c => (
            <Pressable key={c} style={[styles.catChip, category === c && { backgroundColor: colors.blue + '33', borderColor: colors.blue }]}
              onPress={() => setCategory(c)}>
              <Text style={[styles.catText, { color: category === c ? colors.blue : colors.muted }]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Save Transaction</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl, paddingTop: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  cancelText: { fontSize: 15, color: colors.muted },
  typeRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  typeBtnText: { fontSize: 14, fontWeight: '600' },
  inputWrap: { marginBottom: spacing.lg },
  label: { fontSize: 12, color: colors.muted, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: colors.s1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 16, color: colors.text },
  catScroll: { marginBottom: spacing.xl },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm, backgroundColor: colors.s1 },
  catText: { fontSize: 13, fontWeight: '500' },
  saveBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center', marginTop: 'auto' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});





