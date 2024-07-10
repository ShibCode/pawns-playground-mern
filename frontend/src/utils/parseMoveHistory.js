const parseMoveHistory = (pieces, pieceIndex, move) => {
  const movedPiece = pieces.find((_, index) => index === pieceIndex);

  const { defaultPosition } = movedPiece;
  const { name, color } = movedPiece.description;

  const hisKing = pieces.find(
    (p) => p.description.name === "king" && p.description.color === color
  );

  // <Castling>
  if (name === "king") {
    if (move[0] === "g") {
      const rook = pieces.find(
        (p) =>
          p.description.name === "rook" &&
          p.description.color === color &&
          p.defaultPosition[0] === "h"
      );
      rook.position = `f${rook.position[1]}`;
    } else if (move[0] === "c") {
      const rook = pieces.find(
        (p) =>
          p.description.name === "rook" &&
          p.description.color === color &&
          p.defaultPosition[0] === "a"
      );
      rook.position = `d${rook.position[1]}`;
    }
  } // </Castling>

  // <Promotions>
  if (name === "pawn" && (move[1] == 8 || move[1] == 1)) {
    const description = { name: "queen", symbol: "Q", color };
    movedPiece.description = description;
    movedPiece.src = `/pieces/${color[0]}q.png`;
  } // </Promotions>

  movedPiece.position = move; // Update the position of the piece

  pieces = pieces.filter((piece) => {
    if (piece.position !== move || piece === movedPiece) return true;

    return false;
  }); // remove captured piece if any

  return pieces;
};

export default parseMoveHistory;
