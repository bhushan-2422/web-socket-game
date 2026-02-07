import { DIRECTION } from "../common/direction.js";
import Phaser from "../lib/phaser.js";
import { Controls } from "../utils/controls.js";
import { Player } from "../world/characters/player.js";
import { WORLD_ASSET_KEYS } from "./asset-keys.js";
import { SCENE_KEYS } from "./scene-keys.js";

const TILE_SIZE = 64
const PLAYER_POSITION = Object.freeze({
    x: 1 * TILE_SIZE,
    y: 1 * TILE_SIZE
})

export class WorldScene extends Phaser.Scene{
    #player;
    #controls;
    constructor(){
        super({
            key: SCENE_KEYS.WORLD_SCENE
        })
    }

    create(){
        this.add.image(0,0, WORLD_ASSET_KEYS.WORLD_BACKGROUND,0).setOrigin(0);

        this.#player = new Player({
            scene: this,
            position: PLAYER_POSITION,
            direction: DIRECTION.DOWN
        })

        this.#controls = new Controls(this)
    }

    update(){
        const selectedDirection = this.#controls.getDirectionKeyJustPressed();
        if(selectedDirection != DIRECTION.NONE){
            this.#player.moveCharacter(selectedDirection)
        }
    }
}