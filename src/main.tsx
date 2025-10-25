import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Create root container
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found!");
}

const root = createRoot(container);

// Add required theme classes
document.documentElement.classList.add('dark');

// Render app
root.render(<App />);
