import React, { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const Game = ({ children }) => {
  const [game, setGame] = useState({
    turn: "white",
    pieces: [],
    moves: [],  
  });

  return (
    <GameContext.Provider value={{ game, setGame }}>
      {children}
    </GameContext.Provider>
  );
};

export default Game;
