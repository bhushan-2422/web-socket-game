import { CHARACTER_ASSET_KEY } from "../../scenes/asset-keys.js";
import { Character } from "./character.js";

export class Player extends Character{
    constructor(config){
        //arg of type playerConfig is not assignable of type characterConfig 
        //property assetKey is missing in playerconfig but require in character config
        super({
            ...config,
            assetKey: CHARACTER_ASSET_KEY.PLAYER,
            assetFrame: 7
        })
    }
}