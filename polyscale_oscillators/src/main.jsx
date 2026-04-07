import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AudioContextProvider } from "./audio/AudioContextProvider";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AudioContextProvider>
      <App />
    </AudioContextProvider>
  </React.StrictMode>,
);
