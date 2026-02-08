import { DIRECTION } from "../common/direction.js";
import { TILE_SIZE } from "../config.js";
import { exhaustiveGuard } from "./guard.js";

export function getTargetPostionAndDirectionFromGameObject(currentPositon, direction){
    const targetPosition = {...currentPositon}

    switch(direction){
      case DIRECTION.DOWN:
        targetPosition.y += TILE_SIZE;
        break;
      case DIRECTION.UP:
        targetPosition.y -= TILE_SIZE
        break;
      case DIRECTION.LEFT:
        targetPosition.x -= TILE_SIZE
        break;
      case DIRECTION.RIGHT:
        targetPosition.x += TILE_SIZE
        break;
      case DIRECTION.NONE: break;
      default: exhaustiveGuard(direction);
    }

    return targetPosition;
}