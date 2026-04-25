import Phaser from "./lib/phaser.js";
import { initSocket } from "./lib/socket.js";
import { PreloadScene } from "./scenes/preload-scene.js";
import { SCENE_KEYS } from "./scenes/scene-keys.js";
import { WorldScene } from "./scenes/world-scene.js";

// ── Screen references ────────────────────────────────────────────────────────
const screenLobby = document.getElementById("joiner");
const screenGame = document.getElementById("game-wrapper");
const screenExit = document.getElementById("exit-screen");

// ── Screen switcher ──────────────────────────────────────────────────────────
// Only one screen is ever visible. All three start hidden in CSS (display:none).
// Lobby alone has display:flex on load via its initial CSS rule.
function show(screen) {
  [screenLobby, screenGame, screenExit].forEach((s) =>
    s.classList.remove("show"),
  );
  screen.classList.add("show");
}

// ── Phaser instance ──────────────────────────────────────────────────────────
let game = null;

function startGame(room) {
  if (game) {
    game.destroy(true);
    document.getElementById("game-container").innerHTML = "";
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

function destroyGame() {
  if (game) {
    game.destroy(true);
    document.getElementById("game-container").innerHTML = "";
    game = null;
  }
}

// ── Socket ───────────────────────────────────────────────────────────────────
let socket = null;

function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// ── Lobby form ───────────────────────────────────────────────────────────────
document.getElementById("create-room").addEventListener("submit", (e) => {
  e.preventDefault();

  const roomId = document.getElementById("roomId").value.trim();
  const playerName = document.getElementById("playerName").value.trim();
  const minPlayers = document.getElementById("minPlayers").value.trim();
  const playersList = document.getElementById("players");

  if (!roomId || !playerName || !minPlayers) {
    alert("Fill all fields");
    return;
  }

  if (socket) return; // already connected, don't double-connect

  socket = initSocket();

  socket.on("connect", () => {
    console.log("Connected:", socket.id);
    socket.emit("create-room", { roomId, playerName, minPlayers });
  });

  socket.on("waiting", (players) => {
    playersList.innerHTML = "";
    players.forEach((p) => {
      const div = document.createElement("div");
      div.textContent = p.name;
      playersList.append(div);
    });
  });

  socket.on("start-game", (room) => {
    console.log("start-game received");
    show(screenGame);
    startGame(room);
  });

  socket.on("player-exited", ({ playerId, timeTaken }) => {
    if (playerId !== socket.id) return;

    destroyGame();
    document.getElementById("your-time").textContent =
      (timeTaken / 1000).toFixed(2) + "s";
    show(screenExit);
  });

  // ── Socket listener (add this inside your socket.on("connect") block) ─────────
socket.on("chat-message", ({ senderId, senderName, text }) => {
  const isMine = senderId === socket.id;
  appendMessage(senderName, text, isMine);
});


  
});

const messagesDiv = document.getElementById("messages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

function appendMessage(senderName, text, isMine) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg-wrapper ${isMine ? "mine" : "theirs"}`;

  if (!isMine) {
    const sender = document.createElement("div");
    sender.className = "msg-sender";
    sender.textContent = senderName;
    wrapper.appendChild(sender);
  }

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.textContent = text;
  wrapper.appendChild(bubble);

  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || !socket) return;
  socket.emit("chat-message", { text });
  chatInput.value = "";
  chatInput.focus();
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ── Exit screen buttons ──────────────────────────────────────────────────────
document.getElementById("play-again").onclick = () => {
  resetSocket();
  document.getElementById("players").innerHTML = "";
  show(screenLobby);
};

document.getElementById("exit-game").onclick = () => {
  resetSocket();
  document.getElementById("players").innerHTML = "";
  show(screenLobby);
};

// ── In-game panel toggles ────────────────────────────────────────────────────
document.getElementById("menuBtn").onclick = () => {
  document.getElementById("menuPanel").classList.toggle("show");
};

document.getElementById("chatBtn").onclick = () => {
  document.getElementById("chatPanel").classList.toggle("show");
};

export default socket;
