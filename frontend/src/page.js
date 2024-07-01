"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/User";
import { useSocket } from "@/context/Socket";

const Home = () => {
  const [isInQueue, setIsInQueue] = useState(false);

  const router = useRouter();

  const socket = useSocket();
  const { setUser } = useUser();

  useEffect(() => {
    return () => removeListeners();
  }, []);

  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, [socket]);

  const setupListeners = () => {
    if (!socket) return;

    socket.on("start-game", (players, roomId) => {
      setIsInQueue(false);

      const user =
        players.player1.id === socket.id ? players.player1 : players.player2;
      setUser({ ...user, boardSide: user.color });

      router.push(`/game/${roomId}`);
    });

    socket.on("joined-queue", () => setIsInQueue(true));
  };

  const removeListeners = () => {
    if (!socket) return;

    socket.off("start-game");
    socket.off("joined-queue");
  };

  const joinGameAndWait = () => {
    socket.emit("join-game");
  };

  if (!socket) return;

  return (
    <div className="flex justify-center items-center h-screen">
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
