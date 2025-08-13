import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Controlled mount
// export function mountReact(el: HTMLElement) {
//   ReactDOM.createRoot(el).render(
//     <React.StrictMode>
//       <App />
//     </React.StrictMode>,
//   );
// }

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
