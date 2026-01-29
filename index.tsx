import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root');
const loadingOverlay = document.getElementById('loading-state');

if (container) {
  const root = createRoot(container);
  
  const hideLoading = () => {
    if (loadingOverlay) {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 500);
    }
  };

  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    // دڵنیابوون لەوەی شاشەی بارکردن لادەچێت تەنانەت ئەگەر کێشەی نێتۆرک هەبێت
    window.addEventListener('load', hideLoading);
    setTimeout(hideLoading, 1500); // وەک پاڵپشت
  } catch (error) {
    console.error("React Render Error:", error);
    setTimeout(hideLoading, 500);
  }
}