const joinGame = require("./join-game.js");

const {
  updatePosition,
  findCheck,
  updatePossibleMoves,
  adjustForChecks,
} = require("./moveFunctions.js");

let rooms = [];
let queue = [];

function initSocket(io) {
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      queue = queue.filter((player) => player.id !== socket.id);
    });

    socket.on("join-game", () => {
      joinGame(io, socket, queue, rooms);
    });

    socket.on("spectate-game", (roomId) => {
      const room = rooms.find((room) => room.id === roomId);

      if (!room) socket.emit("redirect-home");

      socket.join(roomId);
      socket.emit("move-response", room.pieces, room.Turn);
    });

    socket.on("stop-spectate-game", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("request-ongoing-games", () => {
      socket.emit(
        "receive-ongoing-games",
        rooms.map((room) => ({ id: room.id }))
      );
    });

    socket.on("request-continue-game", (roomId) => {
      const room = rooms.find((room) => room.id === roomId);
      socket.join(roomId);

      socket.emit("response-continue-game", room);
    });

    socket.on("move-request", (roomId, pieceIndex, newPosition) => {
      rooms = rooms
        .map((room) => {
          if (room.id !== roomId) return room;

          const { turn, players } = room;

          const white = players.find((p) => p.color === "white");
          const black = players.find((p) => p.color === "black");

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

          let { pieces, isCapture } = updatePosition(
            room.pieces,
            pieceIndex,
            newPosition,
            players.find((p) => p.color === turn)
          );

          pieces = updatePossibleMoves(pieces, castle);
          const checkedTeam = findCheck(pieces);

          // disable castling if king is checked
          if (checkedTeam) {
            pieces = pieces.map((piece) => {
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

          pieces = adjustForChecks(pieces, turn, castle);

          let sound = "move";
          if (checkedTeam) sound = "check";
          else if (isCapture) sound = "capture";

          const newTurn = turn === "white" ? "black" : "white";

          const hasNoMoves =
            pieces
              .filter((p) => p.description.color !== turn) // get opponent's moves pieces
              .flatMap((p) => p.possibleMoves).length === 0; // get all moves

          io.to(roomId).emit("move-response", pieces, newTurn, sound);

          if (checkedTeam && hasNoMoves) {
            io.to(roomId).emit(
              "game-end",
              checkedTeam === "black" ? white.id : black.id
            );

            // removes all players from the room and deletes the room
            io.sockets.sockets.get(white.id).leave(roomId);
            io.sockets.sockets.get(black.id).leave(roomId);

            return false;
          }

          return {
            ...room,
            pieces,
            turn: newTurn,
            players: [white, black],
          };
        })
        .filter((r) => r);
    });
  });
}

module.exports = initSocket;
