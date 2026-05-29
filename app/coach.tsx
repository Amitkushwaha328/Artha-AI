import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius, type } from '../theme';
import { coachChat } from '../ai/gemini';
import { useStore } from '../store/useStore';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  extra?: string;
}

const INITIAL_MSGS: Message[] = [
  {
    id: '1',
    role: 'bot',
    text: 'Namaste Ravi! 🙏 I see your Danger Window is in 8 days.\nYour rent of ₹12,000 hits before your Infosys payment.\nHere\'s your 3-step Jugaad plan...',
    extra: '1. 🔄 Request partial advance from Infosys (₹8,000)\n2. 💳 Use HDFC credit card for rent (pay later)\n3. 🛑 Pause Netflix (save ₹649)',
  },
];

const QUICK_PROMPTS = ['Danger fix', 'Save ideas', 'Schemes', 'Budget help'];

export default function CoachScreen() {
  const nav = useNavigation<any>();
  const store = useStore();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MSGS);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sendMsg = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await coachChat(
        newMessages.map(m => ({ role: m.role, text: m.text })),
        {
          safeToSpend: store.safeToSpend ?? 0,
          spentSoFar: (store.profile?.monthly_income ?? 0) - (store.balance ?? 0),
          dangerDay: store.dangerWindow?.firstDay || undefined,
          language: store.profile?.language || 'English',
        }
      );
      const botMsg: Message = {
        id: Date.now().toString(),
        role: 'bot',
        text: reply,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'bot', text: 'Error connecting to Gemini API.' }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const renderMsg = ({ item }: { item: Message }) => (
    <View style={[styles.msgWrap, item.role === 'user' && styles.msgWrapUser]}>
      {item.role === 'bot' && (
        <View style={styles.botAvatar}>
          <Text style={{ fontSize: 14 }}>🤖</Text>
        </View>
      )}
      <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[type.bodyLg, { color: item.role === 'user' ? '#fff' : colors.text, lineHeight: 22 }]}>
          {item.text}
        </Text>
        {item.extra && (
          <View style={styles.extraBox}>
            <Text style={[type.bodySm, { color: colors.text, lineHeight: 20 }]}>{item.extra}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[type.bodyLg, { fontFamily: 'Inter_600SemiBold' }]}>Artha AI Coach</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={[type.bodySm, { color: colors.success }]}>Online</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={22} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── CHAT MESSAGES ── */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={i => i.id}
          renderItem={renderMsg}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={[styles.msgWrap]}>
                <View style={styles.botAvatar}><Text style={{ fontSize: 14 }}>🤖</Text></View>
                <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                  <Text style={[type.bodySm, { color: colors.muted }]}>Thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* ── QUICK PROMPTS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickScroll}
          contentContainerStyle={styles.quickContent}
        >
          {QUICK_PROMPTS.map((p) => (
            <TouchableOpacity key={p} style={styles.quickChip} onPress={() => sendMsg(p)}>
              <Text style={[type.bodySm, { color: colors.accent }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── INPUT BAR ── */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic-outline" size={20} color={colors.muted} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Artha anything..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMsg(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMsg(input)}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: 'rgba(10,10,15,0.90)',
    gap: spacing.md,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  onlineRow:    { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },

  chatContent: { padding: spacing.containerMargin, gap: spacing.md, paddingBottom: spacing.lg },

  msgWrap:     { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  msgWrapUser: { flexDirection: 'row-reverse' },

  botAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: `${colors.accent}20`,
    borderWidth: 1, borderColor: `${colors.accent}40`,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  bubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
  bubbleBot: {
    backgroundColor: colors.s2,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: radius.lg,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.accent,
    borderColor: `${colors.accent}80`,
    borderRadius: radius.lg,
    borderBottomRightRadius: 4,
  },
  typingBubble: { opacity: 0.6 },

  extraBox: {
    marginTop: spacing.sm,
    backgroundColor: `${colors.accent}15`,
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },

  quickScroll:   { maxHeight: 44, borderTopWidth: 1, borderTopColor: colors.border },
  quickContent:  { paddingHorizontal: spacing.containerMargin, paddingVertical: spacing.sm, gap: spacing.sm, flexDirection: 'row' },
  quickChip: {
    backgroundColor: `${colors.accent}15`,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: `${colors.accent}40`,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.bg,
    gap: spacing.sm,
  },
  micBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.s2,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.s2,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  sendBtnDisabled: { backgroundColor: colors.s2, shadowOpacity: 0 },
});
