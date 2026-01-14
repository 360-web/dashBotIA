# Guía de Subida a Hostinger - BotForge Admin

He preparado todos los archivos para que el despliegue sea profesional y seguro. Sigue estos pasos:

## 1. Subir cambios a tu GitHub
Como no tengo acceso directo al comando `git` en tu terminal, por favor ejecuta estos comandos en tu computadora (desde la carpeta del proyecto):

```bash
git add .
git commit -m "Preparación para Hostinger: build fix, backend proxy y persistencia"
git push origin main
```

## 2. Configurar en Hostinger (hPanel)
1. Ve a tu panel de Hostinger -> **Sitios Web** -> **Node.js**.
2. **Conectar Repositorio:** Selecciona tu repo `https://github.com/360-web/dashBotIA`.
3. **Configuración de la App:**
   - **Startup File (Archivo de inicio):** `server/index.js` (He actualizado este archivo para ser el servidor principal).
   - **Versión de Node.js:** Selecciona la más reciente (v20 o superior).
4. **Variables de Entorno (Environment Variables):**
   Haz clic en "Variables de Entorno" y añade:
   - `PORT`: `3000` (o el que te asigne Hostinger).
   - `ADMIN_PASSWORD`: Tu contraseña elegida (por defecto es `admin123`).
   - `GEMINI_API_KEY`: Tu llave maestra de Google AI Studio.

## 3. Instalación de Dependencias
En el panel de Hostinger, busca el botón **"NPM Install"** y ejecútalo. Esto instalará `express`, `cors`, `lowdb`, etc.

## 4. ¡Listo!
Tu panel estará disponible en la URL de tu dominio. 
- Los cambios ahora se guardan en el servidor (`server/db.json`), por lo que no perderás datos al cambiar de navegador.
- Las peticiones de IA ahora pasan por el servidor, protegiendo tus llaves API.

---
### Cambios técnicos realizados:
- **Vite Config:** Creado `vite.config.ts` para permitir el build.
- **Backend Unificado:** El archivo `server/index.js` ahora sirve la carpeta `dist` y actúa como proxy para la IA.
- **Persistencia Real:** El dashboard ahora carga y guarda los bots directamente en el servidor.
- **Snippets Dinámicos:** Los códigos de instalación ahora detectan automáticamente tu dominio actual.
