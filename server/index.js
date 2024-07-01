const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
// const setupListeners = require("./setupListeners");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: "*",
    credentials: true,
  })
);

// const server = createServer(app);
// const io = new Server(server, { cors: "*" });
// setupListeners(io);

app.get("/", (req, res) => {
  return res.json({ message: "asd" });
});

app.get("/log", (req, res) => {
  return res.json({ message: "asd" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server is running at port: ", PORT);
});
