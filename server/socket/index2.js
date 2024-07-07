const joinGame = require("./join-game.js");
const move = require("./move-request.js");

let rooms = [];
let waitingToBeConnected = null;

function initSocket(io) {
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      if (waitingToBeConnected?.id === socket.id) {
        waitingToBeConnected = null;
      }
    });

    socket.on("join-game", () => {
      if (!waitingToBeConnected) {
        waitingToBeConnected = socket;
        socket.emit("joined-queue");
        return;
      }

      joinGame(io, socket, waitingToBeConnected, rooms);

      waitingToBeConnected = null;
    });

    socket.on("spectate-game", (roomId) => {
      const room = rooms.find((room) => room.id === roomId);

      if (!room) socket.emit("redirect-home");

      socket.join(roomId);
      socket.emit("receive-game-details", room.pieces, room.turn);
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
      rooms = move(io, rooms, roomId, pieceIndex, newPosition);
    });
  });
}

module.exports = initSocket;
