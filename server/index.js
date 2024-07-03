const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const initSocket = require("./socket/index.js");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
    credentials: true,
  })
);

const server = createServer(app);
const io = new Server(server);
initSocket(io);

// io.on('connection', socket => socket.lea)

app.get("/", (req, res) => {
  return res.json({ msg: "Hello" });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server is running at port: ", PORT);
});
