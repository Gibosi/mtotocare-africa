import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { useAppSelector } from '../src/store/hooks';
import { aiApi } from '../src/api';
import { useNetworkStatus } from '../src/utils/network';
import { AIChatMessage } from '../src/types';
import { useLanguage } from '../src/i18n/LanguageContext';

// Local offline fallback answers for common parenting questions.
// Used only when the device is OFFLINE — otherwise the app talks to
// the real backend (which can call Groq for streaming responses).
const offlineAnswers: { match: RegExp; reply: string }[] = [
  { match: /food|eat|feed|meal|nutrition/i, reply: 'For balanced meals, offer a variety of foods from each food group: proteins (eggs, beans, fish), carbohydrates (rice, ugali, bread), fruits, and vegetables. Continue breastfeeding for at least 2 years. Wash hands before meals and use clean water.' },
  { match: /vaccin|immuniz|shot|chanjo/i, reply: 'Vaccinations protect your child from serious diseases. Follow the Tanzania EPI schedule. If you missed a dose, ask your health worker about catch-up vaccinations. Most vaccines are free at public health facilities.' },
  { match: /growth|weight|height|tall|big|ukuaji/i, reply: 'Healthy growth means steady weight and height gain over time. Your child should be measured monthly in the first year, then every 3-6 months. Watch for sudden changes and ask your doctor if concerned.' },
  { match: /fever|temperature|hot|homa/i, reply: 'For fever: give plenty of fluids, keep the child lightly dressed, and use paracetamol at the correct dose. If fever is above 39°C, lasts more than 3 days, or the child has convulsions, seek medical care immediately.' },
  { match: /diarrh|loose|watery stool|vomit|kuharisha/i, reply: 'For diarrhea: give oral rehydration solution (ORS) after every loose stool, continue feeding, and use zinc supplements for 10-14 days. If there is blood in stool, signs of dehydration, or vomiting everything, seek care immediately.' },
  { match: /sleep|nap|night|usingizi/i, reply: 'Newborns sleep 16-17 hours/day. By 1 year, 12-14 hours including naps. Establish a consistent bedtime routine, keep the room dark and cool, and put the baby on their back to sleep.' },
  { match: /breastfeed|breast|formula|milk|maziwa/i, reply: 'Exclusive breastfeeding is recommended for the first 6 months. Continue breastfeeding alongside complementary foods until at least 2 years. If using formula, follow preparation instructions carefully and use clean water.' },
];

const offlineFallback = (q: string): string => {
  for (const entry of offlineAnswers) {
    if (entry.match.test(q)) return entry.reply;
  }
  return 'I can help with questions about feeding, growth, vaccinations, fever, and common childhood illnesses. For serious or urgent concerns, please visit your nearest health facility or call your doctor.';
};

