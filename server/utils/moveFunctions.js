const generateMoves = require("./generateMoves");

const cumulatePossibleMoves = (pieces) => {
  return new Set(pieces.map((p) => p.possibleMoves).flat());
};

// moves the piece
const updatePosition = (pieces, movedPieceIndex, move, movedBy = null) => {
  let isKingSideCastle = false;
  let isQueenSideCastle = false;

  const movedPiece = pieces.find((_, i) => i === movedPieceIndex);
  const { position, defaultPosition } = movedPiece;
  const { name, color } = movedPiece.description;

  // <Castling>
  if (name === "king" && movedBy) {
    if (position[0] === "e" && move[0] === "g") {
      const rook = pieces.find(
        (p) =>
          p.description.name === "rook" &&
          p.description.color === color &&
          p.defaultPosition[0] === "h"
      );
      rook.position = `f${rook.position[1]}`;

      isKingSideCastle = true;
    } else if (position[0] === "e" && move[0] === "c") {
      const rook = pieces.find(
        (p) =>
          p.description.name === "rook" &&
          p.description.color === color &&
          p.defaultPosition[0] === "a"
      );
      rook.position = `d${rook.position[1]}`;
      isQueenSideCastle = true;
    }

    movedBy.canCastleKingSide = false;
    movedBy.canCastleQueenSide = false;
  } else if (name === "rook" && movedBy) {
    if (defaultPosition[0] === "a") movedBy.canCastleQueenSide = false;
    else if (defaultPosition[0] === "h") movedBy.canCastleKingSide = false;
  } // </Castling>

  // <Promotions>
  if (name === "pawn" && movedBy) {
    if (move[1] == 8 || move[1] == 1) {
      const description = { name: "queen", symbol: "Q", color };
      movedPiece.description = description;
      movedPiece.src = `/pieces/wq.png`;
    }
  } // </Promotions>

  movedPiece.position = move; // Update the position of the piece

  let isCapture = false;

  pieces = pieces.filter((piece, index) => {
    if (piece.position !== move || index === movedPieceIndex) return true;

    isCapture = true;
    return false;
  }); // remove captured piece if any

  return {
    pieces,
    isCapture,
    movedBy,
    isKingSideCastle,
    isQueenSideCastle,
  };
};

const findCheck = (pieces, specificTeam = false) => {
  const kingPositions = {
    white: pieces.find((p) => p.defaultPosition === "e1")?.position,
    black: pieces.find((p) => p.defaultPosition === "e8")?.position,
  }; // getting kings position

  const allPossibleMoves = cumulatePossibleMoves(pieces); // getting all possible moves for all pieces on the board

  if (specificTeam) {
    return allPossibleMoves.has(kingPositions[specificTeam]);
  }

  if (allPossibleMoves.has(kingPositions.white)) return "white";
  else if (allPossibleMoves.has(kingPositions.black)) return "black";
  else return null;
};

// update possible moves for pieces
const updatePossibleMoves = (pieces, castles) => {
  const newPieces = pieces.map((piece) => {
    const { position, defaultPosition } = piece;
    const { color, name } = piece.description;

    const parameters = [pieces, position, color];
    if (name === "pawn") parameters.push(defaultPosition);
    else if (name === "king") {
      parameters.push(castles[color].canCastleKingSide);
      parameters.push(castles[color].canCastleQueenSide);
    }

    const possibleMoves = generateMoves[name](...parameters); // e.g generateMoves[pawn](parameters)

    return { ...piece, possibleMoves };
  });

  return newPieces;
};

// adjusts for pins, moving into checks and filtering moves after getting checked
const adjustForChecks = (pieces, turn, castle) => {
  return pieces.map((piece, index) => {
    const { color, name } = piece.description;

    if (color === turn) return piece;

    let canCastleKingSide = castle[color].canCastleKingSide;
    let canCastleQueenSide = castle[color].canCastleQueenSide;

    let newPossibleMoves = piece.possibleMoves.filter((move) => {
      const originalPosition = piece.position;

      const { pieces: newPieces1 } = updatePosition(pieces, index, move); // imaginary movement of piece
      const newPieces2 = updatePossibleMoves(newPieces1, castle);
      const getsChecked = findCheck(newPieces2, color); // finds if piece's king is now checked

      if (
        name === "king" &&
        (move === "d1" || move === "d8") &&
        getsChecked &&
        canCastleQueenSide
      ) {
        canCastleQueenSide = false;
      } else if (
        name === "king" &&
        (move === "f1" || move === "f8") &&
        getsChecked &&
        canCastleKingSide
      ) {
        canCastleKingSide = false;
      }

      piece.position = originalPosition;

      return !getsChecked; // if piece's king gets check, discard the move
    });

    if (name === "king") {
      newPossibleMoves = newPossibleMoves.filter((move) => {
        if ((move === "g1" || move === "g8") && !canCastleKingSide)
          return false;
        else if ((move === "c1" || move === "c8") && !canCastleQueenSide)
          return false;
        return true;
      });
    }

    return { ...piece, possibleMoves: newPossibleMoves };
  });
};

module.exports = {
  updatePosition,
  findCheck,
  updatePossibleMoves,
  adjustForChecks,
};
