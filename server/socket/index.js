const GameManager = require("./GameManager.js");

function initSocket(io) {
  const gameManager = new GameManager(io);

  io.on("connection", (socket) => {
    gameManager.addUser(socket); // when a user opens the website
  });
}

module.exports = initSocket;
