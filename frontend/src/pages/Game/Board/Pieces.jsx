import React, { useEffect, useState } from "react";
import Piece from "./Piece";
import { useGame } from "../../../context/Game";
import { useUser } from "../../../context/User";
import { useSocket } from "../../../context/Socket";
import letterKeys from "../../../data/letterKeys.json";
import { useParams } from "react-router-dom";
import playSound from "../../../utils/playSound";

const Pieces = ({ historicPieces }) => {
  const [clickedPiece, setClickedPiece] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const { game, setGame } = useGame();
  const { user } = useUser();
  const socket = useSocket();

  const { gameId } = useParams();

  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, [socket]);

  const setupListeners = () => {
    socket.on("move-response", (game, sound) => {
      setIsProcessing(false);
      setGame(game); // changing turns after move response
      playSound(sound);
    });

    socket.on("reverse-invalid-action", (game) => {
      setGame(game);
      setIsProcessing(false);
    }); // if the move is invalid, reverse the game state
  };

  const removeListeners = () => {
    socket.off("move-response");
    socket.off("reverse-invalid-action");
  };

  const move = (e, pieceIndex, newPos = "") => {
    if (newPos === "") {
      const newPosStr = getComputedStyle(e.currentTarget).translate; // eg 0% -300%

      const [rawX, rawY] = newPosStr
        .split(" ")
        .map((str) => +str.substring(0, str.length - 1)); // splits converts into [0%, -300%] and map removes the % sign

      const [x, y] = [Math.abs(rawX / 100 + 1), Math.abs(rawY / 100 - 1)]; // +/- 1 to ensure coords starts from 1

      newPos = `${letterKeys[x]}${y}`; // new position of the moved piece
    }

    setIsProcessing(true);
    setClickedPiece(null);
    setGame((prev) => ({
      ...prev,
      turn: prev.turn === "white" ? "black" : "white",
    })); // changing turns before move request

    socket.emit("move-request", gameId, pieceIndex, newPos);
  };

  return (
    <div
      className="pieces-wrapper absolute w-full h-full bottom-0 left-0"
      style={{ rotate: `${user.boardSide === "white" ? "0deg" : "180deg"}` }}
    >
      {historicPieces
        ? historicPieces.map((piece, index) => (
            <Piece
              key={piece.defaultPosition}
              {...piece}
              index={index}
              clickedPiece={clickedPiece}
              setClickedPiece={setClickedPiece}
              turn={game.turn}
              move={move}
              isProcessing={isProcessing}
            />
          ))
        : game.pieces.map((piece, index) => (
            <Piece
              key={piece.defaultPosition}
              {...piece}
              index={index}
              clickedPiece={clickedPiece}
              setClickedPiece={setClickedPiece}
              turn={game.turn}
              move={move}
              isProcessing={isProcessing}
            />
          ))}
    </div>
  );
};

export default Pieces;
