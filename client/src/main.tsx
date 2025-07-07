import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Set base URL for routing
const base = document.querySelector('base');
if (!base) {
  const baseElement = document.createElement('base');
  baseElement.href = '/';
  document.head.appendChild(baseElement);
}

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
