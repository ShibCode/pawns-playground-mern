const joinGame = require("./join-game.js");
const move = require("./move-request.js");

let rooms = [];
let waitingToBeConnected = null;

function initSocket(io) {
  io.on("connection", (socket) => {
    socket.on("spectate-game", (roomId) => {
      const room = rooms.find((room) => room.id === roomId);

      if (!room) socket.emit("redirect-home");

      socket.join(roomId);
      socket.emit("receive-game-details", room.pieces, room.turn);
    });

    socket.on("stop-spectate-game", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("request-continue-game", (roomId) => {
      const room = rooms.find((room) => room.id === roomId);
      socket.join(roomId);

      socket.emit("response-continue-game", room);
    });
  });
}

module.exports = initSocket;
