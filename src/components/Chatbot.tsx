import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Headphones, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

// Initialize the API safely to prevent global crashes if the API key is missing on Vercel
let ai: any = null;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_API_KEY' });
} catch (e) {
  console.warn("GoogleGenAI failed to initialize. Make sure GEMINI_API_KEY is set in Vercel.");
}

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface ChatbotProps {
  activeSection?: string;
}

export default function Chatbot({ activeSection = 'hero' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveAgent, setIsLiveAgent] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm the Egy Safe AI assistant. I can answer questions about cybersecurity threats, the dark web, or our enterprise protection services. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // Tracks active token streaming
  const [hasPromptedContext, setHasPromptedContext] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Store the chat session ref
  const chatRef = useRef<any>(null);

  // Initialize chat session on mount
  useEffect(() => {
    if (!ai) return;
    try {
      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are an expert cybersecurity AI assistant for Egy Safe, an Egyptian enterprise threat intelligence and attack surface management startup. You specialize in dark web monitoring, penetration testing, and red teaming. You provide professional, accurate, and concise answers about cybersecurity threats and how Egy Safe's services can mitigate them. The user is currently viewing the '${activeSection}' section of the website. Tailor your responses to refer to the context of the '${activeSection}' section if relevant.`,
          temperature: 0.5,
        }
      });
    } catch (e) {
      console.error("Failed to initialize chat:", e);
    }
  }, []);

  // Update system instructions inside the chat ref when section changes
  useEffect(() => {
    if (chatRef.current && !isLiveAgent && ai) {
       chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        history: chatRef.current.history || [], // Keep message history!
        config: {
          systemInstruction: `You are an expert cybersecurity AI assistant for Egy Safe, an Egyptian enterprise threat intelligence and attack surface management startup. You specialize in dark web monitoring, penetration testing, and red teaming. You provide professional, accurate, and concise answers about cybersecurity threats. The user is currently viewing the '${activeSection}' section of the website. If the user asks a general question (like "tell me more"), assume they mean the '${activeSection}' section. Proactively offer tailored information or ask questions related to this section if appropriate.`,
          temperature: 0.5,
        }
      });
    }
  }, [activeSection, isLiveAgent]);

  // Proactive contextual pop-ups based on section
  useEffect(() => {
    if (activeSection !== 'hero' && !hasPromptedContext[activeSection] && !isLiveAgent) {
      setHasPromptedContext(prev => ({ ...prev, [activeSection]: true }));
      
      let contextualMessage = "";
      if (activeSection === 'services') {
        contextualMessage = "I see you're looking at our Services. Would you like me to explain the difference between Dark Web Monitoring and our Attack Surface Discovery?";
      } else if (activeSection === 'pricing') {
        contextualMessage = "Reviewing our pricing plans? I can help you decide whether the Advanced or Enterprise tier makes more sense for your organization size.";
      } else if (activeSection === 'how-it-works') {
        contextualMessage = "Are you curious about how our C2 Server Intelligence works? I can explain our automated processing pipeline in more detail.";
      }

      if (contextualMessage && messages.length <= 1) { // Only prompt if they haven't engaged much
        setTimeout(() => {
           setMessages(prev => [...prev, {
             id: `context-${activeSection}`,
             role: 'assistant',
             content: contextualMessage
           }]);
           // Automatically open chat to draw attention (optional, user preference)
           // setIsOpen(true);
        }, 3000);
      }
    }
  }, [activeSection, isLiveAgent, hasPromptedContext, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isLiveAgent]);

  const connectToLiveAgent = () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'system', 
      content: 'Connecting you to an available support agent... Please hold.' 
    }]);

    // Simulate finding an agent
    setTimeout(() => {
      setIsLiveAgent(true);
      setAgentName('Sarah');
      setIsLoading(false);
      
      const humanMsgId = Date.now().toString();
      setMessages(prev => [...prev, { 
        id: humanMsgId, 
        role: 'assistant', 
        content: "Hi there! I'm Sarah from the Egy Safe Support team. How can I help you today?" 
      }]);

      // Re-initialize Chat AI to act as Sarah
      if (ai) {
        chatRef.current = ai.chats.create({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction: "You are Sarah, a human support agent at Egy Safe, an Egyptian enterprise threat intelligence startup. You are warm, professional, and very helpful. The user specifically requested to speak to a human, so absolutely DO NOT mention that you are an AI. You are a real human working in the support center. Provide concise, helpful support.",
            temperature: 0.7,
          }
        });
      }
    }, 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    
    // Add user message to UI
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userMsg };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        throw new Error("Chat not initialized");
      }
      
      const responseStream = await chatRef.current.sendMessageStream({ message: userMsg });
      const assistantMsgId = (Date.now() + 1).toString();
      let startedStreaming = false;

      for await (const chunk of responseStream) {
        if (!startedStreaming) {
          startedStreaming = true;
          setIsLoading(false); // Hide the "thinking" 3-dot indicator instantly
          setIsStreaming(true); // Show the blinking typing cursor
          setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: chunk.text || '' }]);
        } else {
          // Use a functional update to smoothly append chunks as they arrive
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMsgId 
              ? { ...msg, content: msg.content + (chunk.text || '') }
              : msg
          ));
        }
      }

      setIsStreaming(false); // Done streaming

      if (!startedStreaming) {
         setIsLoading(false);
         setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: "I'm having trouble getting a response. Can you ask again?" }]);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      setIsLoading(false);
      setIsStreaming(false);
      
      const errorMessage = error?.message || "Unknown error occurred";
      
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        
        // If we already added the assistant message but it broke mid-stream
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id !== newUserMsg.id) {
          return prev.map(msg => 
            msg.id === lastMsg.id 
              ? { ...msg, content: msg.content + `\n\n*(Connection interrupted: ${errorMessage})*` }
              : msg
          );
        } else {
          // If it failed before the first token
          return [...prev, { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: `⚠️ **Connection Error**: I'm unable to reach the server right now. Please try again.` 
          }];
        }
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-3rem)] h-[540px] max-h-[calc(100vh-8rem)] bg-[#050505] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <div className="bg-[#0A0A0A] p-4 border-b border-white/10 flex justify-between items-center z-10 relative">
              <div className="absolute inset-0 bg-cyan/5 pointer-events-none"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isLiveAgent ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-cyan/10 border-cyan/30 text-cyan'}`}>
                  {isLiveAgent ? <Headphones className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{isLiveAgent ? `Support: ${agentName}` : 'Egy Safe AI'}</h3>
                  <p className={`text-xs flex items-center gap-1 ${isLiveAgent ? 'text-blue-500' : 'text-cyan'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLiveAgent ? 'bg-blue-500' : 'bg-cyan'}`}></span>
                    {isLiveAgent ? 'Live Agent' : 'Online'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                {!isLiveAgent && (
                  <button 
                    onClick={connectToLiveAgent}
                    disabled={isLoading}
                    className="text-[10px] uppercase tracking-wider font-bold bg-white/5 hover:bg-white/10 text-white px-2 py-1.5 rounded disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Headphones className="w-3 h-3" />
                    Human
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  {msg.role === 'system' ? (
                    <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-neutral-400 flex items-center gap-2 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {msg.content}
                    </div>
                  ) : (
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                        msg.role === 'user' 
                          ? 'bg-white/10 text-white' 
                          : isLiveAgent 
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'bg-cyan/10 text-cyan border border-cyan/20'
                      }`}>
                        {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : isLiveAgent ? <Headphones className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-cyan text-black rounded-tr-sm' 
                          : 'bg-[#111] text-neutral-300 border border-white/5 rounded-tl-sm'
                      }`}>
                        {msg.role === 'user' ? (
                          msg.content
                        ) : (
                          <div className="markdown-body">
                            <Markdown>
                              {msg.content + (isStreaming && msg.id === messages[messages.length - 1].id ? ' ▍' : '')}
                            </Markdown>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'system' && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${isLiveAgent ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-cyan/10 text-cyan border border-cyan/20'}`}>
                      {isLiveAgent ? <Headphones className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`px-4 py-3.5 rounded-2xl bg-[#111] border border-white/5 rounded-tl-sm flex items-center gap-1.5`}>
                      <motion.div 
                        animate={{ y: [0, -4, 0] }} 
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} 
                        className={`w-1.5 h-1.5 rounded-full ${isLiveAgent ? 'bg-blue-500' : 'bg-cyan'}`} 
                      />
                      <motion.div 
                        animate={{ y: [0, -4, 0] }} 
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} 
                        className={`w-1.5 h-1.5 rounded-full ${isLiveAgent ? 'bg-blue-500' : 'bg-cyan'}`} 
                      />
                      <motion.div 
                        animate={{ y: [0, -4, 0] }} 
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} 
                        className={`w-1.5 h-1.5 rounded-full ${isLiveAgent ? 'bg-blue-500' : 'bg-cyan'}`} 
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-[#0A0A0A] border-t border-white/10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isLiveAgent ? "Message Sarah..." : "Ask the AI assistant..."}
                  disabled={isLoading}
                  className={`w-full bg-[#111] border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none transition-all disabled:opacity-50 ${isLiveAgent ? 'focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50' : 'focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50'}`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-1.5 w-8 h-8 rounded-full text-black flex items-center justify-center transition-colors disabled:opacity-50 disabled:bg-neutral-700 disabled:text-neutral-400 ${isLiveAgent ? 'bg-blue-500 hover:bg-blue-600' : 'bg-cyan hover:bg-cyan/90'}`}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,194,255,0.3)] transition-all duration-300 z-50 focus:outline-none hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-white/10 border border-white/20 text-white' : 'bg-cyan text-black glow-cyan'
        }`}
        aria-label="Toggle chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </>
  );
}
