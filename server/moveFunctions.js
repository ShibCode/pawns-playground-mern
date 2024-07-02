const generateMoves = require("./generateMoves.js");

const cumulatePossibleMoves = (pieces) => {
  return new Set(pieces.map((p) => p.possibleMoves).flat());
};

// moves the piece
const updatePosition = (
  pieces,
  movedPieceIndex,
  newPosition,
  movedBy = null
) => {
  let isCapture = false;

  let isKingSideCastle = false;
  let isQueenSideCastle = false;
  let kingColor = "";

  let newPieces = pieces
    .map((piece, pieceIndex) => {
      if (movedPieceIndex === pieceIndex) {
        //Castling
        if (piece.description.name === "king") {
          if (
            (piece.position === "e1" && newPosition === "g1") ||
            (piece.position === "e8" && newPosition === "g8")
          ) {
            isKingSideCastle = true;
          } else if (
            (piece.position === "e1" && newPosition === "c1") ||
            (piece.position === "e8" && newPosition === "c8")
          ) {
            isQueenSideCastle = true;
          }

          kingColor = piece.description.color;

          if (movedBy) {
            movedBy.canCastleKingSide = false;
            movedBy.canCastleQueenSide = false;
          }
        }

        piece.position = newPosition; // Updating piece position

        //Promotions
        if (piece.name !== "pawn" || !movedBy) return piece;
        if (
          (piece.color === "white" && newPosition[1] == 8) ||
          (piece.color === "black" && newPosition[1] == 1)
        ) {
          piece.description.name = "queen";
          piece.description.symbol = "Q";
          piece.src = "/pieces/wq.png";
        }
      } else if (piece.position === newPosition) {
        // if move took a piece
        piece = false;
        isCapture = true;
      }

      return piece;
    })
    // removing the piece that may have been taken
    .filter((a) => a);

  if (isKingSideCastle || isQueenSideCastle) {
    newPieces = newPieces.map((piece) => {
      const { defaultPosition } = piece;
      const { name, color } = piece.description;

      if (name !== "rook" || color !== kingColor) return piece;
      if (
        (isKingSideCastle && defaultPosition === "a1") ||
        (isKingSideCastle && defaultPosition === "a8")
      )
        return piece;
      if (
        (isQueenSideCastle && defaultPosition === "h1") ||
        (isQueenSideCastle && defaultPosition === "h8")
      )
        return piece;

      let newRookPos = "";

      if (isKingSideCastle && defaultPosition === "h1") newRookPos = "f1";
      else if (isKingSideCastle && defaultPosition === "h8") newRookPos = "f8";
      else if (isQueenSideCastle && defaultPosition === "a1") newRookPos = "d1";
      else if (isQueenSideCastle && defaultPosition === "a8") newRookPos = "d8";

      return { ...piece, position: newRookPos };
    });
  }

  // here the key is newPieces1 so that renaming is not required when destructuring the object later
  return { newPieces1: newPieces, isCapture };
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

      const { newPieces1 } = updatePosition(pieces, index, move); // imaginary movement of piece
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
