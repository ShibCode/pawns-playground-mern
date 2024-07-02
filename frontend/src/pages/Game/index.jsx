import React from "react";
import Board from "./Board";
import Pieces from "./Pieces";
import { useUser } from "../../context/User";

const Game = () => {
  const { setUser } = useUser();

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
