import React, { useEffect, useState } from "react";
import Piece from "./Piece";
import { useGame } from "../../context/Game";
import { useUser } from "../../context/User";
import { useSocket } from "../../context/Socket";
import { captureSound, checkSound, moveSound } from "../../utils/sounds";
import letterKeys from "../../data/letterKeys.json";
import { useParams } from "react-router-dom";

const Pieces = () => {
  const [clickedPiece, setClickedPiece] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const { game, setGame } = useGame();
  const { user } = useUser();
  const socket = useSocket();

  const { roomId } = useParams();

  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, [socket]);

  const setupListeners = () => {
    socket.on("move-response", (pieces, turn, sound) => {
      setIsProcessing(false);
      setGame((prev) => ({ ...prev, turn, pieces })); // changing turns after move response

      if (sound === "check") checkSound.play();
      else if (sound === "capture") captureSound.play();
      else moveSound.play();
    });
  };

  const removeListeners = () => {
    socket.off("move-response");
  };

  const move = (e, pieceIndex, newPos = "") => {
    console.log(pieceIndex);

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

    socket.emit("move-request", roomId, pieceIndex, newPos);
  };

  return (
    <div
      className="pieces-wrapper absolute w-full h-full bottom-0 left-0"
      style={{ rotate: `${user.boardSide === "white" ? "0deg" : "180deg"}` }}
    >
      {game.pieces.map((piece, index) => (
        <Piece
          key={index}
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
