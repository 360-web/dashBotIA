import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatbotConfig, Message } from "../types";

export async function generateBotResponse(
  config: ChatbotConfig,
  history: Message[],
  userInput: string
): Promise<string> {
  // En modo real (fuera de simulaciones puras), usamos el backend como proxy.
  // Esto protege las API Keys y permite usar la base de datos del servidor.
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botId: config.id,
        message: userInput,
        history: history.map(m => ({ role: m.role, text: m.text }))
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.text || "No se pudo obtener respuesta.";
    }
  } catch (err) {
    console.warn("Backend /api/chat no disponible, usando fallback local...");
  }

  // FALLBACK LOCAL (Solo para cuando el backend no responde o estamos en modo preview offline)
  const apiKey = config.apiKey || ((import.meta as any).env?.VITE_GEMINI_API_KEY as string);

  // 1. Fallback si no hay API Key
  if (!apiKey) {
    const base = config.knowledgeBase?.trim() ||
      `Eres un asistente para ${config.clientName}. Responde de forma breve y amigable.`;
    return `${base}\n\n[SIMULACIÓN - CONFIGURA TU API KEY]\nUsuario: ${userInput}`.slice(0, config.maxTokens || 250);
  }

  const systemPrompt = config.knowledgeBase?.trim() ||
    `Eres un asistente virtual profesional y útil para ${config.clientName || 'este sitio web'}.
Tus respuestas deben ser precisas, amables y basadas en la información disponible.
Si no sabes la respuesta, sugiere contactar a soporte humano.`;

  try {
    // 2. Lógica para OpenRouter
    if (config.aiProvider === 'openrouter') {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin, // Required by OpenRouter
          "X-Title": "BotForge Client"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo", // Default económico, o usa config.model si lo agregamos luego
          messages: [
            { role: "system", content: systemPrompt },
            ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
            { role: "user", content: userInput }
          ],
          max_tokens: config.maxTokens || 250,
        })
      });

      if (!response.ok) throw new Error(`OpenRouter API Error: ${response.statusText}`);

      const data = await response.json();
      return data.choices[0]?.message?.content || "No se pudo obtener respuesta.";
    }

    // 3. Lógica para Google Gemini (Por defecto)
    else {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = config.aiModel || "gemini-1.5-flash";
      const model = genAI.getGenerativeModel({ model: modelName });

      const maxHistory = config.maxHistoryMessages || 10;
      const historyToPass = history.slice(-maxHistory);

      const chatSession = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `INSTRUCCIONES DEL SISTEMA:\n${systemPrompt}` }],
          },
          {
            role: "model",
            parts: [{ text: "Entendido. Actuaré acorde a esas instrucciones y base de conocimiento." }],
          },
          ...historyToPass.map(m => ({
            role: m.role,
            parts: [{ text: m.text }],
          }))
        ],
      });

      const result = await chatSession.sendMessage(userInput);
      return result.response.text().slice(0, config.maxTokens || 500);
    }

  } catch (error) {
    console.error("Error generando respuesta:", error);
    return "Lo siento, hubo un error conectando con la inteligencia artificial.";
  }
}
