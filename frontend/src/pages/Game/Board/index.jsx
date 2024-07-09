import React from "react";
import Tiles from "./Tiles";
import Pieces from "./Pieces";
import Player from "./Player";
import GameEndModal from "../GameEndModal";
import { useUser } from "../../../context/User";

const Board = ({ result }) => {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-3 w-max relative">
      <GameEndModal result={result} />

      <Player
        name="noob"
        rating={140}
        flag="🇩🇰"
        color={"black"}
        order={user.boardSide === "white" ? -1 : 1}
      />

      <div className="relative [&>*]:select-none">
        <Tiles />
        <Pieces />
      </div>

      <Player
        name="pro"
        rating={2040}
        flag="🇩🇰"
        color={"white"}
        order={user.boardSide === "white" ? 1 : -1}
      />
    </div>
  );
};

export default Board;
