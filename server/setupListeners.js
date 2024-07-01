const defaultPieces = require("./defaultPieces.json");
const generateMoves = require("./generateMoves.js");

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
      } else if (piece.position === newPosition) {
        // if move took a piece
        piece = false;
        isCapture = true;
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
const adjustForChecks = (pieces, turn) => {
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

function setupListeners(io) {
  let queue = [];
  let rooms = [];

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      if (queue.includes(socket.id)) {
        queue = queue.filter((id) => id !== socket.id);
      }
    });

    socket.on("join-game", () => {
      queue.push(socket);

      if (queue.length === 2) {
        queue[0].join("game-room-1");
        queue[1].join("game-room-1");

        const isWhite = Math.random() > 0.5;

        io.to("game-room-1").emit(
          "start-game",
          {
            player1: { id: queue[0].id, color: isWhite ? "white" : "black" },
            player2: { id: queue[1].id, color: isWhite ? "black" : "white" },
          },
          "game-room-1"
        );

        rooms.push({
          id: "game-room-1",
          pieces: [...defaultPieces],
          turn: "white",
        });
        queue = queue.slice(2);
      } else {
        socket.emit("joined-queue");
      }
    });

    socket.on("move-request", (roomId, pieceIndex, newPosition) => {
      rooms.map((room) => {
        if (room.id !== roomId) return room;

        const { newPieces1, isCapture } = updatePosition(
          room.pieces,
          pieceIndex,
          newPosition,
          true
        );

        const newPieces2 = updatePossibleMoves(newPieces1);
        const checkedTeam = findCheck(newPieces2);
        const newPieces3 = adjustForChecks(newPieces2, room.turn);

        room.turn = room.turn === "white" ? "black" : "white";
        room.pieces = newPieces3;

        let sound = "move";
        if (checkedTeam) sound = "check";
        else if (isCapture) sound = "capture";

        io.to(roomId).emit("move-response", newPieces3, room.turn, sound);

        return room;
      });
    });
  });
}

module.exports = setupListeners;
