const generateMoves = require("../utils/generateMoves.js");

const cumulatePossibleMoves = (pieces) => {
  return new Set(pieces.map((p) => p.possibleMoves).flat());
};

// moves the piece
const updatePosition = (pieces, movedPieceIndex, move, movedBy = null) => {
  let isCapture = false;

  let isKingSideCastle = false;
  let isQueenSideCastle = false;
  let kingColor = "";

  let newPieces = pieces
    .map((piece, pieceIndex) => {
      const { position, defaultPosition } = piece;
      const { name, color } = piece.description;

      if (movedPieceIndex === pieceIndex) {
        //Castling
        if (name === "king") {
          if (
            (position === "e1" && move === "g1") ||
            (position === "e8" && move === "g8")
          ) {
            isKingSideCastle = true;
          } else if (
            (position === "e1" && move === "c1") ||
            (position === "e8" && move === "c8")
          ) {
            isQueenSideCastle = true;
          }

          kingColor = color;

          if (movedBy) {
            movedBy.canCastleKingSide = false;
            movedBy.canCastleQueenSide = false;
          }
        } else if (name === "rook" && movedBy) {
          // if rook was moved, disallow the corresponding castling
          if (defaultPosition === "a1" || defaultPosition === "a8")
            movedBy.canCastleQueenSide = false;
          else if (defaultPosition === "h1" || defaultPosition === "h8")
            movedBy.canCastleKingSide = false;
        }

        //Promotions
        if (name !== "pawn" || !movedBy) return { ...piece, position: move };

        if (
          (color === "white" && move[1] == 8) ||
          (color === "black" && move[1] == 1)
        ) {
          const description = {
            name: "queen",
            symbol: "Q",
            color,
          };

          return {
            ...piece,
            position: move,
            description,
            src: "/pieces/wq.png",
          };
        }

        return { ...piece, position: move };
      } else if (position === move) {
        // if move took a piece
        isCapture = true;
        return false;
      }

      return piece;
    })
    .filter((a) => a); // removing the piece that may have been taken

  // if move was castle, set rook position
  if (isKingSideCastle || isQueenSideCastle) {
    newPieces = newPieces.map((piece) => {
      const { defaultPosition, position } = piece;
      const { name, color } = piece.description;

      // return any piece that isn't a rook or isn't of the same color as the castled king
      if (name !== "rook" || color !== kingColor) return piece;

      let newPos = position;

      if (isKingSideCastle && defaultPosition === "h1") newPos = "f1";
      else if (isQueenSideCastle && defaultPosition === "a1") newPos = "d1";
      else if (isKingSideCastle && defaultPosition === "h8") newPos = "f8";
      else if (isQueenSideCastle && defaultPosition === "a8") newPos = "d8";

      return { ...piece, position: newPos };
    });
  }

  return { pieces: newPieces, isCapture };
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
