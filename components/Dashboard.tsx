
import { Users, MessageSquare, Bot, ArrowUpRight, TrendingUp, RefreshCw, Server } from 'lucide-react';
import React, { useState } from 'react';
import { ChatbotConfig, Lead, Conversation, AppView } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  chatbots: ChatbotConfig[];
  leads: Lead[];
  conversations: Conversation[];
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ chatbots, leads, conversations, onNavigate }) => {
  const [serverUrl, setServerUrl] = useState(window.location.origin);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${serverUrl}/api/admin/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bots: chatbots }),
      });
      if (response.ok) {
        alert('Sincronización exitosa con el servidor.');
      } else {
        alert('Error al sincronizar. Verifica que el servidor esté corriendo.');
      }
    } catch (e) {
      alert('No se pudo conectar al servidor. ' + e);
    }
    setIsSyncing(false);
  };

  const stats = [
    { title: 'Chatbots Activos', value: chatbots.filter(b => b.status === 'active').length, icon: <Bot size={24} className="text-indigo-600" />, bgColor: 'bg-indigo-50' },
    { title: 'Leads Totales', value: leads.length, icon: <Users size={24} className="text-emerald-600" />, bgColor: 'bg-emerald-50' },
    { title: 'Conversaciones', value: conversations.length, icon: <MessageSquare size={24} className="text-amber-600" />, bgColor: 'bg-amber-50' },
    { title: 'Uso de Tokens (Est.)', value: '~' + (conversations.reduce((acc, c) => acc + c.messages.length, 0) * 150).toLocaleString(), icon: <TrendingUp size={24} className="text-rose-600" />, bgColor: 'bg-rose-50' },
  ];

  // Prepare data for chart
  const chartData = chatbots.map(bot => ({
    name: bot.clientName,
    leads: leads.filter(l => l.botId === bot.id).length,
    chats: conversations.filter(c => c.botId === bot.id).length,
  })).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bienvenido de nuevo</h2>
          <p className="text-slate-500 mt-1">Aquí tienes un resumen de tus chatbots y rendimiento.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm mr-2">
            <Server size={14} className="text-slate-400" />
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="text-xs w-48 outline-none text-slate-600 font-mono bg-transparent"
              placeholder="http://localhost:3000"
            />
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-sm ${isSyncing ? 'opacity-70 cursor-wait' : ''}`}
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Server'}
          </button>

          <button
            onClick={() => onNavigate('chatbots')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <ArrowUpRight size={18} /> Bots
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className={`p-4 rounded-xl ${stat.bgColor}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-6 text-slate-800">Rendimiento por Cliente</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="leads" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} name="Leads" />
                <Bar dataKey="chats" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} name="Conversaciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-xl font-bold mb-6 text-slate-800">Leads Recientes</h3>
          <div className="space-y-4">
            {leads.slice(0, 5).reverse().map((lead) => {
              const bot = chatbots.find(b => b.id === lead.botId);
              return (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                      {bot?.clientName || 'Unknown'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(lead.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
            {leads.length === 0 && (
              <div className="text-center py-12 text-slate-400 italic">
                No hay leads capturados todavía.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
