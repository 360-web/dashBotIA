
import React, { useState } from 'react';
import { Search, Download, Filter, Mail, Phone, Calendar, User } from 'lucide-react';
import { Lead, ChatbotConfig } from '../types';

interface LeadsTableProps {
  leads: Lead[];
  chatbots: ChatbotConfig[];
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, chatbots }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  const exportCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Chatbot', 'Fecha'];
    const rows = filteredLeads.map(l => [
      l.name,
      l.email,
      l.phone,
      chatbots.find(b => b.id === l.botId)?.clientName || 'N/A',
      new Date(l.timestamp).toLocaleString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Leads Capturados</h2>
          <p className="text-slate-500 mt-1">Personas interesadas que dejaron sus datos.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
        >
          <Download size={18} /> Exportar CSV
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email o teléfono..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors font-medium border border-slate-200">
              <Filter size={18} /> Filtrar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-8 py-5">Prospecto</th>
                <th className="px-8 py-5">Información de Contacto</th>
                <th className="px-8 py-5">Chatbot Origen</th>
                <th className="px-8 py-5">Fecha Captura</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const bot = chatbots.find(b => b.id === lead.botId);
                return (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                          {lead.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" /> {lead.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" /> {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bot?.primaryColor }}></div>
                        {bot?.clientName || 'Asistente'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(lead.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm underline-offset-4 hover:underline">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                    No se encontraron leads con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsTable;
