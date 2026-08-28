import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root')!;
createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (typeof window !== 'undefined') {
  window.addEventListener('error', (ev) => {
    console.error('Global error:', ev.error || ev.message);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:#0f172a;color:#f4f4f5;z-index:9999;padding:24px;font-family:system-ui,sans-serif;';
    overlay.innerHTML = '<h1>Erro inesperado</h1><pre>' + String(ev.error || ev.message) + '</pre>';
    document.body.appendChild(overlay);
  });

  window.addEventListener('unhandledrejection', (ev) => {
    console.error('Unhandled rejection:', ev.reason);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:#0f172a;color:#f4f4f5;z-index:9999;padding:24px;font-family:system-ui,sans-serif;';
    overlay.innerHTML = '<h1>Erro não tratado</h1><pre>' + String(ev.reason) + '</pre>';
    document.body.appendChild(overlay);
  });
}
