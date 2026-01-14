
import React, { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

interface LoginProps {
    onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Intentamos llamar a la API de login
            // En desarrollo local esto puede fallar si el server no está arriba, 
            // así que daremos un fallback básico.
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                onLogin(data.token);
            } else {
                setError('Contraseña incorrecta');
            }
        } catch (err) {
            // Fallback para cuando el servidor no está corriendo (solo en local)
            if (password === 'admin123') {
                onLogin('local_dev_token');
            } else {
                setError('No se pudo conectar con el servidor o contraseña incorrecta.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full animate-in zoom-in-95 duration-500">
                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden p-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Lock className="text-white" size={32} />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Acceso Privado</h1>
                        <p className="text-slate-500 mt-2 font-medium">BotForge Administrator Panel</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña de Administrador</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center text-xl tracking-[0.5em]"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-rose-500 text-sm font-medium text-center animate-shake">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : (
                                <>
                                    <LogIn size={20} />
                                    Entrar al Panel
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">BotForge AI © 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
