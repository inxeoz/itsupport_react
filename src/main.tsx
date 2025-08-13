import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Controlled mount
export function mountReact(_el: HTMLElement) {
  ReactDOM.createRoot(document.getElementById("root_itsupport")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

ReactDOM.createRoot(document.getElementById("root_itsupport")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
