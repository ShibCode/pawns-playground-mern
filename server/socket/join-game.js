const defaultPieces = require("../data/defaultPieces.json");
const { v4: uuidv4 } = require("uuid");

const joinGame = (io, socket, queue, rooms) => {
  queue.push(socket);

  socket.emit("joined-queue");

  if (queue.length >= 2) {
    const roomId = uuidv4();

    queue[0].join(roomId);
    queue[1].join(roomId);

    const isWhite = Math.random() > 0.5;

    const players = [
      {
        id: queue[0].id,
        color: isWhite ? "white" : "black",
        canCastleKingSide: true,
        canCastleQueenSide: true,
      },
      {
        id: queue[1].id,
        color: isWhite ? "black" : "white",
        canCastleKingSide: true,
        canCastleQueenSide: true,
      },
    ];

    io.to(roomId).emit("start-game", players, roomId);

    rooms.push({
      id: roomId,
      pieces: [...defaultPieces],
      turn: "white",
      players,
    });

    io.emit(
      "receive-ongoing-games",
      rooms.map((room) => ({ id: room.id }))
    );

    queue.splice(0, 2);
  }
};

module.exports = joinGame;
