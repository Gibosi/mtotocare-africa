/**
 * Enhanced AI Chat with Offline Fallback
 * 
 * ONLINE: Question → Backend AI → Response → Save Conversation → Cache
 * OFFLINE: AI → Offline Health Library → Search → Display Articles
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { aiApi } from '../api';
import { useIsOnline } from '../services/connectivity';
import { aiOfflineLibrary } from '../services/aiOfflineLibrary';
import { useAppSelector } from '../store/hooks';

type Message = 
  | { role: 'user'; text: string }
  | { role: 'ai'; text: string; fromCache?: boolean };

export const AIChatScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const isOnline = useIsOnline();
  const { selectedId: childId, list: children } = useAppSelector(s => s.children);
  const selectedChild = children.find(c => c.id === childId);
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      text: 'Hello Mama Amina! 👋\nI\'m MtotoCare AI. How can I help you today?\n\n' + 
           (isOnline ? '🌐 Online mode: Full AI available' : '📡 Offline mode: Health library available')
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    
    try {
      let responseText = '';
      let fromCache = false;

      if (isOnline) {
        // Online: Call backend AI
        const response = await aiApi.chat({ 
          message: userMsg, 
          language: 'en', 
          childId: childId || undefined 
        });
        responseText = response.data.data.content;
      } else {
        // Offline: Answer from the local health library
        responseText = aiOfflineLibrary.answer(userMsg, selectedChild);
        fromCache = true;
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: responseText, fromCache }]);
    } catch (err: any) {
      // Fallback to offline mode on error
      try {
        const responseText = aiOfflineLibrary.answer(userMsg, selectedChild);
        setMessages(prev => [...prev, { role: 'ai', text: responseText, fromCache: true }]);
      } catch {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: 'Sorry, I could not process your question. Please try again.' 
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.aiHeader}>
          <View style={[styles.aiAvatar, { backgroundColor: theme.colors.featureBg }]}>
            <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>AI Assistant</Text>
            <Text style={[styles.headerSubtitle, { color: isOnline ? theme.colors.success : theme.colors.warning }]}>
              {isOnline ? '🟢 Online' : '🔴 Offline (Health Library)'} 
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[
            styles.bubble,
            item.role === 'user' ? styles.userBubble : styles.aiBubble,
            { 
              backgroundColor: item.role === 'user' ? theme.colors.featureBg : theme.colors.surface,
              borderRadius: 16,
              borderColor: theme.colors.border,
            }
          ]}>
            <View style={[styles.bubbleIcon, { backgroundColor: theme.colors.primary }]}>
              <Ionicons 
                name={item.role === 'user' ? 'person' : 'sparkles'} 
                size={14} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={[styles.bubbleText, { color: theme.colors.text }]}>
              {item.text}
            </Text>
            {item.role === 'ai' && item.fromCache && (
              <Text style={[styles.cachedBadge, { color: theme.colors.textSecondary }]}>
                📚 From offline health library
              </Text>
            )}
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View style={[styles.bubble, styles.aiBubble, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={[styles.bubbleIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
              <Text style={{ color: theme.colors.textSecondary }}>Thinking...</Text>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <View style={[styles.inputBar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.surface, 
            color: theme.colors.text,
            borderRadius: 24,
            borderColor: theme.colors.border,
          }]}
          placeholder={isOnline ? "Ask anything..." : "Ask (offline health library)..."}
          placeholderTextColor={theme.colors.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.micBtn, { backgroundColor: theme.colors.featureBg }]}
        >
          <Ionicons name="mic" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendBtn, { 
            backgroundColor: theme.colors.accent,
            opacity: loading || !input.trim() ? 0.5 : 1,
          }]}
          onPress={send}
          disabled={loading || !input.trim()}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  aiHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  list: {
    padding: 16,
  },
  bubble: {
    flexDirection: 'row',
    maxWidth: '90%',
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  bubbleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  bubbleText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  cachedBadge: {
    fontSize: 10,
    marginTop: 6,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
