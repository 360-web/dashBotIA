const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del build de React
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Base de datos ultra-simple (JSON)
const dbPath = path.join(__dirname, 'db.json');
const getDb = () => {
    try {
        if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ bots: [], leads: [], logs: [] }));
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
        return { bots: [], leads: [], logs: [] };
    }
};

const saveDb = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// API de Login
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === adminPass) {
        res.json({ success: true, token: 'session_' + Date.now() });
    } else {
        res.status(401).json({ success: false, message: 'Password incorrecto' });
    }
});

// Obtener Bots
app.get('/api/bots', (req, res) => {
    res.json(getDb().bots);
});

// Guardar Bot
app.post('/api/bots', (req, res) => {
    const db = getDb();
    const bot = req.body;
    const index = db.bots.findIndex(b => b.id === bot.id);
    if (index !== -1) {
        db.bots[index] = bot;
    } else {
        db.bots.push(bot);
    }
    saveDb(db);
    res.json({ success: true });
});

// Chat API (Gemini)
app.post('/api/chat', async (req, res) => {
    const { botId, message, history } = req.body;
    const db = getDb();
    const bot = db.bots.find(b => b.id === botId);

    if (!bot) return res.status(404).json({ error: 'Bot no encontrado' });

    try {
        const apiKey = bot.apiKey || process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: bot.aiModel || "gemini-1.5-flash" });

        const maxH = bot.maxHistoryMessages || 10;
        const recentHistory = history.slice(-maxH);

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "System Prompt: " + (bot.knowledgeBase || "") }] },
                { role: "model", parts: [{ text: "Entendido." }] },
                ...recentHistory.map(h => ({
                    role: h.role,
                    parts: [{ text: h.text }]
                }))
            ],
        });

        const result = await chat.sendMessage(message);
        res.json({ text: result.response.text() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook de WhatsApp (Básico de verificación)
app.get('/api/whatsapp/webhook/:botId', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const db = getDb();
    const bot = db.bots.find(b => b.id === req.params.botId);

    if (mode === 'subscribe' && token === (bot?.whatsappWebhookVerifyToken || '123456')) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Redirigir todo lo demás al Index del panel (Single Page App)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
});
