const GameModal = require("./Game");
const { v4: uuidv4 } = require("uuid");

class GameManager {
  constructor(io) {
    this.io = io;
    this.users = [];
    this.games = [];
    this.waitingToBeConnected = null;
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
    socket.on("move-request", (gameId, pieceIndex, newPosition) =>
      this.move(gameId, pieceIndex, newPosition, socket)
    );
    socket.on("timeout", (gameId) => this.timeout(socket, gameId));
    socket.on("req-get-ongoing-games", () => this.sendGames(socket));
    socket.on("request-connect-to-game", (gameId, userId) =>
      this.connectToGame(socket, gameId, userId)
    );
  }

  joinQueue(socket) {
    if (this.waitingToBeConnected) {
      //start a game
      const gameId = uuidv4();

      const p1 = this.waitingToBeConnected;
      const p2 = socket;

      const game = new GameModal(gameId, p1.id, p2.id); // create a new game
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

  move(gameId, pieceIndex, newPosition, socket) {
    const game = this.games.find((game) => game.id === gameId);
    if (game) {
      const isGameOver = game.move(this.io, socket, pieceIndex, newPosition);
      if (isGameOver) {
        this.games = this.games.filter((g) => g.id !== gameId); // remove the game from the list of games
        this.sendGames(this.io); // update the list of ongoing games for all users
      }
    }
  }

  timeout(socket, gameId) {
    const game = this.games.find((game) => game.id === gameId);
    if (game) {
      game.player1.timeLeft -= Date.now() - game.lastUpdatedAt;
      game.player2.timeLeft -= Date.now() - game.lastUpdatedAt;
      game.lastUpdatedAt = Date.now();

      if (game.player1.timeLeft > 0 && game.player2.timeLeft > 0) {
        return socket.emit("reverse-invalid-action", game);
      }

      const { id } = game.player1.timeLeft <= 0 ? game.player2 : game.player1;
      this.io.to(gameId).emit("game-end", id);

      this.games = this.games.filter((g) => g.id !== gameId); // remove the game from the list of games
      this.sendGames(this.io); // update the list of ongoing games for all users
    }
  }

  // when user comes to the link of a game including when the players reconnect
  connectToGame(socket, gameId, userId) {
    const game = this.games.find((game) => game.id === gameId);
    if (!game) return socket.emit("redirect-home");

    // set player id to the new socket id if a player has reconnected
    if (game.player1.id === userId) game.player1.id = socket.id;
    else if (game.player2.id === userId) game.player2.id = socket.id;

    // Updating time of players here when a spectator comes or reconnection happens
    if (game.lastUpdatedAt) {
      const playerWithTurn =
        game.player1.color === game.turn ? game.player1 : game.player2;
      playerWithTurn.timeLeft -= Date.now() - game.lastUpdatedAt;
      game.lastUpdatedAt = Date.now();
    }

    socket.join(gameId); // join the room of the game
    socket.emit("response-connect-to-game", game); // send the game data to the user
  }

  // send ongoing games to all users so they can spectate
  sendGames(socketOrIo) {
    socketOrIo.emit("res-get-ongoing-games", this.games);
  }
}

module.exports = GameManager;
