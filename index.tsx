import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
const loadingOverlay = document.getElementById('loading-state');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  if (loadingOverlay) {
    setTimeout(() => {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 500);
    }, 1000);
  }
}
