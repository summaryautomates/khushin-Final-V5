import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
// Import our error handler for Vite in development mode
import "./lib/vitePatcher";

// Set base URL for routing
const base = document.querySelector('base');
if (!base) {
  const baseElement = document.createElement('base');
  baseElement.href = '/';
  document.head.appendChild(baseElement);
}

// Handle global unhandled rejections - completely silent for Vite HMR errors
window.addEventListener('unhandledrejection', (event) => {
  // Suppress specific Vite HMR errors that are expected during development
  // This is the earliest handler that can catch these errors
  const isViteError = 
    event.reason?.stack?.includes('@vite/client') || 
    event.reason?.message?.includes('Failed to fetch') ||
    event.reason?.message?.includes('Network Error') ||
    event.reason?.message?.includes('WebSocket') ||
    event.reason?.message?.includes('Vite') ||
    event.reason?.message?.includes('hmr') ||
    event.reason?.message?.includes('HMR');
  
  if (isViteError || (typeof event.reason === 'object' && Object.keys(event.reason).length === 0)) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true); // Use capture phase to intercept before other handlers

// Use the non-null assertion operator (!) to tell TypeScript that root won't be null
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
