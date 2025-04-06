import { createRoot } from "react-dom/client";
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

// Handle global unhandled rejections - silent for typical Vite HMR errors
window.addEventListener('unhandledrejection', (event) => {
  // Suppress specific Vite HMR errors that are expected during development
  if (
    event.reason?.stack?.includes('@vite/client') || 
    event.reason?.message?.includes('Failed to fetch')
  ) {
    event.preventDefault();
    return;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
