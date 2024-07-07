import React, { useEffect, useState } from "react";
import Board from "./Board";
import Pieces from "./Pieces";
import { useUser } from "../../context/User";
import { Link, useParams } from "react-router-dom";
import { useSocket } from "../../context/Socket";
import { useGame } from "../../context/Game";

const Game = () => {
  const [result, setResult] = useState(null);

  const socket = useSocket();
  const { user, setUser } = useUser();
  const { game, setGame } = useGame();

  const { gameId } = useParams();

  useEffect(() => {
    socket.on("game-end", (winnerId) => {
      localStorage.removeItem("ongoing-game");
      const isWinner = winnerId === user.id;
      setResult(isWinner ? "win" : "lose");
    });

    const pendingGame = JSON.parse(localStorage.getItem("ongoing-game"));

    socket.on("response-connect-to-game", (game) => {
      if (user?.isPlaying) {
        const ongoingGame = { gameId: gameId, player: user };
        localStorage.setItem("ongoing-game", JSON.stringify(ongoingGame));
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
      {result && (
        <div className="fixed inset-0 z-20 flex justify-center items-center">
          <div className="w-[400px] flex flex-col text-center rounded-md overflow-hidden">
            <div
              className={`text-[32px] text-white font-bold py-3 ${
                result === "win" ? "bg-[#86A84F]" : "bg-[#666463]"
              }`}
            >
              You {result === "win" ? "Won" : "Lost"}!
            </div>

            <div className="bg-white p-5 flex flex-col gap-6">
              <div className="flex flex-col">
                <span className="uppercase font-semibold text-[15px] text-[#989795]">
                  Your Rating
                </span>
                <span className="font-bold text-3xl">1240</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button className="w-full h-[60px] bg-[#86A84F] text-xl font-bold rounded-lg text-white border-b-4 border-[#4A642C] col-span-2">
                  Game Review
                </button>
                <Link
                  to="/"
                  className="w-full h-[60px] bg-[#D9D8D6] text-lg font-semibold rounded-lg text-[#61605f] border-b-4 border-[#989795] flex justify-center items-center"
                >
                  Home
                </Link>
                <button className="w-full h-[60px] bg-[#D9D8D6] text-lg font-semibold rounded-lg text-[#61605f] border-b-4 border-[#989795]">
                  New Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
