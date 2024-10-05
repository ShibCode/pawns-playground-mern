import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "./context/Socket";
import Game from "./pages/Game";
import Home from "./pages/Home";
import { useUser } from "./context/User";
import Loader from "./components/Loader";

const App = () => {
  const navigate = useNavigate();

  const socket = useSocket();
  const { user, setUser } = useUser();

  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, [socket]);

  const setupListeners = () => {
    if (!socket) return;
    socket.on("redirect-home", () => navigate("/"));

    const pendingGame = JSON.parse(localStorage.getItem("ongoing-game"));

    if (pendingGame) {
      setUser({
        ...pendingGame.player,
        id: socket.id,
        boardSide: pendingGame.player?.color,
        isPlaying: true,
      });
      navigate(`/game/${pendingGame.gameId}`); // connecting to a pending game
    } else {
      setUser({
        id: socket.id,
        boardSide: "white",
        isPlaying: false,
        color: "",
      });
    }
  };

  const removeListeners = () => {
    if (!socket) return;
    socket.off("redirect-home");
  };

  if (!socket || !user)
    return (
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Loader size={48} />
        <span className="text-xl text-gray-200">
          It may take a while for the server to load up...
        </span>
      </div>
    );

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:gameId" element={<Game />} />
    </Routes>
  );
};

export default App;
