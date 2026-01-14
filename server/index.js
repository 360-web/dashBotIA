import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // CONTRASEÑA POR DEFECTO

// Middleware
app.use(cors());
app.use(express.json());
// Servir archivos estáticos del frontend (Build de React)
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Database Setup
const defaultData = { bots: [], leads: [], logs: [] };
const dbPath = path.join(__dirname, 'db.json');
const db = await JSONFilePreset(dbPath, defaultData);

// --- Rutas de Autenticación ---
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: 'session_token_' + Date.now() });
    } else {
        res.status(401).json({ error: 'Contraseña incorrecta' });
    }
});

// --- Rutas ---

// 1. Endpoint Público para el Chat (Multi-tenant)
app.post('/api/chat', async (req, res) => {
    try {
        const { botId, message, history } = req.body;

        // a. Validar Bot
        await db.read();
        const bot = db.data.bots.find(b => b.id === botId);

        if (!bot) {
            return res.status(404).json({ error: 'Bot no encontrado o inactivo.' });
        }

        if (bot.status !== 'active') {
            return res.status(403).json({ error: 'Este bot está pausado temporalmente.' });
        }

        // b. Rate Limiting / Control de Consumo (Básico)
        // Aquí podrías verificar si el cliente tiene "saldo" o tokens disponibles
        console.log(`[Log] Mensaje recibido para Bot ${bot.clientName} (${botId})`);

        // c. Llamar a la IA
        // Usamos la API Key guardada en el servidor (o en el bot config si decidimos así)
        // Por seguridad, la API Key NUNCA debe viajar desde el frontend del cliente.
        // Aquí asumimos que el bot tiene su propia apiKey guardada en la DB, o usamos una maestra.
        const apiKey = bot.apiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Error de configuración del servidor (Falta API Key).' });
        }

        let replyText = "";

        const maxHistory = bot.maxHistoryMessages || 10;
        const historyToPass = history.slice(-maxHistory);

        if (bot.aiProvider === 'openrouter') {
            // Logic for OpenRouter
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://botforge.local",
                    "X-Title": "BotForge Server"
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: bot.knowledgeBase || "Eres un asistente útil." },
                        ...historyToPass.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
                        { role: "user", content: message }
                    ]
                })
            });
            const data = await response.json();
            replyText = data.choices?.[0]?.message?.content || "Error en OpenRouter";

        } else {
            // Logic for Gemini
            const genAI = new GoogleGenerativeAI(apiKey);
            const modelName = bot.aiModel || "gemini-1.5-flash";
            const model = genAI.getGenerativeModel({ model: modelName });

            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: `System Prompt: ${bot.knowledgeBase || "Eres un asistente útil."}` }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Entendido." }],
                    },
                    ...historyToPass.map(h => ({
                        role: h.role,
                        parts: [{ text: h.text }]
                    }))
                ],
            });

            const result = await chat.sendMessage(message);
            replyText = result.response.text();
        }

        // d. Registrar Log
        db.data.logs.push({
            botId,
            timestamp: Date.now(),
            tokens: replyText.length // Estimación burda
        });
        await db.write();

        res.json({ text: replyText });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor de IA.' });
    }
});

// 2. Ruta para capturar Leads
app.post('/api/leads', async (req, res) => {
    const { botId, leadData } = req.body;
    await db.read();
    db.data.leads.push({ ...leadData, botId, timestamp: Date.now() });
    await db.write();
    res.json({ success: true });
});

// 2.5 Ruta para obtener Config de Bot (para el Widget Embed)
app.get('/api/bots/:id', async (req, res) => {
    const { id } = req.params;
    await db.read();
    const bot = db.data.bots.find(b => b.id === id);
    if (bot) {
        // IMPORTANTE: No devolver la apiKey ni secrets al frontend público si es posible
        // Pero si el frontend hace la llamada a Gemini directly (como esta ahora), la necesita.
        // Lo ideal es que el frontend llame a /api/chat y el backend use la key.
        // Por seguridad, censuramos la API Key aquí si tuviéramos backend proxy.
        // Como tu diseño actual es mixto, enviaremos todo por ahora (AVISO DE SEGURIDAD).
        res.json(bot);
    } else {
        res.status(404).json({ error: 'Bot no encontrado' });
    }
});

// --- WhatsApp Webhooks ---

// Verificación del Webhook (Requerido por Meta)
app.get('/api/whatsapp/webhook/:botId', async (req, res) => {
    const { botId } = req.params;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    await db.read();
    const bot = db.data.bots.find(b => b.id === botId);

    if (mode === 'subscribe' && token === bot?.whatsappWebhookVerifyToken) {
        console.log(`[WhatsApp] Webhook verificado para bot: ${bot.clientName}`);
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Recepción de mensajes de WhatsApp
app.post('/api/whatsapp/webhook/:botId', async (req, res) => {
    const { botId } = req.params;
    const body = req.body;

    console.log(`[WhatsApp] Mensaje recibido para botId: ${botId}`);

    // Aquí iría la lógica para:
    // 1. Extraer el mensaje del usuario de 'body'
    // 2. Llamar a generar respuesta de IA (Gemini/OpenRouter)
    // 3. Enviar la respuesta de vuelta usando la Graph API de Meta

    res.sendStatus(200);
});

// 3. Rutas administrativas: Obtener y Sincronizar Datos
app.get('/api/admin/bots', async (req, res) => {
    await db.read();
    res.json(db.data.bots);
});

app.get('/api/admin/leads', async (req, res) => {
    await db.read();
    res.json(db.data.leads);
});

app.post('/api/admin/sync', async (req, res) => {
    const { bots } = req.body;
    if (!bots) return res.status(400).send("Faltan datos");

    await db.read();
    db.data.bots = bots;
    await db.write();

    console.log(`[Admin] Sincronizados ${bots.length} bots.`);
    res.json({ success: true, count: bots.length });
});

// Cualquier otra petición que no sea API, devolver la app de React (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

const PORT = process.env.PORT || process.env.APP_PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Backend corriendo en puerto ${PORT}`);
});
