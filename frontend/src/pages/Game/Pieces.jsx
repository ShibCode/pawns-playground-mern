import React, { useEffect, useState } from "react";
import Piece from "./Piece";
import { usePieces } from "../../context/Pieces";
import { useUser } from "../../context/User";
import { useSocket } from "../../context/Socket";
import { captureSound, checkSound, moveSound } from "../../utils/sounds";

const Pieces = () => {
  const [clickedPiece, setClickedPiece] = useState(null);
  const [turn, setTurn] = useState("white");

  const { pieces, setPieces } = usePieces();
  const { user } = useUser();
  const socket = useSocket();

  useEffect(() => {
    setupListeners();
    return () => removeListeners();
  }, [socket]);

  const setupListeners = () => {
    socket.on("move-response", (pieces, turn, sound) => {


      setPieces(pieces);

      if (sound === "check") checkSound.play();
      else if (sound === "capture") captureSound.play();
      else moveSound.play();

      setClickedPiece(null);
      setTurn(turn); // change turns
    });
  };

  const removeListeners = () => {
    socket.off("move-response");
  };

  return (
    <div
      className="pieces-wrapper absolute w-full h-full bottom-0 left-0"
      style={{ rotate: `${user.boardSide === "white" ? "0deg" : "180deg"}` }}
    >
      {pieces.map((piece, index) => {
        const { color, name, number } = piece.description;

        return (
          <Piece
            key={`${color}-${name}-${number}`}
            {...piece}
            index={index}
            clickedPiece={clickedPiece}
            setClickedPiece={setClickedPiece}
            turn={turn}
            setTurn={setTurn}
          />
        );
      })}
    </div>
  );
};

export default Pieces;
