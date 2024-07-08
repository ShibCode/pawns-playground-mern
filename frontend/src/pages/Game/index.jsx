import React, { useEffect, useState } from "react";
import Board from "./Board";
import Pieces from "./Pieces";
import { useUser } from "../../context/User";
import { Link, useParams } from "react-router-dom";
import { useSocket } from "../../context/Socket";
import { useGame } from "../../context/Game";
import GameEndModal from "./GameEndModal";
import { gameEnd, gameStart } from "../../utils/sounds";

const Game = () => {
  const [result, setResult] = useState(null);

  const socket = useSocket();
  const { user, setUser } = useUser();
  const { game, setGame } = useGame();

  const { gameId } = useParams();

  useEffect(() => {
    socket.on("game-end", (winnerId) => {
      gameEnd.play();
      localStorage.removeItem("ongoing-game");
      const isWinner = winnerId === user.id;
      setResult(isWinner ? "win" : "lose");
    });

    const pendingGame = JSON.parse(localStorage.getItem("ongoing-game"));

    socket.on("response-connect-to-game", (game) => {
      if (user?.isPlaying) {
        const ongoingGame = { gameId: gameId, player: user };
        localStorage.setItem("ongoing-game", JSON.stringify(ongoingGame));
        gameStart.play();
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

  const reverseBoard = () => {
    setUser((prev) => ({
      ...prev,
      side: prev.boardSide === "white" ? "black" : "white",
    }));
  };

  if (!game) return;

  return (
    <>
      {/* only shows when the result is defined i.e when game ends */}
      <GameEndModal result={result} />

      <div className="flex justify-center items-center min-h-screen">
        <div className="flex gap-5">
          <div className="relative game">
            <Board />
            <Pieces />
          </div>

          {/* <div className="flex flex-col px-8 py-10 w-[360px]">
            {game.moves.map((move, index) => (
              <div key={index} className="flex text-white h-10 items-center">
                <div className="w-full">{index + 1}.</div>
                <div className="w-full">{move[0]}</div>
                <div className="w-full">{move[1]}</div>
              </div>
            ))}
          </div> */}

          {/* <div>
          <button onClick={reverseBoard}>
          <img src="/icons/switch.svg" alt="switch" className="w-10" />
          </button>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Game;
