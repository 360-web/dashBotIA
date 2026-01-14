
(function () {
    const config = window.chatbotConfig;

    if (!config || !config.botId) {
        console.error("BotForge: Configuración no encontrada (window.chatbotConfig).");
        return;
    }

    // --- 1. Crear Estilos CSS ---
    const style = document.createElement('style');
    style.innerHTML = `
    #bf-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #bf-launcher {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${config.theme?.primary || '#6366f1'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #bf-launcher:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    #bf-launcher svg {
      width: 32px;
      height: 32px;
      color: white;
    }
    #bf-iframe-container {
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 380px;
      height: 600px;
      max-height: 80vh;
      background: white;
      border-radius: 20px;
      box-shadow: 0 5px 40px rgba(0,0,0,0.16);
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(0.95);
      transition: all 0.2s ease-in-out;
      overflow: hidden;
      z-index: 999999;
    }
    #bf-iframe-container.open {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0) scale(1);
    }
    #bf-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    @media (max-width: 480px) {
      #bf-iframe-container {
        width: 100%;
        height: 100%;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  `;
    document.head.appendChild(style);

    // --- 2. Crear Elementos DOM ---
    const container = document.createElement('div');
    container.id = 'bf-widget-container';

    // Botón Lanzador
    const launcher = document.createElement('div');
    launcher.id = 'bf-launcher';
    launcher.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
  `;

    // Iframe Container
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'bf-iframe-container';

    // Iframe
    // AQUI ES DONDE APUNTA A NUESTRA APP:
    // En local: http://localhost:5173/embed/BOT_ID
    // En producción se cambiará. Usamos config.apiUrl o window.location.origin si es relativo.
    const baseUrl = config.apiUrl ? new URL(config.apiUrl).origin : 'http://localhost:5173'; // Fallback a local para dev
    const iframe = document.createElement('iframe');
    iframe.id = 'bf-iframe';
    iframe.src = `${baseUrl}/embed/${config.botId}`;

    iframeContainer.appendChild(iframe);
    document.body.appendChild(iframeContainer);

    container.appendChild(launcher);
    document.body.appendChild(container);

    // --- 3. Lógica de Apertura ---
    let isOpen = false;

    launcher.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframeContainer.classList.add('open');
            launcher.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        } else {
            iframeContainer.classList.remove('open');
            launcher.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
        }
    });

})();
