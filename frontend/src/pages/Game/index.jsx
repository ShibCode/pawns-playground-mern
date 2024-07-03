import React, { useEffect } from "react";
import Board from "./Board";
import Pieces from "./Pieces";
import { useUser } from "../../context/User";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/Socket";
import { usePieces } from "../../context/Pieces";

const Game = () => {
  const socket = useSocket();
  const { user, setUser } = useUser();

  const { roomId } = useParams();

  useEffect(() => {
    if (user.isPlaying) {
      const onGoingGame = {
        roomId,
        playerId: user.id,
      };

      localStorage.setItem("ongoing-game", JSON.stringify(onGoingGame));
    } else socket.emit("spectate-game", roomId);

    return () => {
      if (!user.isPlaying) socket.emit("stop-spectate-game", roomId);
    };
  }, []);

  const reverseBoard = () => {
    setUser((prev) => ({
      ...prev,
      side: prev.boardSide === "white" ? "black" : "white",
    }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex gap-5">
        <div className="relative game">
          <Board />
          <Pieces />
        </div>

        {/* <div>
          <button onClick={reverseBoard}>
            <img src="/icons/switch.svg" alt="switch" className="w-10" />
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Game;
