import { DIRECTION } from "../../common/direction.js";
import { CHARACTER_ASSET_KEY } from "../../scenes/asset-keys.js";
import { exhaustiveGuard } from "../../utils/guard.js";
import { Character } from "./character.js";
import { TILE_SIZE } from "../../config.js";

export class Player extends Character {
    constructor(config) {
        //arg of type playerConfig is not assignable of type characterConfig 
        //property assetKey is missing in playerconfig but require in character config
        super({
            ...config,
            assetKey: CHARACTER_ASSET_KEY.PLAYER,
            assetFrame: 7
        });

    }

    moveCharacter(direction) {
    this._direction = direction; // ✅ set it first

    let targetX = this._phaserGameObject.x;
    let targetY = this._phaserGameObject.y;
    switch (direction) {
        case DIRECTION.UP:    targetY -= TILE_SIZE; break;
        case DIRECTION.DOWN:  targetY += TILE_SIZE; break;
        case DIRECTION.LEFT:  targetX -= TILE_SIZE; break;
        case DIRECTION.RIGHT: targetX += TILE_SIZE; break;
    }

    super.animateTo(targetX, targetY, direction);

    switch (this._direction) {
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