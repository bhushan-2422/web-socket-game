import express from "express";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { DIRECTION } from "../public/src/common/direction.js";
import { TILE_SIZE } from "../public/src/config.js";

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

function calculateNextPosition(player, direction) {
  switch (direction) {
    case DIRECTION.UP:
      return { x: player.currPosition.x, y: player.currPosition.y - TILE_SIZE };
    case DIRECTION.DOWN:
      return { x: player.currPosition.x, y: player.currPosition.y + TILE_SIZE };
    case DIRECTION.LEFT:
      return { x: player.currPosition.x - TILE_SIZE, y: player.currPosition.y };
    case DIRECTION.RIGHT:
      return { x: player.currPosition.x + TILE_SIZE, y: player.currPosition.y };
  }
}

const players = {};
const rooms = {};

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("player-join", () => {
    const roomId = players[socket.id].roomId;
    io.to(roomId).emit("state_update", rooms[roomId].players);
  });

  socket.on("create-room", ({ roomId, playerName, minPlayers }) => {
    // create room if not exists
    if (!rooms[roomId]) {
      rooms[roomId] = {
        minPlayers,
        players: [],
        state: "waiting",
      };
    }

    const room = rooms[roomId];

    // ❌ prevent joining started game
    if (room.state === "playing") {
      socket.emit("error", "Game already started");
      return;
    }

    // ❌ prevent duplicate join
    if (room.players.find((p) => p.id === socket.id)) {
      return;
    }

    // ✅ create player properly
    const player = {
      id: socket.id,
      name: playerName,
      currPosition: { x: 1600, y: 1600 },
      x: 1600,
      y: 1600,
      direction: "DOWN",
      roomId,
    };

    players[socket.id] = player;
    room.players.push(player);

    socket.join(roomId);

    // waiting state
    if (room.players.length < room.minPlayers) {
      io.to(roomId).emit("waiting", room.players);
    }
    // start game
    else {
      room.state = "playing";
      io.to(roomId).emit("start-game", room.players);
    }
  });

  //<------------IMP----------------->
  //as collision detection is in user side so how will i handle movement from server
  //as when i click arrow server calculates next position and stores that states in player DS
  //so initialize new property i.e currPosition
  //when server calculates next postion it is based on currPosition
  //and send new x and y to user
  //user validates collision logic and if not collidable then ubdate target position
  //and send that target postion to server as currPosition
  //if object was collidable then currPosition does not change and again server calculates next positon
  //on the basis of currPosition

  socket.on("move_request", ({ currPosition, direction }) => {
    const player = players[socket.id];
    if (!player) return;

    player.currPosition.x = currPosition.x;
    player.currPosition.y = currPosition.y;

    const { x, y } = calculateNextPosition(player, direction);

    if (player.x == x && player.y == y) return;
    player.x = x;
    player.y = y;
    player.direction = direction;

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
