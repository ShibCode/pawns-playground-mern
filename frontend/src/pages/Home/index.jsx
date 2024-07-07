import React, { useEffect, useState } from "react";
import { useSocket } from "../../context/Socket";
import { useUser } from "../../context/User";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [onGoingGames, setOnGoingGames] = useState([]);

  const navigate = useNavigate();

  const socket = useSocket();
  const { setUser } = useUser();

  const startGame = (player, gameId) => {
    setUser({ ...player, boardSide: player.color, isPlaying: true });
    navigate(`/game/${gameId}`);
  };

  useEffect(() => {
    socket.on("joined-queue", () => setIsInQueue(true));
    socket.on("start-game", startGame);

    socket.on("res-get-ongoing-games", (games) => setOnGoingGames(games));
    socket.emit("req-get-ongoing-games");

    return () => {
      socket.off("joined-queue");
      socket.off("start-game");
      socket.off("res-get-ongoing-games");
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