export default function AIChatScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAppSelector(s => s.auth);
  const { selectedId: childId, list: children } = useAppSelector(s => s.children);
  const { isOnline } = useNetworkStatus();
  const child = children.find(c => c.id === childId) || children[0];

  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [isOfflineResponse, setIsOfflineResponse] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = child
        ? `Hello ${user?.fullName?.split(' ')[0] || 'there'}! I'm MtotoCare AI. How can I help you today?`
        : "Hello! I'm MtotoCare AI. How can I help you today?";
      setMessages([{
        id: 0,
        userId: 0,
        role: 'assistant',
        content: greeting,
        createdAt: new Date().toISOString(),
      } as AIChatMessage]);
    }
  }, [child?.id]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: AIChatMessage = {
      id: Date.now(),
      userId: user?.id || 0,
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    const text = userMessage.content;
    setInput('');
    setLoading(true);
    setIsOfflineResponse(false);
    setStreamingText(null);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // OFFLINE: local knowledge base only
    if (!isOnline) {
      const offlineAnswer = offlineFallback(text);
      setIsOfflineResponse(true);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        userId: 0,
        role: 'assistant',
        content: offlineAnswer,
        createdAt: new Date().toISOString(),
      } as AIChatMessage]);
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    // ONLINE: try streaming first, fall back to non-streaming, then to offline
    let acc = '';
    let streamed = false;
    aiApi.chatStream(
      { message: text, childId: child?.id, language },
      (chunk) => {
        streamed = true;
        acc += chunk;
        setStreamingText(acc);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
      },
      (final) => {
        setStreamingText(null);
        setMessages(prev => [...prev, { ...final, content: acc || final.content }]);
        setLoading(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      },
      async () => {
        // Streaming failed (no Groq key, or SSE not supported). Try non-streaming.
        if (streamed && acc) {
          // We already have some text — keep it
          setStreamingText(null);
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            userId: 0,
            role: 'assistant',
            content: acc,
            createdAt: new Date().toISOString(),
          } as AIChatMessage]);
          setLoading(false);
          return;
        }
        try {
          const res = await aiApi.chat({ message: text, childId: child?.id, language });
          const aiMessage = res.data.data;
          setMessages(prev => [...prev, aiMessage]);
        } catch {
          setIsOfflineResponse(true);
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            userId: 0,
            role: 'assistant',
            content: offlineFallback(text),
            createdAt: new Date().toISOString(),
          } as AIChatMessage]);
        } finally {
          setLoading(false);
          setStreamingText(null);
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        }
      }
    );
  };

  const quickPrompts = language === 'sw'
    ? ['Chakula gani ni kizuri kwa mtoto wangu?', 'Chanjo inayofuata ni lini?', 'Mtoto wangu anaendeleaje?', 'Vidokezo vya kutibu homa']
    : ['What food is good for my child?', 'When is the next vaccine?', 'How is my child growing?', 'Fever management tips'];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={6}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>AI Assistant</Text>
          <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
            {isOnline
              ? (streamingText ? '● Streaming…' : 'Online — ready to chat')
              : 'Offline — using local answers'}
          </Text>
        </View>
        <View style={[styles.statusDot, {
          backgroundColor: isOnline
            ? (streamingText ? theme.colors.primary : theme.colors.success)
            : theme.colors.textSecondary,
        }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(m => (
          <View key={m.id} style={[styles.messageBubble, m.role === 'user' ? styles.userBubble : styles.aiBubble, {
            backgroundColor: m.role === 'user' ? theme.colors.primary : theme.colors.surface,
            borderColor: m.role === 'user' ? 'transparent' : theme.colors.border,
          }]}>
            <Text style={[styles.messageText, { color: m.role === 'user' ? '#FFFFFF' : theme.colors.text }]}>
              {m.content || (m.role === 'assistant' ? "Sorry, I couldn't generate a response. Please try again." : '')}
            </Text>
          </View>
        ))}

        {streamingText !== null && (
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.messageText, { color: theme.colors.text }]}>
              {streamingText}
              <Text style={{ color: theme.colors.primary }}>▍</Text>
            </Text>
          </View>
        )}

        {loading && streamingText === null && (
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}

        {messages.length <= 1 && streamingText === null && (
          <View style={styles.quickPrompts}>
            <Text style={[styles.quickTitle, { color: theme.colors.textSecondary }]}>Try asking:</Text>
            {quickPrompts.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.quickChip, { backgroundColor: theme.colors.featureBg, borderColor: theme.colors.border }]}
                onPress={() => setInput(p)}
              >
                <Text style={[styles.quickText, { color: theme.colors.primary }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isOfflineResponse && (
          <View style={[styles.offlineNote, { backgroundColor: theme.colors.warningLight }]}>
            <Ionicons name="cloud-offline-outline" size={14} color={theme.colors.warning} />
            <Text style={[styles.offlineText, { color: theme.colors.warning }]}>
              Local library — connect to the internet for a full AI answer
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
          placeholder="Ask anything..."
          placeholderTextColor={theme.colors.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: theme.colors.primary, opacity: input.trim() ? 1 : 0.5 }]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingTop: 50, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', marginLeft: 4 },
  headerSub: { fontSize: 11, marginTop: 1, marginLeft: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  messagesList: { flex: 1 },
  messagesContent: { padding: 16, gap: 8 },
  messageBubble: { maxWidth: '85%', padding: 12, borderRadius: 12, borderWidth: 1 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  messageText: { fontSize: 14, lineHeight: 20 },
  quickPrompts: { marginTop: 16, gap: 8 },
  quickTitle: { fontSize: 12, marginBottom: 4 },
  quickChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, borderWidth: 1, alignSelf: 'flex-start' },
  quickText: { fontSize: 13 },
  offlineNote: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  offlineText: { fontSize: 11 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 100, fontSize: 14 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
