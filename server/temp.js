const cumulatePossibleMoves = (pieces) => {
  return new Set(pieces.map((p) => p.possibleMoves).flat());
};

// moves the piece
const updatePosition = (
  pieces,
  movedPieceIndex,
  newPosition,
  isMovedByPlayer = false
) => {
  let isCapture = false;

  const newPieces = pieces
    .map((piece, pieceIndex) => {
      if (movedPieceIndex === pieceIndex) {
        piece.position = newPosition;

        if (name === "king" && canCastle) piece.canCastle = false;

        //Promotions
        if (piece.name !== "pawn" || !isMovedByPlayer) return piece;
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
      } else if (name === "king" && isMovedByPlayer && canCastle) {
        // Castling

        // king side castle
        if (piece.defaultPosition === "h1" && newPosition === "g1") {
          piece.position = "f1";
        } else if (piece.defaultPosition === "a1" && newPosition === "c1") {
          piece.position = "d1";
        }
      }

      return piece;
    })
    // removing the piece that may have been taken
    .filter((a) => a);

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
const updatePossibleMoves = (pieces) => {
  const newPieces = pieces.map((piece) => {
    const { position, defaultPosition, canCastle } = piece;
    const { color, name } = piece.description;

    const parameters = [pieces, position, color];
    if (name === "pawn") parameters.push(defaultPosition);
    if (name === "king") parameters.push(canCastle);

    const possibleMoves = generateMoves[name](...parameters); // e.g generateMoves[pawn](parameters)

    return { ...piece, possibleMoves };
  });

  return newPieces;
};

// adjusts for pins, moving into checks and filtering moves after getting checked
const adjustForChecks = (pieces) => {
  return pieces.map((piece, index) => {
    const { color } = piece.description;

    if (color === turn) return piece;

    const newPossibleMoves = piece.possibleMoves.filter((move) => {
      const originalPosition = piece.position;

      const { newPieces1 } = updatePosition(pieces, index, move); // imaginary movement of piece
      const newPieces2 = updatePossibleMoves(newPieces1);
      const getsChecked = findCheck(newPieces2, color); // finds if piece's king is now checked

      piece.position = originalPosition;

      return !getsChecked; // if piece's king gets check, discard the move
    });

    return { ...piece, possibleMoves: newPossibleMoves };
  });
};
