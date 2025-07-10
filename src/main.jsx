// src/main.jsx
// Ponto de entrada da aplicação React

import { StrictMode } from "react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; 
import { ThemeProvider } from "./context/ThemeContext";
import { ModalProvider } from "./context/ModalContext.jsx"; // <-- Importe o ModalProvider
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <ModalProvider> {/* ModalProvider vem depois, para ter acesso ao tema */}
        <App /> 
      </ModalProvider>
    </ThemeProvider>
  </StrictMode>
);