import Phaser from "./lib/phaser.js";
import { PreloadScene } from "./scenes/preload-scene.js";
import { SCENE_KEYS } from "./scenes/scene-keys.js";
import { WorldScene } from "./scenes/world-scene.js";

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

let socket = null;

// document.getElementById("create-room").addEventListener("submit", (e) => {
//   e.preventDefault();

//   const roomId = document.getElementById("roomId").value;
//   const playerName = document.getElementById("playerName").value;
//   const minPlayers = document.getElementById("minPlayers").value;

//   if (!roomId || !playerName || !minPlayers) {
//     alert("Fill all fields");
//     return;
//   }

//   // Create socket only once
//   if (!socket) {
//     socket = io();

//     socket.on("connect", () => {
//       console.log("Connected:", socket.id);

//       socket.emit("player-join",{name:"viking"})
//     });

//   }
// });

socket = io();

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("player-join", { name: "viking" });
});

export default socket;
