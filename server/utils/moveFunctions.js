const generateMoves = require("./generateMoves");

const cumulatePossibleMoves = (pieces) => {
  return new Set(pieces.flatMap((p) => p.possibleMoves));
};

// moves the piece
const updatePosition = (pieces, movedPiece, move, isPlayerMove = null) => {
  // isPlayerMove is a thing because the server is also moving pieces to filter out moves after this function is called [adjustForChecks()]

  const { defaultPosition } = movedPiece;
  const { name, color } = movedPiece.description;

  const hisKing = pieces.find(
    (p) => p.description.name === "king" && p.description.color === color
  );

  // <Castling>
  if (name === "king" && isPlayerMove) {
    if (movedPiece.canCastleKingSide && move[0] === "g") {
      const rook = pieces.find(
        (p) =>
          p.description.name === "rook" &&
          p.description.color === color &&
          p.defaultPosition[0] === "h"
      );
      rook.position = `f${rook.position[1]}`;
    } else if (movedPiece.canCastleQueenSide && move[0] === "c") {
      const rook = pieces.find(
        (p) =>
          p.description.name === "rook" &&
          p.description.color === color &&
          p.defaultPosition[0] === "a"
      );
      rook.position = `d${rook.position[1]}`;
    }

    movedPiece.canCastleKingSide = false;
    movedPiece.canCastleQueenSide = false;
  } else if (name === "rook" && isPlayerMove) {
    if (defaultPosition[0] === "a") hisKing.canCastleQueenSide = false;
    else if (defaultPosition[0] === "h") hisKing.canCastleKingSide = false;
  } // </Castling>

  // <Promotions>
  if (name === "pawn" && isPlayerMove && (move[1] == 8 || move[1] == 1)) {
    const description = { name: "queen", symbol: "Q", color };
    movedPiece.description = description;
    movedPiece.src = `/pieces/${color[0]}q.png`;
  } // </Promotions>

  movedPiece.position = move; // Update the position of the piece

  let isCapture = false;

  pieces = pieces.filter((piece) => {
    if (piece.position !== move || piece === movedPiece) return true;

    isCapture = true;
    return false;
  }); // remove captured piece if any

  return { pieces, isCapture };
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
const updatePossibleMoves = (pieces) => {
  const newPieces = pieces.map((piece) => {
    const { color, name } = piece.description;

    const parameters = [pieces, piece.position, color];
    if (name === "pawn") parameters.push(piece.defaultPosition);
    else if (name === "king") {
      parameters.push(piece.canCastleKingSide);
      parameters.push(piece.canCastleQueenSide);
    }

    const possibleMoves = generateMoves[name](...parameters); // e.g generateMoves[pawn](parameters)

    return { ...piece, possibleMoves };
  });

  return newPieces;
};

// adjusts for pins, moving into checks and filtering moves after getting checked
const adjustForChecks = (pieces, turn) => {
  return pieces.map((piece, index) => {
    const { color, name } = piece.description;

    if (color === turn) return piece;

    let canCastleKingSide = piece.canCastleKingSide;
    let canCastleQueenSide = piece.canCastleQueenSide;

    let newPossibleMoves = piece.possibleMoves.filter((move) => {
      // imaginary movements of piece
      let newPieces = pieces.reduce((acc, piece, i) => {
        if (piece.position === move) return acc;
        if (index !== i) return [...acc, piece];

        return [...acc, { ...piece, position: move }];
      }, []);

      newPieces = updatePossibleMoves(newPieces);
      const getsChecked = findCheck(newPieces, color); // finds if piece's king is now checked

      // disable castling if the tile through which the king passes ,when castling, is attacked
      if (name === "king" && getsChecked) {
        if (move[0] === "d") canCastleQueenSide = false;
        else if (move[0] === "f") canCastleKingSide = false;
      }

      return !getsChecked; // if piece's king gets check, discard the move
    });

    if (name === "king" && piece.position[0] === "e") {
      newPossibleMoves = newPossibleMoves.filter((move) => {
        if (move[0] === "g" && !canCastleKingSide) return false;
        else if (move[0] === "c" && !canCastleQueenSide) return false;
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
