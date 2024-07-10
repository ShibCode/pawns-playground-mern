import React, { useRef, useState } from "react";
import { useGame } from "../../../context/Game";
import tilePosition from "../../../data/tilesPosition.json";
import { useUser } from "../../../context/User";
import Draggable from "react-draggable";
import incrementPosition from "../../../utils/incrementPosition";
const Piece = ({
  description,
  src,
  position,
  possibleMoves,
  index,
  clickedPiece,
  setClickedPiece,
  turn,
  move,
  isProcessing,
}) => {
  const { x, y } = tilePosition[position]; // current position of the piece on the board
  const { color } = description;

  const { game } = useGame();
  const { user } = useUser();

  const [dragPos, setDragPos] = useState({ x: null, y: null });

  const handleDrag = (_, data) => {
    if (clickedPiece !== index) setClickedPiece(index);

    const wrapper = document.querySelector(".pieces-wrapper");
    const tileSize = wrapper.getBoundingClientRect().height / 8;

    const translateX = Math.round(data.x / tileSize) * 100;
    const translateY = Math.round(data.y / tileSize) * 100;

    if (user.boardSide === "white") {
      setDragPos({
        x: `${translateX + +x.substring(0, x.length - 1)}%`,
        y: `${translateY + +y.substring(0, y.length - 1)}%`,
      });
    } else {
      setDragPos({
        x: `${-translateX + +x.substring(0, x.length - 1)}%`,
        y: `${-translateY + +y.substring(0, y.length - 1)}%`,
      });
    }
  };

  const handleDragStop = (_, data) => {
    setDragPos({ x: null, y: null });

    const wrapper = document.querySelector(".pieces-wrapper");
    const tileSize = wrapper.getBoundingClientRect().height / 8;

    const translateX = Math.round(data.x / tileSize);
    const translateY = -Math.round(data.y / tileSize);

    const newPos =
      user.boardSide === "white"
        ? incrementPosition(position, [translateX, translateY])
        : incrementPosition(position, [-translateX, -translateY]);

    if (
      possibleMoves.includes(newPos) &&
      turn === color &&
      turn === user.color &&
      !isProcessing
    ) {
      move("", index, newPos);
    }
  };

  const pieceRef = useRef();

  return (
    <>
      {dragPos.x && (
        <div
          className="absolute w-tile h-tile bottom-0 left-0 border-[calc(var(--tile-size)*0.075)] border-gray-200 -z-10"
          style={{ translate: `${dragPos.x} ${dragPos.y}` }}
        ></div>
      )}

      <div
        style={{ translate: `${x} ${y}` }}
        className={`w-tile h-tile absolute bottom-0 left-0 bg-tile-picked ${
          clickedPiece === index ? "block" : "hidden"
        }`}
      />

      <Draggable
        onDrag={handleDrag}
        onStop={handleDragStop}
        position={{ x: 0, y: 0 }}
        nodeRef={pieceRef}
      >
        <img
          ref={pieceRef}
          src={src}
          style={{
            transition: "translate 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            translate: `${x} ${y}`,
            rotate: `${user.boardSide === "white" ? "0deg" : "180deg"}`,
          }}
          className={`piece cursor-grab absolute w-tile bottom-0 left-0 ${
            clickedPiece === index ? "z-10" : "z-0"
          }`}
          draggable={false}
          onClick={() => {
            if (index === clickedPiece) setClickedPiece(null);
            else setClickedPiece(index);
          }}
        />
      </Draggable>

      {/* if piece is selected by the user */}
      {clickedPiece === index &&
        turn === color &&
        turn === user.color &&
        !isProcessing &&
        possibleMoves.map((possibleMove, possibleMoveIndex) => {
          const { x, y } = tilePosition[possibleMove];

          const isCapturable = game.pieces.some(
            (p) => p.position === possibleMove
          );

          return (
            <React.Fragment key={possibleMoveIndex}>
              <div
                style={{ translate: `${x} ${y}` }}
                onClick={(e) => move(e, index)}
                className="absolute w-tile h-tile flex justify-center items-center bottom-0 left-0 z-10"
              ></div>
              <div
                style={{ translate: `${x} ${y}` }}
                className="absolute w-tile h-tile flex justify-center items-center bottom-0 left-0"
              >
                {isCapturable ? (
                  <div className="border-[calc(var(--tile-size)*0.09)] border-black w-full h-full rounded-full opacity-20" />
                ) : (
                  <div className="bg-black w-[33%] aspect-square rounded-full opacity-20" />
                )}
              </div>
            </React.Fragment>
          );
        })}
    </>
  );
};

export default Piece;
