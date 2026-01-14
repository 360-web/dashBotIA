
import React, { useState, useEffect } from 'react';
import { Save, X, Settings, Palette, BrainCircuit, Upload, MessageCircle, Code, Copy, Check, Phone } from 'lucide-react';
import { ChatbotConfig } from '../types';
import ChatWidget from './ChatWidget';

interface BotEditorProps {
  bot?: ChatbotConfig;
  onSave: (bot: ChatbotConfig) => void;
  onCancel: () => void;
}

const BotEditor: React.FC<BotEditorProps> = ({ bot, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ChatbotConfig>({
    id: bot?.id || Math.random().toString(36).substring(7),
    clientName: bot?.clientName || '',
    knowledgeBase: bot?.knowledgeBase || '',
    primaryColor: bot?.primaryColor || '#6366f1',
    botMessageColor: bot?.botMessageColor || '#f1f5f9',
    userMessageColor: bot?.userMessageColor || '#6366f1',
    buttonColor: bot?.buttonColor || '#6366f1',
    logoUrl: bot?.logoUrl || '',
    maxTokens: bot?.maxTokens || 250,
    captureLeads: bot?.captureLeads ?? true,
    status: bot?.status || 'active',
    createdAt: bot?.createdAt || Date.now(),
    secretId: bot?.secretId || Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
    aiProvider: bot?.aiProvider || 'gemini',
    apiKey: bot?.apiKey || '',
    aiModel: bot?.aiModel || 'gemini-1.5-flash',
    maxHistoryMessages: bot?.maxHistoryMessages || 10,
    whatsappNumber: bot?.whatsappNumber || '',
    whatsappToken: bot?.whatsappToken || '',
    whatsappWebhookVerifyToken: bot?.whatsappWebhookVerifyToken || Math.random().toString(36).substring(7),
  });

  const [activeTab, setActiveTab] = useState<'info' | 'design' | 'logic' | 'deploy' | 'whatsapp'>('info');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
        type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName) return alert('El nombre del cliente es obligatorio');
    onSave(formData);
  };

  return (
    <div className="animate-in slide-in-from-right-8 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {bot ? `Editando: ${bot.clientName}` : 'Nuevo Chatbot'}
          </h2>
          <p className="text-slate-500 mt-1">Configura el cerebro y apariencia del asistente.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium flex items-center gap-2"
          >
            <X size={18} /> Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <Save size={18} /> Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Pane */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <BrainCircuit size={18} /> Información y Entrenamiento
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'design' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Palette size={18} /> Diseño Visual
            </button>
            <button
              onClick={() => setActiveTab('logic')}
              className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'logic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Settings size={18} /> Configuración Técnica
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'whatsapp' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Phone size={18} /> WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'deploy' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Code size={18} /> Instalación
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
            {activeTab === 'info' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Cliente / Proyecto</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ej. Clínica Dental Sonrisas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Conocimiento Base (Entrenamiento)</label>
                  <p className="text-xs text-slate-400 mb-3">Describe el negocio, servicios, horarios e instrucciones específicas para la IA.</p>
                  <textarea
                    name="knowledgeBase"
                    rows={12}
                    value={formData.knowledgeBase}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm leading-relaxed"
                    placeholder="Eres un asistente experto para Clínica Dental Sonrisas. Ofrecemos limpieza dental, ortodoncia... Abrimos de Lunes a Viernes de 9am a 6pm."
                  />
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Color Primario (Cabecera)</label>
                    <div className="flex gap-3">
                      <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                      <input type="text" value={formData.primaryColor} onChange={handleChange} name="primaryColor" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 uppercase text-sm font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Burbuja Bot</label>
                    <div className="flex gap-3">
                      <input type="color" name="botMessageColor" value={formData.botMessageColor} onChange={handleChange} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                      <input type="text" value={formData.botMessageColor} onChange={handleChange} name="botMessageColor" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 uppercase text-sm font-mono" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Burbuja Usuario</label>
                    <div className="flex gap-3">
                      <input type="color" name="userMessageColor" value={formData.userMessageColor} onChange={handleChange} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                      <input type="text" value={formData.userMessageColor} onChange={handleChange} name="userMessageColor" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 uppercase text-sm font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Color de Botones</label>
                    <div className="flex gap-3">
                      <input type="color" name="buttonColor" value={formData.buttonColor} onChange={handleChange} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                      <input type="text" value={formData.buttonColor} onChange={handleChange} name="buttonColor" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 uppercase text-sm font-mono" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Logotipo del Bot</label>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {formData.logoUrl ? (
                        <>
                          <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setFormData(p => ({ ...p, logoUrl: '' }))}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                          >
                            <X size={24} />
                          </button>
                        </>
                      ) : (
                        <Upload size={28} className="text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                          <Upload size={18} />
                          <span>Subir desde archivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        </span>
                        <input
                          type="text"
                          name="logoUrl"
                          value={formData.logoUrl}
                          onChange={handleChange}
                          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                          placeholder="O pega una URL directa de imagen..."
                        />
                      </div>
                      <p className="text-xs text-slate-400">
                        Sube una imagen (JPG/PNG) o pega un enlace directo. Recomendado: Cuadrado 512x512px.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logic' && (
              <div className="space-y-8 animate-in fade-in duration-300">

                {/* AI Provider Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BrainCircuit size={20} className="text-indigo-600" />
                    Modelo de Inteligencia Artificial
                  </h3>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Proveedor de IA</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, aiProvider: 'gemini' }))}
                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${formData.aiProvider === 'gemini'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        Google Gemini
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, aiProvider: 'openrouter' }))}
                        className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${formData.aiProvider === 'openrouter'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        OpenRouter
                      </button>
                    </div>
                  </div>

                  {formData.aiProvider === 'gemini' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        Modelo Específico
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Recomendado</span>
                      </label>
                      <select
                        name="aiModel"
                        value={formData.aiModel || 'gemini-1.5-flash'}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white font-medium"
                      >
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Más rápido y eficiente)</option>
                        <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash-8B (Ultra veloz para tareas simples)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Razonamiento complejo - Más lento)</option>
                        <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental - Próxima generación)</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-2 italic px-1">
                        * Los modelos <strong>Flash</strong> son los más adecuados para asistentes por su respuesta instantánea.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">API Key</label>
                    <input
                      type="password"
                      name="apiKey"
                      value={formData.apiKey || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                      placeholder={formData.aiProvider === 'gemini' ? "AIzaSy..." : "sk-or-..."}
                    />
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      Tu llave API se almacena encriptada y nunca se expone públicamente.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Límite de Tokens (Caracteres)</label>
                  <p className="text-xs text-slate-400 mb-4">Controla qué tan largas serán las respuestas del chatbot.</p>
                  <div className="flex items-center gap-6">
                    <input
                      type="range"
                      name="maxTokens"
                      min="150"
                      max="1000"
                      step="50"
                      value={formData.maxTokens}
                      onChange={handleChange}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="w-20 text-center font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                      {formData.maxTokens}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-slate-700">Cant. de Memoria (Mensajes recordados)</label>
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">{formData.maxHistoryMessages || 10}</span>
                  </div>
                  <input
                    type="range"
                    name="maxHistoryMessages"
                    min="1"
                    max="40"
                    value={formData.maxHistoryMessages || 10}
                    onChange={(e) => setFormData(p => ({ ...p, maxHistoryMessages: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                    <span>Económico</span>
                    <span>Contexto Largo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-4 italic leading-relaxed">
                    * Define cuántos mensajes anteriores recordará la IA. Un valor alto permite conversaciones más fluidas pero consume más tokens.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900">Captura de Leads</h4>
                      <p className="text-xs text-slate-500">Solicitar datos de contacto automáticamente.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.captureLeads}
                        onChange={(e) => setFormData(p => ({ ...p, captureLeads: e.target.checked }))}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  {formData.captureLeads && (
                    <div className="space-y-2 mt-4 text-sm text-slate-600">
                      <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Se pedirá Nombre</p>
                      <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Se pedirá Correo Electrónico</p>
                      <p className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Se pedirá Teléfono</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Estado del Bot</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-6">
                  <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                    <Phone size={20} /> Configuración de WhatsApp
                  </h3>
                  <p className="text-sm text-emerald-700">
                    Conecta tu bot con la API oficial de WhatsApp Business (Cloud API).
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Número de Teléfono (ID de teléfono)</label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="Ej. 104526845214563"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Token de Acceso Permanente</label>
                    <input
                      type="password"
                      name="whatsappToken"
                      value={formData.whatsappToken}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-sm"
                      placeholder="EAAGz..."
                    />
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Datos para Webhook</h4>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Callback URL</label>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          type="text"
                          value={`${window.location.origin}/api/whatsapp/webhook/${formData.id}`}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp/webhook/${formData.id}`)}
                          className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Verify Token</label>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          type="text"
                          value={formData.whatsappWebhookVerifyToken}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(formData.whatsappWebhookVerifyToken || '')}
                          className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deploy' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-6">
                  <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Code size={20} /> Integración Web
                  </h3>
                  <p className="text-sm text-indigo-700">
                    Copie y pegue el siguiente código en la sección <code>&lt;head&gt;</code> o antes del cierre <code>&lt;/body&gt;</code> del sitio web de su cliente.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Código JavaScript para Incrustar</label>
                  <div className="relative group">
                    <pre className="bg-slate-900 text-slate-50 p-6 rounded-xl text-sm font-mono overflow-x-auto border border-slate-700 leading-relaxed shadow-lg">
                      {`<script>
  window.chatbotConfig = {
    botId: "${formData.id}",
    apiUrl: "${window.location.origin}",
    theme: {
      primary: "${formData.primaryColor}",
      position: "bottom-right"
    }
  };
</script>
<script src="${window.location.origin}/widget.js" async></script>`}
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(`<script>window.chatbotConfig={botId:"${formData.id}",apiUrl:"${window.location.origin}"};</script><script src="${window.location.origin}/widget.js" async></script>`)}
                      className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-indigo-600 text-white rounded-lg transition-colors border border-slate-600 group-hover:block"
                      title="Copiar código"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Enlace Directo</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      type="text"
                      value={`${window.location.origin}/embed/${formData.id}`}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/embed/${formData.id}`)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-8 h-fit space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full w-fit">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> VISTA PREVIA EN TIEMPO REAL
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden aspect-[3/4]">
            <ChatWidget config={formData} isPreview={true} />
          </div>
        </div>
      </div>
    </div >
  );
};

// Helper internal component
const CheckCircle = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default BotEditor;
