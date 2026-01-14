
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X, RotateCcw } from 'lucide-react';
import { ChatbotConfig, Message } from '../types';
import { generateBotResponse } from '../services/geminiService';

interface ChatWidgetProps {
  config: ChatbotConfig;
  isPreview?: boolean;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ config, isPreview = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: '1',
        role: 'model',
        text: `Hola! Bienvenido a ${config.clientName}. ¿En qué puedo ayudarte hoy?`,
        timestamp: Date.now()
      }
    ]);
  }, [config.clientName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay
    const responseText = await generateBotResponse(config, messages, input);

    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    }]);

    // Handle lead capture simulation for the owner preview
    // Handle lead capture trigger
    if (config.captureLeads && !leadSubmitted && !showLeadForm && (messages.length > 2 || input.toLowerCase().includes('contacto'))) {
      setTimeout(() => setShowLeadForm(true), 2000);
    }
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
    };

    // En modo preview (local), guardamos en localStorage para simular
    // En producción, esto llamaría a tu API: /api/leads
    const currentLeads = JSON.parse(localStorage.getItem('bf_leads') || '[]');
    currentLeads.push({
      id: Date.now().toString(),
      botId: config.id,
      ...data,
      timestamp: Date.now()
    });
    localStorage.setItem('bf_leads', JSON.stringify(currentLeads));

    setShowLeadForm(false);
    setLeadSubmitted(true);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text: '¡Gracias! Hemos recibido tus datos. Nos pondremos en contacto pronto.',
      timestamp: Date.now()
    }]);
  };

  const resetChat = () => {
    setMessages([{
      id: '1',
      role: 'model',
      text: `Chat reiniciado. ¿En qué puedo ayudarte hoy?`,
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-inner font-sans">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between text-white transition-colors duration-500 shadow-md z-10"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white/20">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Bot size={24} className="text-slate-900" style={{ color: config.primaryColor }} />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight">{config.clientName}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-medium text-white/80">En línea</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetChat} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Reiniciar">
            <RotateCcw size={16} />
          </button>
          {isPreview && (
            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs shadow-sm ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-white'}`}>
                {msg.role === 'user' ? <User size={14} className="text-indigo-600" /> : <Bot size={14} style={{ color: config.primaryColor }} />}
              </div>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                    ? 'rounded-tr-none text-white'
                    : 'rounded-tl-none text-slate-700'
                  }`}
                style={{
                  backgroundColor: msg.role === 'user' ? config.userMessageColor : config.botMessageColor,
                  color: msg.role === 'user' ? '#ffffff' : '#334155'
                }}
              >
                {msg.text}
                <div className="text-[10px] mt-1.5 opacity-50 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Bot size={14} style={{ color: config.primaryColor }} />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        {showLeadForm && (
          <form onSubmit={handleLeadSubmit} className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-bottom-4 mx-4 mb-4">
            <h5 className="font-bold text-slate-800 mb-3 text-sm">Déjanos tus datos de contacto</h5>
            <div className="space-y-3">
              <input required name="name" type="text" placeholder="Nombre completo" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input required name="email" type="email" placeholder="Correo electrónico" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input required name="phone" type="tel" placeholder="Teléfono / WhatsApp" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button
                type="submit"
                className="w-full py-2 rounded-lg text-white font-semibold text-sm transition-colors"
                style={{ backgroundColor: config.buttonColor }}
              >
                Enviar Datos
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all">
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-slate-700"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:grayscale"
            style={{ backgroundColor: config.buttonColor }}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-2 text-[9px] text-center text-slate-400 font-medium">
          Potenciado por <span className="font-bold text-indigo-500">BotForge AI</span>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
