import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getJars, addToJar, Jar } from '../db/queries';
import { colors, spacing, radius, type } from '../theme';
import * as Haptics from 'expo-haptics';

const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;

export default function JarsScreen() {
  const nav = useNavigation<any>();
  const [jars, setJars]         = useState<Jar[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<{ jar: Jar } | null>(null);
  const [addAmt, setAddAmt]     = useState('');
  const [saving, setSaving]     = useState(false);

  const loadJars = useCallback(async () => {
    try {
      const data = await getJars();
      setJars(data);
    } catch (e) {
      console.error('Jars load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJars(); }, [loadJars]);

  async function handleAddToJar() {
    if (!modal) return;
    const amt = parseFloat(addAmt);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Enter a valid amount');
      return;
    }
    setSaving(true);
    try {
      await addToJar(modal.jar.id, amt);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModal(null);
      setAddAmt('');
      await loadJars();
    } catch {
      Alert.alert('Error', 'Could not add to jar.');
    } finally {
      setSaving(false);
    }
  }

  const totalSaved  = jars.reduce((s, j) => s + j.saved, 0);
  const totalTarget = jars.reduce((s, j) => s + j.target, 0);
  const overallPct  = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="close" size={24} color={colors.muted} />
        </TouchableOpacity>
        <Text style={type.headline}>Savings Jars 🪙</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── OVERALL SUMMARY ── */}
        {!loading && jars.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <Text style={type.label}>TOTAL SAVED</Text>
              <Text style={[type.currencyHero, { color: colors.accent, marginVertical: spacing.xs }]}>
                ₹{totalSaved.toLocaleString('en-IN')}
              </Text>
              <Text style={[type.bodySm, { color: colors.muted }]}>
                of ₹{totalTarget.toLocaleString('en-IN')} goal · {overallPct}% done
              </Text>
            </View>
            <View style={styles.summaryRing}>
              <Svg width={80} height={80}>
                <Circle cx={40} cy={40} r={RING_R} fill="none" stroke={colors.border} strokeWidth={7} />
                <Circle
                  cx={40} cy={40} r={RING_R}
                  fill="none" stroke={colors.accent} strokeWidth={7}
                  strokeDasharray={`${(overallPct / 100) * RING_C} ${RING_C}`}
                  strokeLinecap="round"
                  rotation={-90} originX={40} originY={40}
                />
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.accent }}>{overallPct}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── JAR CARDS ── */}
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : jars.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 40 }}>🪙</Text>
            <Text style={[type.bodyLg, { color: colors.muted, marginTop: spacing.md }]}>No savings jars yet.</Text>
            <Text style={[type.bodySm, { color: colors.muted, marginTop: 4, textAlign: 'center' }]}>
              Jars are added automatically when your profile is set up.
            </Text>
          </View>
        ) : (
          jars.map((jar) => {
            const pct  = jar.target > 0 ? Math.min(100, Math.round((jar.saved / jar.target) * 100)) : 0;
            const fill = (pct / 100) * RING_C;
            const remaining = Math.max(0, jar.target - jar.saved);
            const isDone = jar.saved >= jar.target;

            return (
              <TouchableOpacity
                key={jar.id}
                style={styles.jarCard}
                onPress={() => !isDone && setModal({ jar })}
                activeOpacity={isDone ? 1 : 0.8}
              >
                <View style={styles.jarLeft}>
                  {/* Mini ring */}
                  <View style={styles.jarRingWrap}>
                    <Svg width={70} height={70}>
                      <Circle cx={35} cy={35} r={28} fill="none" stroke={colors.border} strokeWidth={5} />
                      <Circle
                        cx={35} cy={35} r={28}
                        fill="none" stroke={jar.color} strokeWidth={5}
                        strokeDasharray={`${(pct / 100) * (2 * Math.PI * 28)} ${2 * Math.PI * 28}`}
                        strokeLinecap="round"
                        rotation={-90} originX={35} originY={35}
                      />
                    </Svg>
                    <View style={styles.jarEmoji}>
                      <Text style={{ fontSize: 20 }}>{jar.icon}</Text>
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[type.bodyLg, { fontFamily: 'Inter_600SemiBold' }]}>{jar.name}</Text>
                    <Text style={[type.bodySm, { color: jar.color, fontFamily: 'Inter_600SemiBold' }]}>
                      ₹{jar.saved.toLocaleString('en-IN')} / ₹{jar.target.toLocaleString('en-IN')}
                    </Text>
                    {!isDone && (
                      <Text style={[type.bodySm, { color: colors.muted, fontSize: 11, marginTop: 2 }]}>
                        ₹{remaining.toLocaleString('en-IN')} left to goal
                      </Text>
                    )}
                    {isDone && (
                      <Text style={[type.bodySm, { color: colors.accent, fontSize: 11, marginTop: 2 }]}>
                        🎉 Goal Reached!
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.jarRight}>
                  <Text style={[type.label, { color: jar.color, fontSize: 14 }]}>{pct}%</Text>
                  {!isDone && (
                    <View style={[styles.addJarBtn, { borderColor: jar.color }]}>
                      <Ionicons name="add" size={16} color={jar.color} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── ADD TO JAR MODAL ── */}
      <Modal
        visible={!!modal}
        transparent
        animationType="slide"
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[type.headline, { marginBottom: 4 }]}>
              {modal?.jar.icon} Add to {modal?.jar.name}
            </Text>
            <Text style={[type.bodySm, { color: colors.muted, marginBottom: spacing.lg }]}>
              Current: ₹{modal?.jar.saved.toLocaleString('en-IN')} · 
              Target: ₹{modal?.jar.target.toLocaleString('en-IN')}
            </Text>
            <View style={styles.amtRow}>
              <Text style={styles.rupee}>₹</Text>
              <TextInput
                style={styles.amtInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.muted}
                value={addAmt}
                onChangeText={setAddAmt}
                autoFocus
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModal(null); setAddAmt(''); }}
              >
                <Text style={{ color: colors.muted, fontFamily: 'Inter_600SemiBold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleAddToJar}
                disabled={saving}
              >
                <Text style={styles.saveTxt}>{saving ? 'Adding…' : 'Add to Jar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: 'rgba(10,10,15,0.70)',
  },
  scroll: { padding: spacing.base, paddingBottom: 60 },

  summaryCard: {
    backgroundColor: colors.s1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  summaryLeft:  { flex: 1 },
  summaryRing:  { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center', justifyContent: 'center',
  },

  emptyBox: {
    backgroundColor: colors.s1, borderRadius: radius.lg,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
    padding: spacing.xxxl, alignItems: 'center',
    marginTop: spacing.xl,
  },

  jarCard: {
    backgroundColor: colors.s1, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.base,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  jarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  jarRingWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  jarEmoji: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  jarRight: { alignItems: 'center', gap: spacing.sm },
  addJarBtn: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.s1, borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl, padding: spacing.xl,
    borderTopWidth: 1, borderColor: colors.border,
  },
  amtRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  rupee:  { fontSize: 32, color: colors.muted, fontFamily: 'Inter_700Bold', marginRight: 4 },
  amtInput: { flex: 1, fontSize: 48, color: colors.text, fontFamily: 'Inter_700Bold' },
  modalBtns: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2, backgroundColor: colors.accent,
    borderRadius: radius.lg, padding: 14, alignItems: 'center',
  },
  saveTxt: { color: '#111', fontFamily: 'Inter_700Bold', fontSize: 15 },
});
