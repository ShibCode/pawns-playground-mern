const defaultPieces = require("../data/defaultPieces.json");
const { v4: uuidv4 } = require("uuid");

const joinGame = (io, socket, waitingToBeConnected, rooms) => {
  // if someone is already waiting
  const roomId = uuidv4();

  waitingToBeConnected.join(roomId);
  socket.join(roomId);

  const isWhite = Math.random() > 0.5;

  const players = [
    {
      id: waitingToBeConnected.id,
      color: isWhite ? "white" : "black",
      canCastleKingSide: true,
      canCastleQueenSide: true,
    },
    {
      id: socket.id,
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
  ); // telling all the other users about the new game so they can spectate it
};

module.exports = joinGame;
