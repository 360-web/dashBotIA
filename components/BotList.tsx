
import React from 'react';
import { Edit2, Trash2, Plus, ExternalLink, Code, CheckCircle2, PauseCircle } from 'lucide-react';
import { ChatbotConfig } from '../types';

interface BotListProps {
  chatbots: ChatbotConfig[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const BotList: React.FC<BotListProps> = ({ chatbots, onEdit, onDelete, onCreate }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mis Chatbots</h2>
          <p className="text-slate-500 mt-1">Gestiona los asistentes virtuales de tus clientes.</p>
        </div>
        <button 
          onClick={onCreate}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} /> Crear Chatbot
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatbots.map((bot) => (
          <div key={bot.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-3 bg-indigo-500" style={{ backgroundColor: bot.primaryColor }}></div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    {bot.logoUrl ? (
                      <img src={bot.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 font-bold">{bot.clientName.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{bot.clientName}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {bot.status === 'active' ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                          <CheckCircle2 size={10} /> Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                          <PauseCircle size={10} /> Pausado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(bot.id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(bot.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Token Limit:</span>
                  <span className="font-medium text-slate-700">{bot.maxTokens} char</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Captura de Leads:</span>
                  <span className={`font-medium ${bot.captureLeads ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {bot.captureLeads ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Creado:</span>
                  <span className="font-medium text-slate-700">{new Date(bot.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-2">
                <button 
                  onClick={() => {
                    const snippet = `<script src="https://botforge.api/widget.js?id=${bot.secretId}"></script>`;
                    navigator.clipboard.writeText(snippet);
                    alert('Snippet copiado al portapapeles!');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  <Code size={16} /> Snippet
                </button>
                <button 
                  className="px-3 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                  onClick={() => onEdit(bot.id)}
                >
                  Config
                </button>
              </div>
            </div>
          </div>
        ))}

        {chatbots.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <Plus size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No hay chatbots todavía</h3>
            <p className="text-slate-500 mt-1 max-w-xs">Crea tu primer chatbot personalizado para un cliente en solo unos segundos.</p>
            <button 
              onClick={onCreate}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Empezar ahora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotList;
