import React, { useEffect, useState } from "react";
import Board from "./Board";
import Actions from "./Actions";
import Moves from "./Moves";
import { useUser } from "../../context/User";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/Socket";
import { useGame } from "../../context/Game";
import { gameEndSound, gameStartSound } from "../../utils/sounds";
import GameEndModal from "./GameEndModal";

const Game = () => {
  const [result, setResult] = useState(null);

  const socket = useSocket();
  const { user } = useUser();
  const { game, setGame } = useGame();

  const { gameId } = useParams();

  useEffect(() => {
    socket.on("game-end", (winnerId) => {
      console.log(winnerId);
      gameEndSound.play();
      localStorage.removeItem("ongoing-game");
      const isWinner = winnerId === user.id;
      setResult(winnerId ? (isWinner ? "win" : "lose") : "draw");
    });

    const pendingGame = JSON.parse(localStorage.getItem("ongoing-game"));

    socket.on("response-connect-to-game", (game) => {
      if (user?.isPlaying) {
        const ongoingGame = { gameId: gameId, player: user };
        localStorage.setItem("ongoing-game", JSON.stringify(ongoingGame));
        gameStartSound.play();
      } // if the user is not a spectator, then save the game to local storage

      setGame(game);
    });

    // here, if there is a pending game, it passes the previous player id that was saved in the local storage and in the server, the player id in the game is updated with the new id
    socket.emit(
      "request-connect-to-game",
      gameId,
      pendingGame ? pendingGame.player.id : user.id
    );
  }, []);

  if (!game) return;

  return (
    <div className="h-screen py-3 flex gap-3 justify-center">
      <Board result={result} />
      <Actions />
      <Moves />
    </div>
  );
};

export default Game;
