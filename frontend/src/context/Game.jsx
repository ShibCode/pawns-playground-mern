import React, { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const Game = ({ children }) => {
  const [game, setGame] = useState(null); // same structure as the game class in server/socket/Game.js (except for the methods)

  return (
    <GameContext.Provider value={{ game, setGame }}>
      {children}
    </GameContext.Provider>
  );
};

export default Game;
