// Service worker do Bancada instalado no celular.
// De propósito, NÃO guarda o app nem o banco de questões: tudo em /app/ continua saindo
// só com sessão válida (auth_request), senão o limite de 2 aparelhos, o vencimento e o
// bloqueio de conta deixariam de valer no aparelho. Só sem internet ele responde, com
// uma tela avisando — em vez da página de erro do navegador.
const CASCA = 'bancada-casca-v1';
const ARQUIVOS = ['/offline.html', '/estilo.css', '/icone-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CASCA).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n.startsWith('bancada-casca-') && n !== CASCA).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;   // CSS, JS, /api: o navegador busca direto
  e.respondWith(fetch(e.request).catch(() => caches.match('/offline.html')));
});
