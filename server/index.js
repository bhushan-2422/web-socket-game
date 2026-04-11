import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { Player } from "./models/player.js";
import { Room } from "./models/room.js";
import { fireAndSmokeArray } from "./utils/damage.js";

const app = express();
const server = createServer(app);
const PORT = 3000;
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});



const players = {};
const rooms = {};

setInterval(() => {
  const now = Date.now();

  Object.values(rooms).forEach(room => {
    room.players.forEach(player => {
      player.checkDamage(now);
    });

    io.to(room.roomId).emit("state_update", {
      players: room.players
    });
    
  });

}, 200);

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("player-join", () => {
    const roomId = players[socket.id].roomId;
    io.to(roomId).emit("state_update", rooms[roomId].players);
  });

  socket.on("create-room", ({ roomId, playerName, minPlayers }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = new Room(roomId, minPlayers)
    }
    const room = rooms[roomId];

    if (room.state === "playing") {
      socket.emit("error", "Game already started");
      return;
    }

    if (room.isPlayerExist(socket)) {
      return;
    }

    const player = new Player(socket, playerName, roomId);

    players[socket.id] = player;
    room.players.push(player);

    socket.join(roomId);

    if (!room.isFilled()) {
      io.to(roomId).emit("waiting", room.players);
    }
    
    else {
      room.state = "playing";
      io.to(roomId).emit("start-game", room.players);
    }
  });

  socket.on("move_request", ({ currPosition, direction }) => {
    const player = players[socket.id];
    if (!player) return;
    player.changePosition(currPosition, direction)
    const roomId = player.roomId;
    io.to(roomId).emit("state_update", rooms[roomId].players);
  });

  socket.on("disconnect", () => {
    const player = players[socket.id];
    if (!player) return;

    const room = rooms[player.roomId];
    if (!room) return;

    // remove player from room
    room.players = room.players.filter((p) => p.id !== socket.id);

    // remove from global
    delete players[socket.id];

    // update remaining players
    io.to(player.roomId).emit("state_update", room.players);
  });
});

server.listen(PORT, () => {
  console.log("app is running on: ", PORT);
});
