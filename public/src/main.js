import Phaser from "./lib/phaser.js";
import { initSocket } from "./lib/socket.js";
import { PreloadScene } from "./scenes/preload-scene.js";
import { SCENE_KEYS } from "./scenes/scene-keys.js";
import { WorldScene } from "./scenes/world-scene.js";

let game = null
function startGame(room) {

  if (game) {
    game.destroy(true);
    game = null;
  }

  game = new Phaser.Game({
    type: Phaser.CANVAS,
    pixelArt: false,
    scale: {
      parent: "game-container",
      width: 1024,
      height: 576,
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });

  game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
  game.scene.add(SCENE_KEYS.WORLD_SCENE, WorldScene);

  game.scene.start(SCENE_KEYS.PRELOAD_SCENE, { exits: room.exits });
}

let socket = null;

const joiner = document.getElementById("joiner");
document.getElementById("create-room").addEventListener("submit", (e) => {
  e.preventDefault();

  const roomId = document.getElementById("roomId").value;
  const playerName = document.getElementById("playerName").value;
  const minPlayers = document.getElementById("minPlayers").value;
  const playersContainer = document.getElementById("players");
  const gameContainer = document.getElementById("game-container");

  if (!roomId || !playerName || !minPlayers) {
    alert("Fill all fields");
    return;
  }

  // Create socket only once
  if (!socket) {
    socket = initSocket();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      socket.emit("create-room", { roomId, playerName, minPlayers });
    });

    socket.on("waiting", (players) => {
      players.forEach((p) => {
        const itemDiv = document.createElement("div");
        itemDiv.textContent = p.name;
        playersContainer.append(itemDiv);
      });
    });

    socket.on("start-game", (room) => {
      console.log("start game socket");

      joiner.classList.add("hidden");
      document.getElementById("game-wrapper").classList.remove("hidden");
      startGame(room);
    });

    socket.on("player-exited", ({ playerId, timeTaken }) => {
      console.log("timeTaken"+"hello")
      if (playerId === socket.id) {
        document.getElementById("game-wrapper").classList.add("hidden");
        document.getElementById("exit-screen").classList.add("visible");

        document.getElementById("your-time").textContent =
          (timeTaken / 1000).toFixed(2) + "s";
      }
    });
  }
});

function destroyGame() {
  if (game) {
    game.destroy(true); // 🔥 removes canvas + scenes
    game = null;

    // optional: clean container manually (extra safety)
    document.getElementById("game-container").innerHTML = "";
  }
}

document.getElementById("exit-game").onclick = () => {
  destroyGame();

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  showLobby();
};

document.getElementById("play-again").onclick = () => {
  destroyGame();

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  document.getElementById("players").innerHTML = "";

  showLobby();
};

document.getElementById("menuBtn").onclick = () => {
  document.getElementById("menuPanel").classList.toggle("show");
};

document.getElementById("chatBtn").onclick = () => {
  document.getElementById("chatPanel").classList.toggle("show");
};

function showExitScreen() {
  document.getElementById("joiner").classList.add("hidden");
  document.getElementById("game-wrapper").classList.add("hidden");
  document.getElementById("exit-screen").classList.add("visible");
}

function showLobby() {
  document.getElementById("joiner").classList.remove("hidden");
  document.getElementById("game-wrapper").classList.add("hidden");
  document.getElementById("exit-screen").classList.remove("visible");
}

function showGame() {
  document.getElementById("joiner").classList.add("hidden");
  document.getElementById("game-wrapper").classList.remove("hidden");
  document.getElementById("exit-screen").classList.remove("visible");
}



// socket = io();

// socket.on("connect", () => {
//   console.log("Connected:", socket.id);

//   socket.emit("player-join", { name: "viking" });
// });

export default socket;
