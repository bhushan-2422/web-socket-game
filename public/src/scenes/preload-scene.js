import Phaser from "../lib/phaser.js"
import { CHARACTER_ASSET_KEY, WORLD_ASSET_KEYS } from "./asset-keys.js"
import { SCENE_KEYS } from "./scene-keys.js"

export class PreloadScene extends Phaser.Scene{
    constructor(){
        super({
            key: SCENE_KEYS.PRELOAD_SCENE
        })
        console.log(SCENE_KEYS.PRELOAD_SCENE)
    }

    preload(){
        console.log("preload")
        //LOAD WORLD ASSETS
        this.load.image(WORLD_ASSET_KEYS.WORLD_BACKGROUND,'src/assets/images/monster-tamer/map/map5.png')
        this.load.tilemapTiledJSON(WORLD_ASSET_KEYS.WORLD_MAIN_LEVEL,'src/assets/data/myMap.json')
        this.load.image(WORLD_ASSET_KEYS.WORLD_COLLISION, "src/assets/images/monster-tamer/map/collision.png")

        //load character assets
        this.load.spritesheet(CHARACTER_ASSET_KEY.PLAYER,'src/assets/images/axulart/character/custom.png',{
            frameWidth: 64,
            frameHeight: 88
        })
        this.load.spritesheet(CHARACTER_ASSET_KEY.NPC,'src/assets/images/parabellum-games/characters.png',{
            frameWidth: 16,
            frameHeight: 16
        })

        

    }

    create(){
        console.log("create")
        this.scene.start(SCENE_KEYS.WORLD_SCENE)
    }

    
}