import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/todos';
const GEMINI_URL = 'http://localhost:8000/api/gemini/chat';

// Basic markdown to HTML converter for Gemini responses
function formatGeminiMarkdown(text) {
  let html = text;
  // Headings
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Numbered lists
  html = html.replace(/^(\d+)\. (.*)$/gm, '<li>$1. $2</li>');
  // Bullet lists
  html = html.replace(/^\* (.*)$/gm, '<li>$1</li>');
  // Wrap consecutive <li> in <ul> or <ol>
  html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  // Paragraphs (for lines not already wrapped)
  html = html.replace(/^(?!<h\d>|<ul>|<li>|<\/ul>|<b>|<\/b>|<ol>|<\/ol>|<p>|<\/p>|<br>|<span>)(.+)$/gm, '<p>$1</p>');
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  return html;
}

// Modular background component
function ChatbotBackground({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f7fa',
      position: 'relative',
    }}>
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>{children}</div>
    </div>
  );
}

const parseCommand = (input) => {
  const trimmed = input.trim();
  if (/^add todo /i.test(trimmed)) {
    return { action: 'add', title: trimmed.replace(/^add todo /i, '') };
  }
  if (/^list todos$/i.test(trimmed)) {
    return { action: 'list' };
  }
  if (/^update todo /i.test(trimmed)) {
    const match = trimmed.match(/^update todo (\S+) (.+)$/i);
    if (match) return { action: 'update', id: match[1], title: match[2] };
  }
  if (/^delete todo /i.test(trimmed)) {
    const match = trimmed.match(/^delete todo (\S+)$/i);
    if (match) return { action: 'delete', id: match[1] };
  }
  return { action: 'unknown' };
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg = { sender: 'user', text: input };
    setMessages([...messages, userMsg]);
    handleBotResponse(input);
    setInput('');
  };

  const handleBotResponse = async (input) => {
    const command = parseCommand(input);
    let botText = '';
    setLoading(true);
    try {
      switch (command.action) {
        case 'add': {
          const res = await axios.post(API_URL, { title: command.title });
          botText = `Added todo: "${res.data.title}" (id: ${res.data.id})`;
          break;
        }
        case 'list': {
          const res = await axios.get(API_URL);
          if (Array.isArray(res.data) && res.data.length > 0) {
            botText = 'Todos:\n' + res.data.map((t) => `${t.id}: ${t.title}`).join('\n');
          } else {
            botText = 'No todos found.';
          }
          break;
        }
        case 'update': {
          await axios.put(`${API_URL}/${command.id}`, { title: command.title });
          botText = `Updated todo ${command.id} to "${command.title}"`;
          break;
        }
        case 'delete': {
          await axios.delete(`${API_URL}/${command.id}`);
          botText = `Deleted todo ${command.id}`;
          break;
        }
        default: {
          const res = await axios.post(GEMINI_URL, { message: input });
          botText = res.data.reply || 'No response from Gemini.';
        }
      }
    } catch (err) {
      botText = 'Error: ' + (err.response?.data?.message || err.message);
    }
    setMessages((msgs) => [...msgs, { sender: 'bot', text: botText }]);
    setLoading(false);
  };

  return (
    <ChatbotBackground>
      <div style={{
        width: 420,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 20,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 500,
        maxHeight: 650,
        margin: 'auto',
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: 16,
          paddingRight: 4,
          whiteSpace: 'pre-line',
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              margin: '8px 0',
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {msg.sender === 'bot'
                ? <div
                    style={{
                      background: '#e5e5ea',
                      color: '#222',
                      padding: '10px 16px',
                      borderRadius: 18,
                      display: 'inline-block',
                      maxWidth: '75%',
                      fontSize: 15,
                      marginBottom: 2,
                      whiteSpace: 'pre-line',
                    }}
                    dangerouslySetInnerHTML={{ __html: formatGeminiMarkdown(msg.text) }}
                  />
                : <span style={{
                    background: '#4f8cff',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: 18,
                    display: 'inline-block',
                    maxWidth: '75%',
                    fontSize: 15,
                  }}>{msg.text}</span>
              }
            </div>
          ))}
          {loading && (
            <div style={{ textAlign: 'left', margin: '8px 0', color: '#888', fontStyle: 'italic' }}>
              Gemini is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' ? handleSend() : undefined}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid #d1d1d1',
              fontSize: 15,
              outline: 'none',
              color: '#222',
              background: '#f7f7fa',
              boxShadow: '0 1px 2px #0001',
            }}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            onClick={handleSend}
            style={{
              padding: '12px 22px',
              borderRadius: 12,
              border: 'none',
              background: loading ? '#a0c4ff' : '#4f8cff',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px #4f8cff33',
              transition: 'background 0.2s',
            }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </ChatbotBackground>
  );
};

export default Chatbot; 