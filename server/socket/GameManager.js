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
    socket.on("join-queue", () => this.joinQueue(socket));
    socket.on("move-request", this.move);
    socket.on("request-get-ongoing-games", () => this.sendGames(socket));
    socket.on("request-connect-to-game", (gameId) =>
      this.connectToGame(socket, gameId)
    );
  }

  joinQueue(socket) {
    if (this.waitingToBeConnected) {
      //start a game
      const gameId = uuidv4();

      const p1 = this.waitingToBeConnected;
      const p2 = socket;

      const game = new Game(gameId, p1.id, p2.id); // create a new game
      this.games.push(game);

      p1.emit("start-game", game.player1, game.id);
      p2.emit("start-game", game.player2, game.id);

      this.sendGames(this.io); // send ongoing games to all users

      this.waitingToBeConnected = null; // remove from queue
    } else {
      this.waitingToBeConnected = socket; // add to queue
      socket.emit("joined-queue"); // notify user that they are in queue
    }
  }

  move(gameId, pieceIndex, newPosition) {
    const game = this.games.find((game) => game.id === gameId);
    if (game) game.move(this.io, pieceIndex, newPosition);
  }

  // when user comes to the link of a game including the players
  connectToGame(socket, gameId) {
    const game = this.games.find((game) => game.id === gameId);
    if (game) {
      socket.join(gameId); // join the room of the game
      socket.emit("response-connect-to-game", game); // send the game data to the user
    }
  }

  sendGames(socketOrIo) {
    socketOrIo.emit("response-get-ongoing-games", this.games);
  }
}

module.exports = GameManager;
