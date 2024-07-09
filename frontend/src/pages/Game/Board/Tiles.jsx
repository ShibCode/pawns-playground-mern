import React from "react";
import letterKeys from "../../../data/letterKeys.json";
import { useUser } from "../../../context/User";

const Tiles = () => {
  const { user } = useUser();

  return (
    <div className="flex flex-col relative pointer-events-none game-board">
      {/* numbers on the board */}
      {new Array(8).fill(0).map((_, index, arr) => {
        const factor =
          user.boardSide === "white" ? index : arr.length - 1 - index;

        return (
          <div
            key={index}
            style={{ transform: `translateY(${factor * -100}%)` }}
            className={`z-10 leading-[1] font-semibold p-1 absolute w-tile h-tile text-xl left-0 bottom-0 ${
              factor % 2 === 1 ? "text-tile-green" : "text-tile-peach"
            }`}
          >
            {index + 1}
          </div>
        );
      })}

      {/* letters on the board */}
      {new Array(8).fill(0).map((_, index, arr) => {
        const factor =
          user.boardSide === "white" ? index : arr.length - 1 - index;

        return (
          <div
            key={index}
            style={{ transform: `translateX(${factor * 100}%)` }}
            className={`z-10 leading-[1] font-semibold p-1 absolute w-tile h-tile text-xl bottom-0 flex justify-end items-end ${
              factor % 2 === 1 ? "text-tile-green" : "text-tile-peach"
            }`}
          >
            {letterKeys[index + 1]}
          </div>
        );
      })}

      {new Array(8).fill(0).map((_, rowIndex) => (
        <div className="flex" key={rowIndex}>
          {new Array(8).fill(0).map((_, tileIndex) => (
            <div
              className={`w-tile h-tile ${
                (rowIndex + tileIndex) % 2 === 0
                  ? "bg-tile-peach"
                  : "bg-tile-green"
              }`}
              key={`${rowIndex}-${tileIndex}`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Tiles;
