const Game = require("./Game");
const { v4: uuidv4 } = require("uuid");

class GameManager {
  constructor(io) {
    this.io = io;
    this.users = [];
    this.games = [];
    this.waitingToBeConnected = null;

    this.move = this.move.bind(this);
  }

  addUser(socket) {
    this.users.push(socket);
    this.addHandler(socket);
  }

  removeUser(socket) {
    if (this.waitingToBeConnected === socket) this.waitingToBeConnected = null; // remove from queue if queued
    this.users = this.users.filter((user) => user !== socket);
  }

  addHandler(socket) {
    socket.on("disconnect", () => this.removeUser(socket));
    socket.on("join-queue", () => this.joinQueue(socket));
    socket.on("move-request", this.move);
  }

  joinQueue(socket) {
    if (this.waitingToBeConnected) {
      this.startGame(this.waitingToBeConnected, socket);
    } else {
      this.waitingToBeConnected = socket;
      socket.emit("joined-queue");
    }
  }

  startGame(p1, p2) {
    const gameId = uuidv4();
    const game = new Game(gameId, p1.id, p2.id);
    this.games.push(game);

    [p1, p2].forEach((player, i) => {
      player.join(gameId);
      player.emit("start-game", game[`player${i + 1}`], gameId);
    });

    this.waitingToBeConnected = null;
  }

  move(gameId, pieceIndex, newPosition) {
    const game = this.games.find((game) => game.id === gameId);
    if (game) game.move(this.io, pieceIndex, newPosition);
  }
}

module.exports = GameManager;
