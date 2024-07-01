const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const setupListeners = require("./setupListeners");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
    credentials: true,
  })
);

const server = createServer(app);
const io = new Server(server, { cors: "*" });
setupListeners(io);

app.get("/", (req, res) => {
  res.status(200).send("Welcome");
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server is running at port: ", PORT);
});
