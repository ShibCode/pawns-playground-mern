import React, { useRef } from "react";
import { usePieces } from "../../context/Pieces";
import tilePosition from "../../data/tilesPosition.json";
import letterKeys from "../../data/letterKeys.json";
import { useUser } from "../../context/User";
import Draggable from "react-draggable";
import incrementPosition from "../../utils/incrementPosition";
import { useSocket } from "../../context/Socket";
import { useParams } from "react-router-dom";

const Piece = ({
  description,
  src,
  position,
  possibleMoves,
  index,
  clickedPiece,
  setClickedPiece,
  turn,
}) => {
  const { x, y } = tilePosition[position]; // current position of the piece on the board
  const { color, name, number } = description;

  const { pieces } = usePieces();
  const { user } = useUser();
  const socket = useSocket();

  const params = useParams();
  const { roomId } = params;

  const move = (e, newPos = "") => {
    if (turn !== color || turn !== user.color) return;

    if (newPos === "") {
      const newPosStr = getComputedStyle(e.currentTarget).translate; // eg 0% -300%

      const [rawX, rawY] = newPosStr
        .split(" ")
        .map((str) => +str.substring(0, str.length - 1)); // splits converts into [0%, -300%] and map removes the % sign

      const [x, y] = [Math.abs(rawX / 100 + 1), Math.abs(rawY / 100 - 1)]; // +/- 1 to ensure coords starts from 1

      newPos = `${letterKeys[x]}${y}`; // new position of the moved piece
    }

    socket.emit("move-request", roomId, index, newPos);
  };

  const handleDrag = () => {
    setClickedPiece(index);
  };

  const handleStop = (_, data) => {
    const tileSize = window.innerHeight / 8;

    const translateX = Math.round(data.x / tileSize);
    const translateY = -Math.round(data.y / tileSize);

    const newPos =
      user.color === "white"
        ? incrementPosition(position, [translateX, translateY])
        : incrementPosition(position, [-translateX, -translateY]);

    if (possibleMoves.includes(newPos)) move("", newPos);

    setClickedPiece(null);
  };

  const pieceRef = useRef();

  return (
    <>
      <div
        style={{ translate: `${x} ${y}` }}
        className={`w-tile h-tile absolute bottom-0 left-0 bg-tile-picked ${
          clickedPiece === index ? "block" : "hidden"
        }`}
      />

      <Draggable
        onDrag={handleDrag}
        onStop={handleStop}
        position={{ x: 0, y: 0 }}
      >
        <img
          ref={pieceRef}
          id={`${color}-${name}-${number}`}
          src={src}
          style={{
            translate: `${x} ${y}`,
            rotate: `${user.boardSide === "white" ? "0deg" : "180deg"}`,
          }}
          className={`piece cursor-grab absolute w-tile bottom-0 left-0 transition-none ${
            clickedPiece === index ? "z-10" : "z-0"
          }`}
          draggable={false}
          onClick={() => {
            if (index === clickedPiece) setClickedPiece(null);
            else if (turn === color) setClickedPiece(index);
          }}
        />
      </Draggable>

      {/* if piece is selected by the user */}
      {clickedPiece === index &&
        turn === color &&
        turn === user.color &&
        possibleMoves.map((possibleMove, index) => {
          const { x, y } = tilePosition[possibleMove];

          const isCapturable = pieces.some((p) => p.position === possibleMove);

          return (
            <div
              key={index}
              style={{ translate: `${x} ${y}` }}
              onClick={move}
              className="absolute w-tile h-tile flex justify-center items-center bottom-0 left-0"
            >
              {isCapturable ? (
                <div className="border-[calc(var(--tile-size)*0.09)] border-black w-full h-full rounded-full opacity-20" />
              ) : (
                <div className="bg-black w-[33%] aspect-square rounded-full opacity-20" />
              )}
            </div>
          );
        })}
    </>
  );
};

export default Piece;
