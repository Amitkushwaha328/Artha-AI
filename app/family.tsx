import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, type } from '../theme';
import { getMembers, addMember, deleteMember, Member } from '../db/queries';

const RING_R  = 52;
const RING_C  = 2 * Math.PI * RING_R;
const FUND_PCT = 28;

const COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9'
];

export default function FamilyScreen() {
  const nav = useNavigation<any>();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // New member form
  const [newName, setNewName] = useState('');
  const [newRel, setNewRel] = useState('');
  const [newCost, setNewCost] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function loadData() {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd() {
    if (!newName.trim() || !newRel.trim() || !newCost.trim()) {
      Alert.alert('Missing fields', 'Please fill all details');
      return;
    }
    const limit = parseFloat(newCost);
    if (isNaN(limit) || limit < 0) {
      Alert.alert('Invalid amount', 'Please enter a valid monthly limit');
      return;
    }

    setIsSaving(true);
    try {
      const initials = newName.substring(0, 2).toUpperCase();
      const color = COLORS[members.length % COLORS.length];
      
      await addMember({
        name: newName.trim(),
        rel: newRel.trim(),
        initials,
        monthly_limit: limit,
        color
      });
      
      setNewName('');
      setNewRel('');
      setNewCost('');
      setModalVisible(false);
      await loadData();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    Alert.alert('Remove Member', 'Are you sure you want to remove this family member?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await deleteMember(id);
        await loadData();
      }}
    ]);
  }

  const insurance = [
    { name: 'Health Insurance', status: 'Active',           icon: 'checkmark-circle', color: colors.success, detail: '₹15,000/yr'        },
    { name: 'Life Insurance',   status: 'Expires in 45d',   icon: 'warning',          color: colors.amber,   detail: 'Renew Now →'        },
    { name: 'Term Plan',        status: 'Not Found',        icon: 'close-circle',     color: colors.error,   detail: 'Setup →'            },
  ];

  const fundRingFill = (FUND_PCT / 100) * RING_C;
  
  const totalCost = members.reduce((sum, m) => sum + m.monthly_limit, 0);
  const commitPct = totalCost > 0 ? 39 : 0; // Hardcoded percentage for demo visually
  const commitRing   = (commitPct / 100) * RING_C;
  const COMMIT_R     = 52;
  const COMMIT_C     = 2 * Math.PI * COMMIT_R;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Family Safety Net</Text>
        <Text style={styles.subtitle}>Financial protection for your people</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. FAMILY COST SUMMARY ── */}
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            {/* Ring */}
            <View style={styles.ringWrap}>
              <Svg width={110} height={110}>
                <Circle cx={55} cy={55} r={COMMIT_R} fill="none" stroke={colors.border} strokeWidth={9} />
                <Circle
                  cx={55} cy={55} r={COMMIT_R}
                  fill="none"
                  stroke={totalCost > 0 ? colors.amber : colors.border}
                  strokeWidth={9}
                  strokeDasharray={`${commitRing} ${COMMIT_C}`}
                  strokeLinecap="round"
                  rotation={-90}
                  originX={55}
                  originY={55}
                />
              </Svg>
              <View style={styles.ringInner}>
                <Text style={[type.currencyLg, { color: colors.amber, fontSize: 18 }]}>{commitPct}%</Text>
                <Text style={[type.label, { color: colors.muted, fontSize: 8 }]}>of income</Text>
              </View>
            </View>
            {/* Numbers */}
            <View style={{ flex: 1 }}>
              <Text style={type.label}>MONTHLY FAMILY{'\n'}COMMITMENTS</Text>
              <Text style={[type.currencyLg, { color: colors.text, marginTop: spacing.sm }]}>₹{totalCost.toLocaleString('en-IN')}</Text>
              {totalCost > 0 && <Text style={[type.bodySm, { color: colors.muted, marginTop: 4 }]}>~{commitPct}% of total income</Text>}
            </View>
          </View>
        </View>

        {/* ── 2. FAMILY MEMBER CARDS ── */}
        <Text style={[type.label, styles.sectionLabel]}>FAMILY MEMBERS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memberScroll}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.accent} style={{ margin: spacing.xl }} />
          ) : members.map((m) => (
            <TouchableOpacity key={m.id} style={styles.memberCard} onLongPress={() => handleDelete(m.id)}>
              <View style={[styles.memberAvatar, { borderColor: m.color, backgroundColor: `${m.color}20` }]}>
                <Text style={[styles.memberInitials, { color: m.color }]}>{m.initials}</Text>
              </View>
              <Text style={[type.bodyLg, { fontFamily: 'Inter_600SemiBold', marginTop: spacing.sm }]} numberOfLines={1}>{m.name}</Text>
              <Text style={[type.bodySm, { color: colors.muted, textAlign: 'center', marginTop: 2 }]} numberOfLines={1}>{m.rel || 'Family'}</Text>
              <Text style={[type.currencySm, { color: colors.amber, marginTop: spacing.sm, fontFamily: 'JetBrainsMono_700Bold' }]}>
                ₹{m.monthly_limit.toLocaleString('en-IN')}/mo
              </Text>
            </TouchableOpacity>
          ))}
          {/* Add Member */}
          <TouchableOpacity style={styles.addMemberCard} activeOpacity={0.7} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={28} color={colors.muted} />
            <Text style={[type.bodySm, { color: colors.muted, marginTop: spacing.sm, textAlign: 'center' }]}>Add{'\n'}Member</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── 3. INSURANCE RADAR ── */}
        <View style={styles.card}>
          <Text style={[type.label, { marginBottom: spacing.md }]}>COVERAGE STATUS</Text>
          {insurance.map((ins) => (
            <View key={ins.name} style={styles.insuranceRow}>
              <Ionicons name={ins.icon as any} size={22} color={ins.color} />
              <View style={{ flex: 1 }}>
                <Text style={type.bodyLg}>{ins.name}</Text>
                <Text style={[type.bodySm, { color: ins.color }]}>{ins.status}</Text>
              </View>
              <TouchableOpacity>
                <Text style={[type.bodySm, { color: ins.color }]}>{ins.detail}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ── 4. EMERGENCY FUND TRACKER ── */}
        <View style={styles.card}>
          <View style={styles.fundHeader}>
            <Text style={type.label}>EMERGENCY FUND</Text>
            <Text style={[type.currencySm, { color: colors.muted }]}>₹42,000 / ₹1,50,000</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${FUND_PCT}%` as any }]} />
          </View>
          <View style={styles.fundFooter}>
            <Text style={[type.bodySm, { color: colors.muted }]}>{FUND_PCT}% of goal</Text>
            <Text style={[type.bodySm, { color: colors.accent }]}>Save ₹9,000/mo</Text>
          </View>
          <View style={styles.fundInfo}>
            <Ionicons name="information-circle-outline" size={14} color={colors.muted} />
            <Text style={[type.bodySm, { color: colors.muted, flex: 1 }]}>
              You need ₹1,08,000 more to reach your goal
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── ADD MEMBER MODAL ── */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
              <Text style={type.headline}>Add Family Member</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Meena"
              placeholderTextColor={colors.hint}
            />

            <Text style={styles.inputLabel}>Relationship</Text>
            <TextInput
              style={styles.input}
              value={newRel}
              onChangeText={setNewRel}
              placeholder="e.g. Spouse"
              placeholderTextColor={colors.hint}
            />

            <Text style={styles.inputLabel}>Monthly Limit / Commitment (₹)</Text>
            <TextInput
              style={styles.input}
              value={newCost}
              onChangeText={setNewCost}
              placeholder="e.g. 8000"
              keyboardType="numeric"
              placeholderTextColor={colors.hint}
            />

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
              onPress={handleAdd}
              disabled={isSaving}
            >
              <Text style={styles.saveBtnTxt}>{isSaving ? 'Saving...' : 'Add Member'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  title:    { ...type.displayMobile },
  subtitle: { ...type.bodySm, color: colors.muted, marginTop: 2 },

  card: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.md,
  },

  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.base },
  ringWrap:   { width: 110, height: 110, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringInner:  { position: 'absolute', alignItems: 'center', justifyContent: 'center' },

  sectionLabel:  { marginBottom: spacing.sm, marginTop: spacing.sm },
  memberScroll:  { marginBottom: spacing.md },
  memberCard: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    alignItems: 'center',
    width: 130,
    marginRight: spacing.md,
  },
  memberAvatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  memberInitials: { ...type.bodyLg, fontFamily: 'Inter_700Bold' },
  addMemberCard: {
    backgroundColor: colors.s1,
    borderRadius: radius.lg,
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border,
    padding: spacing.base,
    alignItems: 'center', justifyContent: 'center',
    width: 110, marginRight: spacing.md,
  },

  insuranceRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },

  fundHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  progressTrack: {
    height: 10, backgroundColor: colors.s2,
    borderRadius: 5, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm, overflow: 'hidden',
  },
  progressFill:  { height: '100%', backgroundColor: colors.success, borderRadius: 5 },
  fundFooter:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  fundInfo:      { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start', marginTop: 4 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
    borderTopWidth: 1, borderColor: colors.border,
  },
  inputLabel: {
    ...type.bodySm, color: colors.muted, marginBottom: 4, marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.s1,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    color: colors.text, fontFamily: 'Inter_500Medium',
    marginBottom: spacing.sm,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14, borderRadius: radius.md,
    alignItems: 'center', marginTop: spacing.lg,
  },
  saveBtnTxt: {
    color: '#111', fontFamily: 'Inter_700Bold', fontSize: 16,
  },
});
