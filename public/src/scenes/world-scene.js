import { DIRECTION } from "../common/direction.js";
import { TILED_COLLISION_LAYER_ALPHA } from "../config.js";
import Phaser from "../lib/phaser.js";
import { getSocket } from "../lib/socket.js";
// import { socket } from "../lib/socket.js";
// import socket from "../main.js";
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
    const socket = getSocket();
    if (!socket) {
      console.log("socket is not initiated");
      return;
    }

    this.cameras.main.setBounds(0, 0, 3200, 3200);

    //create a tile map object to use other utility methods
    const map = this.make.tilemap({ key: WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL });
    const collisionTiles = map.addTilesetImage(
      "collision",
      WORLD_ASSET_KEYS.WORLD_COLLISION,
    );
    if (!collisionTiles) {
      console.log("worldScene : create] error while creatting collsison tiles");
    }

    const collisionLayer = map.createLayer("Collision", collisionTiles, 0, 0);
    if (!collisionLayer) {
      console.log("worldScene: create] error while creating collision layer");
      return;
    }
    collisionLayer.setAlpha(TILED_COLLISION_LAYER_ALPHA).setDepth(2);
    this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);
    this.#controls = new Controls(this);

    //shake the screen after sec 8-15
    this.time.addEvent({
      delay: Phaser.Math.Between(6000, 15000),
      loop: true,
      callback: () => {
        this.cameras.main.shake(1000, 0.015);
      },
    });

    this.dangerOverlay = this.add.graphics();

    this.dangerOverlay.fillStyle(0xff0000, 0); // start invisible
    this.dangerOverlay.fillRect(0, 0, this.scale.width, this.scale.height);

    this.dangerOverlay.setScrollFactor(0);
    this.dangerOverlay.setDepth(9999);

    // this.physics.add.collider(this.#Localplayer, colision_layer );

    socket.emit("player-join");

    socket.on("state_update", (players) => {
      this.syncPlayers(players, collisionLayer, socket);
    });

    socket.on("player_joined", (player) => {
      console.log("player joined");
    });
  }

  update() {
    const socket = getSocket();
    if (!this.#Localplayer) return;

    const selectedDirection = this.#controls.getDirectionKeyJustPressed();
    if (selectedDirection != DIRECTION.NONE) {
      socket.emit("move_request", {
        currPosition: this.#Localplayer._targetPosition,
        direction: selectedDirection,
      });
    }
  }

  syncPlayers(serverPlayers, collisionLayer, socket) {
    const incomingIds = new Set();

    serverPlayers.forEach((data) => {
      const id = data.id;
      incomingIds.add(id);

      if (!this.#players.has(id)) {
        const newPlayer = new Player({
          scene: this,
          position: { x: data.x, y: data.y },
          direction: data.direction || DIRECTION.DOWN,
          collisionLayer: collisionLayer,
          health: data.health,
        });

        this.#players.set(id, newPlayer);

        if (id === socket.id) {
          this.#Localplayer = newPlayer;
          this.cameras.main.startFollow(this.#Localplayer._phaserGameObject);
        }
      } else {
        if (id === socket.id) {
          this.#Localplayer.setHealth(data.health);
          const isDamage = data.tookDamage;
          const isDangerActive = this.#Localplayer._isDangerActive;
          console.log(data);
          if (isDamage && !isDangerActive) {
            console.log("ENTER DANGER");

            this.#Localplayer._isDangerActive = true;

            this.tweens.add({
              targets: this.dangerOverlay,
              alpha: 0.5,
              duration: 200,
              onUpdate: (tween) => {
                this.dangerOverlay.clear();
                this.dangerOverlay.fillStyle(0xff0000, tween.targets[0].alpha);
                this.dangerOverlay.fillRect(
                  0,
                  0,
                  this.scale.width,
                  this.scale.height,
                );
              },
            });
          } else if (!isDamage && isDangerActive) {
            console.log("EXIT DANGER");

            this.#Localplayer._isDangerActive = false;

            this.tweens.add({
              targets: this.dangerOverlay,
              alpha: 0,
              duration: 200,
            });
          }
        }
        this.#players.get(id).animateTo(data.x, data.y, data.direction);
      }
    });

    for (const id of this.#players.keys()) {
      if (!incomingIds.has(id)) {
        const player = this.#players.get(id);
        player.destroy();
        this.#players.delete(id);
      }
    }
  }
}
