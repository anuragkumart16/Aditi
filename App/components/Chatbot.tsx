import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import ChatbotBackground from './ChatbotBackground';

const GEMINI_URL = 'http://localhost:8000/api/gemini/chat'; // Change to your backend URL if needed

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

// Basic markdown parser for Gemini responses
function renderGeminiMarkdown(text: string) {
  const lines = text.split(/\n+/);
  return lines.map((line, idx) => {
    // Headings
    if (/^### (.*)/.test(line)) {
      return <Text key={idx} style={styles.h3}>{line.replace(/^### /, '')}</Text>;
    }
    if (/^## (.*)/.test(line)) {
      return <Text key={idx} style={styles.h2}>{line.replace(/^## /, '')}</Text>;
    }
    if (/^# (.*)/.test(line)) {
      return <Text key={idx} style={styles.h1}>{line.replace(/^# /, '')}</Text>;
    }
    // Numbered list
    if (/^\d+\. /.test(line)) {
      return <Text key={idx} style={styles.listItem}>{line}</Text>;
    }
    // Bullet list
    if (/^\* /.test(line)) {
      return <Text key={idx} style={styles.listItem}>{line.replace(/^\* /, '\u2022 ')}</Text>;
    }
    // Bold
    if (/\*\*(.*?)\*\*/.test(line)) {
      const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
      return <Text key={idx} style={styles.botText}>{parts.map((part, i) => part.startsWith('**') && part.endsWith('**') ? <Text key={i} style={styles.bold}>{part.slice(2, -2)}</Text> : part)}</Text>;
    }
    // Normal paragraph
    return <Text key={idx} style={styles.botText}>{line}</Text>;
  });
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { sender: 'user' as const, text: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { sender: 'bot', text: data.reply || 'No response from Gemini.' }]);
    } catch (err: any) {
      setMessages(msgs => [...msgs, { sender: 'bot', text: 'Error: ' + (err.message || 'Unknown error') }]);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ChatbotBackground>
        <View style={styles.container}>
          <ScrollView
            style={styles.messages}
            ref={scrollViewRef}
            contentContainerStyle={{ paddingVertical: 16 }}
          >
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.bubble,
                  msg.sender === 'user' ? styles.userBubble : styles.botBubble,
                  { alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' },
                ]}
              >
                {msg.sender === 'bot'
                  ? renderGeminiMarkdown(msg.text)
                  : <Text style={styles.userText}>{msg.text}</Text>
                }
              </View>
            ))}
            {loading && (
              <Text style={{ color: '#888', fontStyle: 'italic', marginLeft: 8 }}>Gemini is typing...</Text>
            )}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              placeholder="Type your message..."
              editable={!loading}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendButton, loading && { backgroundColor: '#a0c4ff' }]}
              onPress={handleSend}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>{loading ? '...' : 'Send'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ChatbotBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  messages: {
    flex: 1,
    paddingHorizontal: 12,
  },
  bubble: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#4f8cff',
  },
  botBubble: {
    backgroundColor: '#e5e5ea',
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  botText: {
    color: '#222',
    fontSize: 16,
    marginBottom: 2,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  h1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  h2: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  h3: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  listItem: {
    color: '#222',
    fontSize: 16,
    marginLeft: 12,
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f7f7fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d1d1',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4f8cff',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Chatbot; 