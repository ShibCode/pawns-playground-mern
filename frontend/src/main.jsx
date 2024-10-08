import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import Socket from "./context/Socket.jsx";
import User from "./context/User.jsx";
import Game from "./context/Game.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Socket>
      <User>
        <Game>
          <App />
        </Game>
      </User>
    </Socket>
  </BrowserRouter>
);
