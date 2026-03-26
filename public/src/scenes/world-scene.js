import { DIRECTION } from "../common/direction.js";
import { TILED_COLLISION_LAYER_ALPHA } from "../config.js";
import Phaser from "../lib/phaser.js";
// import { socket } from "../lib/socket.js";
import socket from "../main.js";
import { Controls } from "../utils/controls.js";
import { Player } from "../world/characters/player.js";
import { WORLD_ASSET_KEYS } from "./asset-keys.js";
import { SCENE_KEYS } from "./scene-keys.js";

const TILE_SIZE = 64;
const PLAYER_POSITION = Object.freeze({
  x: 1 * TILE_SIZE,
  y: 1 * TILE_SIZE,
});

export class WorldScene extends Phaser.Scene {
  #Localplayer;
  #players;
  #controls;
  constructor() {
    super({
      key: SCENE_KEYS.WORLD_SCENE,
    });
    this.#players = new Map();
  }

  create() {

    this.cameras.main.setBounds(0,0,3200,3200);
    

    //create a tile map object to use other utility methods
    const map = this.make.tilemap({key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL})
    const collisionTiles = map.addTilesetImage('collision', WORLD_ASSET_KEYS.WORLD_COLLISION)
    if(!collisionTiles){
      console.log("worldScene : create] error while creatting collsison tiles")
    }

    const collisionLayer = map.createLayer('Collision',collisionTiles , 0,0);
    if(!collisionLayer){
      console.log("worldScene: create] error while creating collision layer");
      return;
    }
    collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);
    this.#controls = new Controls(this);

  

    // this.physics.add.collider(this.#Localplayer, colision_layer );

    socket.emit("player-join",{name:"viking"})

    socket.on("state_update", (players) => {
      console.log(players);
      this.syncPlayers(players);
    });

    socket.on("player_joined", (player) => {
      console.log("player joined");
    });

    
  }

  update() {
    if (!this.#Localplayer) return;

    const selectedDirection = this.#controls.getDirectionKeyJustPressed();
    if (selectedDirection != DIRECTION.NONE) {
      socket.emit("move_request", { direction: selectedDirection });
    }
  }

  syncPlayers(serverPlayers) {
    for (const [id, data] of Object.entries(serverPlayers)) {
      if (!this.#players.has(id)) {
        const newPlayer = new Player({
          scene: this,
          position: { x: data.x, y: data.y },
          direction: data.direction || DIRECTION.DOWN,
          
        });
        this.#players.set(id, newPlayer);
        if (id == socket.id) {
          this.#Localplayer = newPlayer;

          this.cameras.main.startFollow(this.#Localplayer._phaserGameObject) // camera movemmets
        }
      } else {
   
        this.#players.get(id).animateTo(data.x, data.y, data.direction);
        
      }
    }
    for (const id of this.#players.keys()) {
      if (!serverPlayers[id]) {
        const player = this.#players.get(id);
        player.destroy(); // 🔥 REQUIRED
        this.#players.delete(id);
      }
    }
  }
}
