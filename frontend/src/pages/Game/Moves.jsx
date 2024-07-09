import React from "react";
import { useGame } from "../../context/Game";

const Moves = () => {
  const { game } = useGame();

  return (
    <div className="flex flex-col w-[360px] bg-black bg-opacity-15 rounded-[4px] text-gray-300">
      <div className="flex">
        <button className="font-semibold border-b-[3px] h-16 w-full">
          Moves
        </button>
      </div>

      <div className="flex flex-col moves-scroll">
        {game.moves.map((move, index) => (
          <div
            key={index}
            className={`min-h-10 flex items-center text-[13px] font-semibold px-4 ${
              index % 2 === 0 ? "bg-black bg-opacity-15" : ""
            } `}
          >
            <div className="flex w-full">
              <div className="w-1/2">{index + 1}.</div>
              <div className={`w-full`}>{move[0]}</div>
              <div className={`w-full`}>{move[1]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Moves;
