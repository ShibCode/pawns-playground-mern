import React, { createContext, useContext, useState } from "react";
import defaultPieces from "../data/defaultPieces.json";
import generateMoves from "../pages/Game/generateMoves";

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const Game = ({ children }) => {
  const [game, setGame] = useState({
    turn: "white", 
    opponent: "",
    pieces: [],
  });

  return (
    <GameContext.Provider value={{ game, setGame }}>
      {children}
    </GameContext.Provider>
  );
};

export default Game;
