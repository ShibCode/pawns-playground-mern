import React from "react";
import { useGame } from "../../context/Game";

const Moves = ({ seePastPosition, currentPosition }) => {
  const { game } = useGame();

  return (
    <div className="flex flex-col w-[360px] bg-black bg-opacity-15 rounded-[4px] text-gray-300">
      <div className="flex">
        <button className="font-semibold border-b-[3px] h-16 w-full">
          Moves
        </button>
      </div>

      <div className="flex flex-col moves-scroll">
        {game.moveNotations.map((moves, index) => (
          <div
            key={index}
            className={`min-h-10 flex items-center text-[13px] font-semibold px-4 ${
              index % 2 === 0 ? "bg-black bg-opacity-15" : ""
            } `}
          >
            <div className="flex w-full font-bold">
              <div className="w-1/2">{index + 1}.</div>

              {moves.map((move, moveIndex) => {
                const gamePosition = index * 2 + moveIndex + 1;

                return (
                  <div key={moveIndex} className="w-full">
                    <button
                      disabled={currentPosition === gamePosition}
                      className={`px-1 py-0.5 rounded-sm border-b-[3px] border-white bg-white ${
                        currentPosition === gamePosition
                          ? "text-white bg-opacity-15 border-opacity-30"
                          : "text-gray-300 bg-opacity-0 border-opacity-0"
                      }`}
                      onClick={() => seePastPosition(gamePosition)}
                    >
                      {move}
                    </button>
                  </div>
                );
              })}

              {moves.length === 1 && <div className="w-full"></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Moves;
