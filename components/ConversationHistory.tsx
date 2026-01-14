
import React from 'react';
import { Conversation, ChatbotConfig } from '../types';
import { MessageSquare, Clock, ArrowLeft } from 'lucide-react';

interface ConversationHistoryProps {
  conversations: Conversation[];
  chatbots: ChatbotConfig[];
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ conversations, chatbots }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Historial de Conversaciones</h2>
        <p className="text-slate-500 mt-1">Revisa cómo interactúan los usuarios con tus bots.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conversations.map((conv) => {
          const bot = chatbots.find(b => b.id === conv.botId);
          return (
            <div key={conv.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{bot?.clientName || 'Bot'}</h4>
                    <p className="text-[10px] text-slate-500">{new Date(conv.startTime).toLocaleString()}</p>
                  </div>
                </div>
                {conv.leadId && (
                   <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-full">Lead</span>
                )}
              </div>
              <div className="p-6 flex-1 space-y-4 max-h-64 overflow-y-auto bg-slate-50/20">
                {conv.messages.slice(0, 3).map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-slate-400 mb-1">{msg.role === 'user' ? 'Usuario' : 'Bot'}</span>
                    <div className={`px-3 py-2 rounded-xl text-xs max-w-[90%] ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                      {msg.text.length > 80 ? msg.text.substring(0, 80) + '...' : msg.text}
                    </div>
                  </div>
                ))}
                {conv.messages.length > 3 && (
                   <p className="text-[10px] text-center text-slate-400 font-medium">+ {conv.messages.length - 3} mensajes más</p>
                )}
              </div>
              <div className="p-4 border-t border-slate-100">
                <button className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                  Ver Conversación Completa
                </button>
              </div>
            </div>
          );
        })}
        {conversations.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 italic">
            No se han registrado conversaciones todavía.
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
