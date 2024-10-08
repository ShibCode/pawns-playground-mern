import React from "react";
import { useUser } from "../../context/User";

const Actions = () => {
  const { setUser } = useUser();

  const reverseBoard = () => {
    setUser((prev) => ({
      ...prev,
      boardSide: prev.boardSide === "white" ? "black" : "white",
    }));
  };

  return (
    <div className="flex flex-col absolute xl:static left-full translate-x-3">
      <button onClick={reverseBoard} className="w-6">
        <img src="/icons/flip.svg" alt="flip" />
      </button>
    </div>
  );
};

export default Actions;
