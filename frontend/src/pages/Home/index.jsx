import React, { useEffect, useState } from "react";
import { useSocket } from "../../context/Socket";
import { useUser } from "../../context/User";
import { Link, useNavigate } from "react-router-dom";
import { useGame } from "../../context/Game";
import defaultPieces from "../../data/defaultPieces.json";
import generateMoves from "../Game/generateMoves";

const Home = () => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [onGoingGames, setOnGoingGames] = useState([]);

  const navigate = useNavigate();

  const socket = useSocket();
  const { setUser } = useUser();
  const { setGame } = useGame();

  const startGame = (player, gameId) => {
    setIsInQueue(false);

    // getting default moves
    // ! Remove later
    const pieces = defaultPieces.map((piece) => {
      const { position, defaultPosition } = piece;
      const { color, name } = piece.description;

      const parameters = [defaultPieces, position, color, defaultPosition];
      const possibleMoves = generateMoves[name](...parameters); // e.g generateMoves[pawn](parameters)
      return { ...piece, possibleMoves };
    });

    setGame({ turn: "white", pieces, moves: [] });
    setUser({ ...player, boardSide: player.color, isPlaying: true });

    navigate(`/game/${gameId}`);
  };

  useEffect(() => {
    socket.on("start-game", startGame);
    socket.on("joined-queue", () => setIsInQueue(true));
    socket.on("receive-ongoing-games", (games) => {
      setOnGoingGames(games);
    });

    socket.emit("request-ongoing-games");

    return () => {
      socket.off("start-game");
      socket.off("joined-queue");
      socket.off("receive-ongoing-games");
    };
  }, []);

  const joinGameAndWait = () => socket.emit("join-queue");

  return (
    <div className="flex justify-center items-center h-screen relative">
      <div className="absolute top-5 right-8 flex flex-col items-end gap-2">
        {onGoingGames.map((game, index) => (
          <div key={index} className="text-white flex gap-4 items-center">
            <span>{game.id}</span>

            <Link
              to={`/game/${game.id}`}
              className="rounded-md bg-white text-black border-2 border-white font-semibold transition-all duration-200 hover:bg-transparent hover:text-white px-3 h-8"
            >
              Spectate
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          if (!isInQueue) joinGameAndWait();
        }}
        disabled={isInQueue}
        className="px-6 min-w-[200px] h-[60px] rounded-md bg-white text-black border-2 border-white text-xl font-semibold transition-all duration-200 hover:bg-transparent hover:text-white disabled:hover:bg-white disabled:hover:text-black disabled:opacity-80"
      >
        {isInQueue ? "Waiting for an opponent..." : "Join Game!"}
      </button>
    </div>
  );
};

export default Home;
