const express = require("express");
const app = express();
const { createServer } = require("http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: "*" });
const setupListeners = require("./setupListeners");
setupListeners(io);

app.get("/", (req, res) => {
  res.status(200).send("Welcome");
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server is running at port: ", PORT);
});
