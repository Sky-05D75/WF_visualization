import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "katex/dist/katex.min.css";
import "./app/styles.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
