import Phaser from "../lib/phaser.js";
import { DataUtils } from "../utils/data-utils.js";
import {
  CHARACTER_ASSET_KEY,
  DATA_ASSET_KEYS,
  WORLD_ASSET_KEYS,
} from "./asset-keys.js";
import { SCENE_KEYS } from "./scene-keys.js";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
    console.log(SCENE_KEYS.PRELOAD_SCENE);
  }

  preload() {
    console.log("preload");
    //LOAD WORLD ASSETS
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_BACKGROUND,
      "src/assets/images/monster-tamer/map/firemap.png",
    );
    this.load.tilemapTiledJSON(
      WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL,
      "src/assets/data/myMap.json",
    );
    this.load.image(
      WORLD_ASSET_KEYS.WORLD_COLLISION,
      "src/assets/images/monster-tamer/map/collision.png",
    );
    this.load.image(
      WORLD_ASSET_KEYS.EXIT_DOOR,
      "src/assets/images/monster-tamer/map/exit2.png",
    );

    //load character assets
    this.load.spritesheet(
      CHARACTER_ASSET_KEY.PLAYER1,
      "src/assets/images/axulart/character/char1.png",
      {
        frameWidth: 64,
        frameHeight: 88,
      },
    );
    this.load.spritesheet(
      CHARACTER_ASSET_KEY.PLAYER2,
      "src/assets/images/axulart/character/char2.png",
      {
        frameWidth: 64,
        frameHeight: 88,
      },
    );
    this.load.spritesheet(
      CHARACTER_ASSET_KEY.PLAYER3,
      "src/assets/images/axulart/character/char3.png",
      {
        frameWidth: 64,
        frameHeight: 88,
      },
    );
    this.load.spritesheet(
      CHARACTER_ASSET_KEY.PLAYER4,
      "src/assets/images/axulart/character/char4.png",
      {
        frameWidth: 64,
        frameHeight: 88,
      },
    );

    this.load.spritesheet(
      CHARACTER_ASSET_KEY.NPC,
      "src/assets/images/parabellum-games/characters.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.json(
      DATA_ASSET_KEYS.ANIMATIONS,
      "src/assets/data/animations.json",
    );
  }

  create() {
    console.log("create");
    this.#createAnimations(CHARACTER_ASSET_KEY.PLAYER1);
    this.#createAnimations(CHARACTER_ASSET_KEY.PLAYER2);
    this.#createAnimations(CHARACTER_ASSET_KEY.PLAYER3);
    this.#createAnimations(CHARACTER_ASSET_KEY.PLAYER4);
    this.scene.start(SCENE_KEYS.WORLD_SCENE, this.scene.settings.data);
  }

  #createAnimations(assetKey) {
    const animations = DataUtils.getAnimations(this);
    if (!animations) {
      console.error("animations data not found! Check animations.json path");
      return;
    }

    animations.forEach((animation) => {
      const frames = animation.frames
        ? this.anims.generateFrameNumbers(assetKey, {
            frames: animation.frames,
          })
        : this.anims.generateFrameNumbers(assetKey);

      const animKey = `${assetKey}_${animation.key}`; // 🔥 FIX

      if (this.anims.exists(animKey)) return; // prevent duplicate

      this.anims.create({
        key: animKey,
        frames: frames,
        frameRate: animation.frameRate,
        repeat: animation.repeat,
        delay: animation.delay,
        yoyo: animation.yoyo,
      });
    });
  }
}
