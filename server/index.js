import express from "express"
import { createServer } from "node:http"
import { dirname,join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { DIRECTION } from "../public/src/common/direction.js";
import { TILE_SIZE } from "../public/src/config.js";

const app = express()
const server = createServer(app);
const PORT = 3000;
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

const players = {}
function calculateNextPosition(player, direction) {
  switch (direction) {
    case DIRECTION.UP:
      return { x: player.x, y: player.y - TILE_SIZE };
    case DIRECTION.DOWN:
      return { x: player.x, y: player.y + TILE_SIZE };
    case DIRECTION.LEFT:
      return { x: player.x - TILE_SIZE, y: player.y };
    case DIRECTION.RIGHT:
      return { x: player.x + TILE_SIZE, y: player.y };
  }
}


io.on("connection",(socket)=>{
    console.log("user connected");
    players[socket.id] = {
        id: socket.id,
        x: 64,
        y:64,
        direction: "DOWN"
    }

    io.emit("state_update", players);

    socket.on("move_request",({direction}) =>{
        const player = players[socket.id];
        if(!player) return;
        
        const {x, y} = calculateNextPosition(player, direction);
        if(player.x == x && player.y == y )return;
        player.x = x;
        player.y = y;
        player.direction = direction;
        io.emit("state_update", players)
        
    })
})

server.listen(PORT, ()=>{
    console.log("app is running on: ",PORT)
})