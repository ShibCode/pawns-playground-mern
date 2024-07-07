import React, { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "./context/Socket";
import Game from "./pages/Game";
import Home from "./pages/Home";
import { useUser } from "./context/User";
import { useGame } from "./context/Game";

const App = () => {
  const navigate = useNavigate();

  const socket = useSocket();
  const { setUser } = useUser();
  const { setGame } = useGame();

  // ! <TEMP>
  // const location = useLocation();
  // useEffect(() => {
  //   if (location.pathname !== "/") window.location.assign("/");
  // }, []);
  // ! </TEMP>

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
        onGoingGame.gameId,
        onGoingGame.playerId
      );
    }

    socket.on("redirect-home", () => navigate("/"));

    socket.on("response-continue-game", (game) => {
      const player = game?.players.find(
        (player) => player.id === onGoingGame.playerId
      );

      setGame({ turn: game.turn, pieces: game.pieces, moves: game.moves });
      setUser({ ...player, boardSide: player.color, isPlaying: true });
      navigate(`/game/${game.id}`);
    });
  };

  const removeListeners = () => {
    if (!socket) return;
    socket.off("redirect-home");
    socket.off("response-continue-game");
  };

  if (!socket) return;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game/:gameId" element={<Game />} />
    </Routes>
  );
};

export default App;
