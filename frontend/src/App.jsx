import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "./context/Socket";
import Game from "./pages/Game";
import Home from "./pages/Home";
import { useUser } from "./context/User";

const App = () => {
  const navigate = useNavigate();

  const socket = useSocket();
  const { setUser } = useUser();

  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/") window.location.assign("/");
  }, []);

  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, [socket]);

  const setupListeners = () => {
    if (!socket) return;

    const onGoingGame = JSON.parse(localStorage.getItem("ongoing-game"));
    if (onGoingGame) {
      socket.emit(
        "request-continue-game",
        onGoingGame.roomId,
        onGoingGame.playerId
      );
    }

    socket.on("redirect-home", () => navigate("/"));
    socket.on("response-continue-game", (player, roomId) => {
      // ! Create a game context

      setUser({ ...player, boardSide: player.color, isPlaying: true });
      navigate(`/game/${roomId}`);
    });
  };

  const removeListeners = () => {
    if (!socket) return;
    socket.off("redirect-home");
  };

  if (!socket) return;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:roomId" element={<Game />} />
    </Routes>
  );
};

export default App;
