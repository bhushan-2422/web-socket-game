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

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("player-join", () => {
    const roomId = players[socket.id].roomId;
    io.to(roomId).emit("state_update", rooms[roomId].players);
  });

  socket.on("create-room", ({ roomId, playerName, minPlayers }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = new Room(roomId, minPlayers);
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
    room.activePlayers += 1;

    console.log(rooms)

    socket.join(roomId);

    if (!room.isFilled()) {
      io.to(roomId).emit("waiting", room.players);
    } else {
      room.state = "playing";
      io.to(roomId).emit("start-game", room);
    }
  });

  socket.on("move_request", ({ currPosition, direction }) => {
    const player = players[socket.id];
    if (!player) return;

    player.changePosition(currPosition, direction);
    const now = Date.now();
    player.checkDamage(now);
    const roomId = player.roomId;
    const room = rooms[roomId];

    if (player.checkReachedExit(room)) {
      io.to(roomId).emit("player-exited", {
        playerId: player.id,
        timeTaken: room.avgTime,
      });
      
    } else if (player.checkDead(room)) {
      io.to(roomId).emit("player-dead", {
        playerId: player.id,
        timeTaken: room.avgTime,
      });

    }

    if (rooms[roomId]) {
      io.to(roomId).emit("state_update", rooms[roomId].players);
    }
  });

  socket.on("disconnect", () => {
    const player = players[socket.id];
    if (!player) return;

    const roomId = player.roomId;
    const room = rooms[roomId];

    // remove player from global players object
    delete players[socket.id];
    // room might already be deleted
    if (!room) return;

    console.log(rooms)

    // remove player from room
    room.players = room.players.filter((p) => p.id !== socket.id);
    // decrease active players
    room.activePlayers -= 1;
    // delete empty room
    if (room.activePlayers <= 0) {
      delete rooms[roomId];
      console.log(`Room ${roomId} deleted`);
      return;
    }
    // send updated state
    io.to(roomId).emit("state_update", room.players);
  });

  socket.on("chat-message", ({ text }) => {
    const player = players[socket.id];
    io.to(player.roomId).emit("chat-message", {
      senderId: socket.id,
      senderName: player.name,
      text,
    });
  });
});

server.listen(PORT, () => {
  console.log("app is running on: ", PORT);
});
