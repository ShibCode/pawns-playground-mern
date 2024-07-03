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

    socket.on("request-continue-game", (roomId, playerId) => {
      const room = rooms.find((room) => room.id === roomId);
      const player = room?.players.find((player) => player.id === playerId);

      socket.emit("response-continue-game", player, roomId);
    });

    socket.on("move-request", (roomId, pieceIndex, newPosition) => {
      rooms = rooms.map((room) => {
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

        io.to(roomId).emit("move-response", pieces, newTurn, sound);

        return {
          ...room,
          pieces,
          turn: newTurn,
          players: [white, black],
        };
      });
    });
  });
}

module.exports = initSocket;
