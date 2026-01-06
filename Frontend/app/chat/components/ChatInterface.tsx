"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    MessageSquare,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
    ChevronRight,
    Send,
    User,
    Bot
} from 'lucide-react';

interface user {
    name: string;
    id: number;
    userId: string;
    email: string | null;
    userImage: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Chat {
    id: string;
    title: string | null;
    updatedAt: string;
}

export default function ChatInterface({ user }: { user: user }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // New State for Chat History
    const [chats, setChats] = useState<Chat[]>([]);
    const [chatId, setChatId] = useState<string | null>(null);

    // Fetch Chats on Mount
    useEffect(() => {
        if (user?.userId) {
            fetchChats();
        }
    }, [user?.userId]);

    const fetchChats = async () => {
        try {
            const res = await fetch(`/api/chats?userId=${user.userId}`);
            if (res.ok) {
                const data = await res.json();
                setChats(data);
            }
        } catch (error) {
            console.error("Failed to load chats", error);
        }
    };

    const loadChat = async (id: string) => {
        if (id === chatId) return;
        setChatId(id);
        setMessages([]); // Clear current view
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chats/${id}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to load message history", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setChatId(null);
        setMessages([]);
        setInputValue("");
    };

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    userId: user.userId,
                    chatId: chatId
                }),
            });

            if (!response.body) throw new Error("No response body");

            // Check for new Chat ID
            const newChatId = response.headers.get("X-Chat-Id");
            if (newChatId && newChatId !== chatId) {
                setChatId(newChatId);
                // Refresh list to show new chat
                fetchChats();
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantMessage += chunk;

                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1] = { role: 'assistant', content: assistantMessage };
                    return newArr;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally add an error message to chat
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-neutral-200 font-sans overflow-hidden">
            {/* Sidebar */}
            <div
                className={`
                relative flex flex-col border-r border-neutral-800 bg-neutral-900/50 backdrop-blur-xl transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'w-64' : 'w-16 md:w-20'}
            `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800/50">
                    {isSidebarOpen && (
                        <span className="font-semibold text-lg tracking-tight text-white/90 truncate">Aditi AI</span>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 ml-auto hover:bg-white/5 rounded-lg transition-colors text-neutral-400 hover:text-white"
                    >
                        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>
                </div>

                {/* New Chat Button (Sidebar) */}
                <div className="p-3">
                    <button
                        onClick={startNewChat}
                        className={`
                        flex items-center gap-3 w-full p-3 rounded-xl 
                        bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50 hover:border-neutral-600 
                        transition-all group shadow-sm
                        ${!isSidebarOpen && 'justify-center px-0'}
                    `}>
                        <Plus size={20} className="text-white group-hover:scale-110 transition-transform shrink-0" />
                        {isSidebarOpen && <span className="font-medium text-sm text-neutral-200 truncate">New Chat</span>}
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    <div className="px-3 pb-2">
                        {isSidebarOpen && <p className="text-xs font-medium text-neutral-500 mb-2 px-1">Recent</p>}
                        <div className="space-y-1">
                            {chats.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => loadChat(chat.id)}
                                    className={`
                                    w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group
                                    ${!isSidebarOpen && 'justify-center px-0'}
                                    ${chatId === chat.id ? 'bg-white/10' : ''}
                                `}>
                                    <MessageSquare size={18} className={`shrink-0 ${chatId === chat.id ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'}`} />
                                    {isSidebarOpen && (
                                        <div className="text-left overflow-hidden w-full">
                                            <p className={`text-sm truncate w-full ${chatId === chat.id ? 'text-white font-medium' : 'text-neutral-300'}`}>
                                                {chat.title || "Untitled Chat"}
                                            </p>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User/Footer */}
                <div className="p-4 border-t border-neutral-800/50">
                    <button className={`
                    flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition-colors
                    ${!isSidebarOpen && 'justify-center'}
                `}>
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500 to-blue-500 shrink-0 ring-2 ring-transparent hover:ring-white/20 transition-all overflow-hidden">
                            {user.userImage ? (
                                <img src={user.userImage} alt={user.name} className="w-full h-full object-cover" />
                            ) : null}
                        </div>
                        {isSidebarOpen && (
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-medium text-neutral-200 truncate">{user.name}</p>
                                <p className="text-xs text-neutral-500 truncate">Settings</p>
                            </div>
                        )}
                        {isSidebarOpen && <Settings size={16} className="ml-auto text-neutral-500" />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative z-0 overflow-hidden bg-linear-to-b from-[#0a0a0a] to-[#0f0f0f]">
                {/* Center Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4">
                            <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                {/* Logo/Icon */}
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative w-20 h-20 bg-neutral-900 ring-1 ring-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                                        <MessageSquare size={40} className="text-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-neutral-500 pb-1">
                                        Welcome back, {user.name.split(' ')[0]}
                                    </h1>
                                    <p className="text-lg text-neutral-400 max-w-md mx-auto">
                                        Start a new conversation to explore ideas with Aditi AI.
                                    </p>
                                </div>

                                {/* Suggestions Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-12 opacity-0 animate-[fadeIn_0.5s_ease-out_0.3s_forwards]">
                                    {['Draft a blog post', 'Explain code', 'Write a story', 'Plan a project'].map((text, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInputValue(text);
                                                // We don't auto-send here to let user confirm, or we could call sendMessage directly if we refactored valid event
                                            }}
                                            className="
                                        flex items-center justify-between p-4 
                                        rounded-xl border border-neutral-800 bg-neutral-900/40 
                                        hover:bg-neutral-800 hover:border-neutral-700 
                                        transition-all text-left group
                                    ">
                                            <span className="text-neutral-300 text-sm group-hover:text-white transition-colors">{text}</span>
                                            <ChevronRight size={16} className="text-neutral-600 group-hover:text-neutral-400 transition-colors opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 w-full max-w-3xl mx-auto p-4 space-y-6">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700">
                                            <Bot size={16} className="text-purple-400" />
                                        </div>
                                    )}
                                    <div className={`
                                        relative px-4 py-3 rounded-2xl max-w-[80%] 
                                        ${msg.role === 'user'
                                            ? 'bg-neutral-800 text-white border border-neutral-700/50 rounded-br-sm'
                                            : 'text-neutral-300 rounded-bl-sm'}
                                    `}>
                                        <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.content}</p>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700 overflow-hidden">
                                            {user.userImage ? <img src={user.userImage} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-blue-400" />}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700">
                                        <Bot size={16} className="text-purple-400" />
                                    </div>
                                    <div className="flex items-center gap-1 h-10">
                                        <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                            <div className="h-4" /> {/* Spacer */}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/20 backdrop-blur-md border-t border-neutral-800/50">
                    <div className="max-w-3xl mx-auto space-y-3">
                        <form onSubmit={sendMessage} className="relative group">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Message Aditi AI..."
                                className="
                                    relative z-10
                                    w-full bg-neutral-900/90 text-neutral-200 
                                    placeholder:text-neutral-500 
                                    border border-neutral-800 focus:border-neutral-700
                                    rounded-xl px-4 py-4 pr-12
                                    focus:outline-none focus:ring-1 focus:ring-white/10
                                    transition-all shadow-sm
                                "
                            />

                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="
                                    absolute right-2 top-1/2 -translate-y-1/2 
                                    p-2 rounded-lg 
                                    bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white 
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    transition-colors
                                "
                            >
                                <Send size={18} />
                            </button>
                        </form>
                        <div className="text-center text-xs text-neutral-600">
                            Aditi AI can make mistakes. Please verify important information.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
