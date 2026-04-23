import { DIRECTION } from "../../common/direction.js";
import { CHARACTER_ASSET_KEY } from "../../scenes/asset-keys.js";
import { exhaustiveGuard } from "../../utils/guard.js";
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


    moveCharacter(x, y, direction) {
        super.animateTo(x, y, direction);

        switch (direction) {
            case DIRECTION.DOWN:
            case DIRECTION.LEFT:
            case DIRECTION.RIGHT:
            case DIRECTION.UP:
                if (!this._phaserGameObject.anims.isPlaying ||
                    this._phaserGameObject.anims.currentAnim?.key !== `PLAYER_${this._direction}`) {
                    this._phaserGameObject.play(`PLAYER_${this._direction}`); // ✅ use _direction
                }
                break;
            case DIRECTION.NONE:
                this._phaserGameObject.anims.stop(); // ✅ stop animation when idle
                break;
            default:
                exhaustiveGuard(this._direction);
        }
    }
}