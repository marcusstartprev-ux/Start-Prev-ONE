// ============================================================
// SERVICE WORKER - START PREV CHAT
// /public/service-worker.js
// ============================================================

// Evento: Push recebido
self.addEventListener('push', event => {
  console.log('[SW] Push recebido:', event);

  let payload = {
    title: 'Start Prev',
    body: 'Voce recebeu uma nova mensagem!',
    data: {}
  };

  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch (err) {
    console.error('[SW] Erro ao parsear payload:', err);
  }

  const options = {
    body: payload.body || 'Nova mensagem',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: payload.data?.session_id || 'startprev-chat',
    renotify: true,
    requireInteraction: true,
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Abrir Chat' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Start Prev', options)
  );
});

// Evento: Clique na notificacao
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notificacao clicada:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const data = event.notification.data || {};
  const urlToOpen = data.url || '/chat';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Procura se ja tem uma aba do chat aberta
        for (const client of windowClients) {
          if (client.url.includes('/chat') && 'focus' in client) {
            // Se tiver session_id, envia mensagem para navegar
            if (data.session_id) {
              client.postMessage({
                type: 'NAVIGATE_TO_SESSION',
                session_id: data.session_id
              });
            }
            return client.focus();
          }
        }
        // Se nao tiver aba aberta, abre uma nova
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// Evento: Notificacao fechada sem acao
self.addEventListener('notificationclose', event => {
  console.log('[SW] Notificacao fechada sem acao');
});

// Evento: Instalacao do Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

// Evento: Ativacao do Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Service Worker ativado');
  event.waitUntil(clients.claim());
});
