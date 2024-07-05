import React from "react";
import { useGame } from "../../context/Game";
import tilePosition from "../../data/tilesPosition.json";
import { useUser } from "../../context/User";
import Draggable from "react-draggable";
import incrementPosition from "../../utils/incrementPosition";
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

  const handleDrag = () => {
    if (clickedPiece !== index) setClickedPiece(index);
  };

  const handleDragStop = (_, data) => {
    const tileSize = window.innerHeight / 8;

    const translateX = Math.round(data.x / tileSize);
    const translateY = -Math.round(data.y / tileSize);

    const newPos =
      user.color === "white"
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
        onStop={handleDragStop}
        position={{ x: 0, y: 0 }}
      >
        <img
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
