const defaultPieces = require("./defaultPieces.json");

const {
  updatePosition,
  findCheck,
  updatePossibleMoves,
  adjustForChecks,
} = require("./moveFunctions.js");

function setupListeners(io) {
  let rooms = [];
  let queue = [];

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      queue = queue.filter((player) => player.id !== socket.id);
    });

    socket.on("join-game", () => {
      queue.push(socket);

      if (queue.length === 2) {
        queue[0].join("game-room-1");
        queue[1].join("game-room-1");

        const isWhite = Math.random() > 0.5;

        const players = [
          {
            id: queue[0].id,
            color: isWhite ? "white" : "black",
            boardSide: isWhite ? "white" : "black",
            canCastleKingSide: true,
            canCastleQueenSide: true,
          },
          {
            id: queue[1].id,
            color: isWhite ? "black" : "white",
            boardSide: isWhite ? "black" : "white",
            canCastleKingSide: true,
            canCastleQueenSide: true,
          },
        ];

        io.to("game-room-1").emit("start-game", players, "game-room-1");

        rooms.push({
          id: "game-room-1",
          pieces: [...defaultPieces],
          turn: "white",
          players,
        });
        queue = queue.slice(2);
      } else {
        socket.emit("joined-queue");
      }
    });

    socket.on("move-request", (roomId, pieceIndex, newPosition) => {
      rooms = rooms.map((room) => {
        if (room.id !== roomId) return room;

        const { pieces, turn, players } = room;

        const white = players.find((p) => p.color === "white");
        const black = players.find((p) => p.color === "black");

        const { newPieces1, isCapture } = updatePosition(
          pieces,
          pieceIndex,
          newPosition,
          players.find((p) => p.color === turn)
        );

        const castle = {
          white: {
            canCastleKingSide: white.canCastleKingSide,
            canCastleQueenSide: white.canCastleQueenSide,
          },
          black: {
            canCastleKingSide: black.canCastleKingSide,
            canCastleQueenSide: black.canCastleQueenSide,
          },
        };

        let newPieces2 = updatePossibleMoves(newPieces1, castle);
        const checkedTeam = findCheck(newPieces2);

        if (checkedTeam) {
          newPieces2 = newPieces2.map((piece) => {
            const { position, possibleMoves } = piece;
            const { name, color } = piece.description;

            if (name !== "king" || color !== checkedTeam) return piece;
            if (position !== "e1" || position !== "e8") return piece;

            const newMoves = possibleMoves.filter((move) => {
              return !(
                move === "g1" ||
                move === "c1" ||
                move === "g8" ||
                move === "c8"
              );
            });

            return { ...piece, possibleMoves: newMoves };
          });
        }

        const newPieces3 = adjustForChecks(newPieces2, turn, castle);

        let sound = "move";
        if (checkedTeam) sound = "check";
        else if (isCapture) sound = "capture";

        const newTurn = turn === "white" ? "black" : "white";

        io.to(roomId).emit("move-response", newPieces3, newTurn, sound);

        return {
          ...room,
          pieces: newPieces3,
          turn: newTurn,
          players: [white, black],
        };
      });
    });
  });
}

module.exports = setupListeners;
