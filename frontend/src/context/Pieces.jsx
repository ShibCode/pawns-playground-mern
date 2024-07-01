import React, { createContext, useContext, useState } from "react";
import defaultPieces from "../data/defaultPieces.json";
import generateMoves from "../pages/Game/generateMoves";

const PiecesContext = createContext();

export const usePieces = () => useContext(PiecesContext);

const Pieces = ({ children }) => {
  const [pieces, setPieces] = useState(() => {
    // generating the initial possible moves
    return defaultPieces.map((piece) => {
      const { position, defaultPosition } = piece;
      const { color, name } = piece.description;

      const parameters = [defaultPieces, position, color, defaultPosition];
      const possibleMoves = generateMoves[name](...parameters); // e.g generateMoves[pawn](parameters)
      return { ...piece, possibleMoves };
    });
  });

  return (
    <PiecesContext.Provider value={{ pieces, setPieces }}>
      {children}
    </PiecesContext.Provider>
  );
};

export default Pieces;
