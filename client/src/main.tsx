import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set base URL for routing
const base = document.querySelector('base');
if (!base) {
  const baseElement = document.createElement('base');
  baseElement.href = '/';
  document.head.appendChild(baseElement);
}

createRoot(document.getElementById("root")!).render(<App />);
