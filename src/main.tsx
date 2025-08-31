import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
// import "./styles/index.css";
import "@/styles/globals.css";
// import "./styles/isolated.css";

// Controlled mount
export function mountReact(el: HTMLElement) {
  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

//uncomment this only when this project intend to run by project (self)
//
// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// );

ReactDOM.createRoot(document.getElementById("root_itsupport")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
