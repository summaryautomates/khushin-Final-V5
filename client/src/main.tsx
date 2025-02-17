
import { createRoot } from "react-dom/client";
import App from "./App";

// Global styles
import "./index.css";

// Create root element and render app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);
root.render(<App />);
