import React, { useEffect, useRef, useState } from "react";
import Board from "./Board";
import Actions from "./Actions";
import Sidebar from "./Sidebar";
import { useUser } from "../../context/User";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/Socket";
import { useGame } from "../../context/Game";
import updatePosition from "../../utils/updatePosition";
import playSound from "../../utils/playSound";
import getDefaultPieces from "../../utils/getDefaultPieces";

const Game = () => {
  const socket = useSocket();
  const { user } = useUser();
  const { game, setGame } = useGame();

  const { gameId } = useParams();

  const connectToGame = (game) => {
    // if the user is not a spectator, then save the game to local storage
    if (user?.isPlaying) {
      const ongoingGame = { gameId: gameId, player: user };
      localStorage.setItem("ongoing-game", JSON.stringify(ongoingGame));
    }

    playSound("game-start");
    setGame(game);
  };

  useEffect(() => {
    const pendingGame = JSON.parse(localStorage.getItem("ongoing-game"));

    socket.on("response-connect-to-game", connectToGame);

    socket.emit(
      "request-connect-to-game",
      gameId,
      pendingGame ? pendingGame.player.id : user.id // prev socket id if user reconnects else the current id
    );

    return () => socket.off("response-connect-to-game");
  }, []);

  const [historicPieces, setHistoricPieces] = useState(null);
  const currentPosition = useRef(null);

  const seePastPosition = (moveNumber, isGoingToPrevMove = false) => {
    currentPosition.current = moveNumber;

    const historicPieces = game.moveHistory
      .slice(0, moveNumber)
      .reduce((acc, [pieceIndex, move]) => {
        return updatePosition(acc, pieceIndex, move);
      }, getDefaultPieces());

    // play the sound

    if (isGoingToPrevMove) {
      const sound = game.moveHistory[moveNumber][2];
      playSound(sound);
    } else {
      const sound = game.moveHistory[moveNumber - 1][2];
      playSound(sound);
    }

    setHistoricPieces(historicPieces);
  };

  const goToNextMove = () => {
    if (currentPosition.current === null) return; // if the user is at the latest move

    if (currentPosition.current === game.moveHistory.length - 1) {
      const sound = game.moveHistory[currentPosition.current][2];
      playSound(sound);
      currentPosition.current = null;
      setHistoricPieces(null);
    } else seePastPosition(currentPosition.current + 1);
  };

  const goToPreviousMove = () => {
    if (currentPosition.current === 0) return; // if the user is at the default position

    if (currentPosition.current === null) {
      seePastPosition(game.moveHistory.length - 1, true);
    } else seePastPosition(currentPosition.current - 1, true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") goToNextMove();
    else if (e.key === "ArrowLeft") goToPreviousMove();
  };

  useEffect(() => {
    if (!game) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [game]);

  if (!game) return;

  return (
    <div className="h-screen py-3 flex gap-3 justify-center">
      <Board historicPieces={historicPieces} />
      <Actions />
      <Sidebar
        seePastPosition={seePastPosition}
        currentPosition={
          currentPosition.current === null
            ? game.moveHistory.length
            : currentPosition.current
        }
      />
    </div>
  );
};

export default Game;
