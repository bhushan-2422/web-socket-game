import Phaser from "./lib/phaser.js";
import { initSocket } from "./lib/socket.js";
import { PreloadScene } from "./scenes/preload-scene.js";
import { SCENE_KEYS } from "./scenes/scene-keys.js";
import { WorldScene } from "./scenes/world-scene.js";

function startGame() {
  const game = new Phaser.Game({
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
  game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
}

let socket = null;

const joiner = document.getElementById("joiner")
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

      socket.emit("create-room",{roomId, playerName, minPlayers})
    });

    socket.on("waiting",(players) => {
      players.forEach(p => {
        const itemDiv = document.createElement("div")
        itemDiv.textContent = p.name;
        playersContainer.append(itemDiv);
      });

    })

    socket.on("start-game", (players) =>{
      console.log("start game socket")

      joiner.classList.add("hidden");
      gameContainer.classList.remove("hidden");
      startGame();
      


    })
  }
});

// socket = io();

// socket.on("connect", () => {
//   console.log("Connected:", socket.id);

//   socket.emit("player-join", { name: "viking" });
// });

export default socket;
