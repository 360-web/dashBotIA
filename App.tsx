
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Plus,
  ChevronRight,
  Bot,
  LogOut
} from 'lucide-react';
import { AppView, ChatbotConfig, Lead, Conversation } from './types';
import Dashboard from '@components/Dashboard';
import BotList from '@components/BotList';
import BotEditor from '@components/BotEditor';
import LeadsTable from '@components/LeadsTable';
import ConversationHistory from '@components/ConversationHistory';
import ChatWidget from '@components/ChatWidget';
import Login from '@components/Login';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [chatbots, setChatbots] = useState<ChatbotConfig[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load auth from sessionStorage on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('bf_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (token: string) => {
    setIsAuthenticated(true);
    sessionStorage.setItem('bf_auth', 'true');
    sessionStorage.setItem('bf_token', token);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('bf_auth');
    sessionStorage.removeItem('bf_token');
  };

  // Load data from Server (and localStorage fallback) on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [botsRes, leadsRes] = await Promise.all([
          fetch('/api/admin/bots'),
          fetch('/api/admin/leads')
        ]);

        if (botsRes.ok) {
          const serverBots = await botsRes.json();
          if (serverBots.length > 0) setChatbots(serverBots);
        }

        if (leadsRes.ok) {
          const serverLeads = await leadsRes.json();
          if (serverLeads.length > 0) setLeads(serverLeads);
        }
      } catch (err) {
        console.warn("No se pudo conectar con el servidor para cargar datos, usando localStorage.");
        const savedBots = localStorage.getItem('bf_bots');
        const savedLeads = localStorage.getItem('bf_leads');
        const savedConvs = localStorage.getItem('bf_convs');

        if (savedBots) setChatbots(JSON.parse(savedBots));
        if (savedLeads) setLeads(JSON.parse(savedLeads));
        if (savedConvs) setConversations(JSON.parse(savedConvs));
      }
    };

    fetchData();
  }, []);

  // Save data to localStorage and Sync to Server
  useEffect(() => {
    localStorage.setItem('bf_bots', JSON.stringify(chatbots));

    // Sync to Server
    const syncToServer = async () => {
      try {
        await fetch('/api/admin/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bots: chatbots })
        });
      } catch (err) {
        console.error("Error sincronizando con el servidor:", err);
      }
    };

    if (chatbots.length > 0) syncToServer();
  }, [chatbots]);

  useEffect(() => {
    localStorage.setItem('bf_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('bf_convs', JSON.stringify(conversations));
  }, [conversations]);

  const handleCreateBot = () => {
    setEditingBotId(null);
    setView('editor');
  };

  const handleEditBot = (id: string) => {
    setEditingBotId(id);
    setView('editor');
  };

  const handleSaveBot = (newBot: ChatbotConfig) => {
    setChatbots(prev => {
      const exists = prev.find(b => b.id === newBot.id);
      if (exists) {
        return prev.map(b => b.id === newBot.id ? newBot : b);
      }
      return [...prev, newBot];
    });
    setView('chatbots');
  };

  const handleDeleteBot = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este chatbot?')) {
      setChatbots(prev => prev.filter(b => b.id !== id));
      setLeads(prev => prev.filter(l => l.botId !== id));
      setConversations(prev => prev.filter(c => c.botId !== id));
    }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard chatbots={chatbots} leads={leads} conversations={conversations} onNavigate={setView} />;
      case 'chatbots':
        return <BotList chatbots={chatbots} onEdit={handleEditBot} onDelete={handleDeleteBot} onCreate={handleCreateBot} />;
      case 'editor':
        const botToEdit = chatbots.find(b => b.id === editingBotId);
        return <BotEditor bot={botToEdit} onSave={handleSaveBot} onCancel={() => setView('chatbots')} />;
      case 'leads':
        return <LeadsTable leads={leads} chatbots={chatbots} />;
      case 'history':
        return <ConversationHistory conversations={conversations} chatbots={chatbots} />;
      default:
        return <Dashboard chatbots={chatbots} leads={leads} conversations={conversations} onNavigate={setView} />;
    }
  };

  // CHECK FOR EMBED MODE
  const path = window.location.pathname;
  if (path.startsWith('/embed/')) {
    const botId = path.split('/embed/')[1];
    const bot = chatbots.find(b => b.id === botId);

    if (!bot) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-50 p-4 text-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Chatbot No Encontrado</h2>
            <p className="text-slate-500">Es posible que el ID sea incorrecto o el bot haya sido eliminado.</p>
          </div>
        </div>
      );
    }

    // In embed mode, we want a full-screen chat widget
    return (
      <div className="h-screen w-full bg-white">
        <ChatWidget config={bot} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Bot size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">BotForge</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'dashboard' ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Panel de Control</span>
          </button>

          <button
            onClick={() => setView('chatbots')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'chatbots' || view === 'editor' ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">Mis Chatbots</span>
          </button>

          <button
            onClick={() => setView('leads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'leads' ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Users size={20} />
            <span className="font-medium">Leads Capturados</span>
          </button>

          <button
            onClick={() => setView('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'history' ? 'bg-indigo-600' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <ChevronRight size={20} />
            <span className="font-medium">Historial</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">AD</div>
              <div className="text-sm">
                <p className="font-semibold">Admin</p>
                <p className="text-slate-500 text-xs text-white/50">Total Access</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
