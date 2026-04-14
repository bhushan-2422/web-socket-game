import { fireAndSmokeArray } from "../utils/damage.js";

// import { DIRECTION } from "../../public/src/common/direction";
const DIRECTION = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  UP: "UP",
  DOWN: "DOWN",
  NONE: "NONE",
};

const TILE_SIZE = 64;

class Player {
  constructor(socket, playerName, roomId) {
    this.id = socket.id;
    this.name = playerName;
    this.roomId = roomId;
    this.currPosition = { x: 1600, y: 1600 };
    this.x = 1600;
    this.y = 1600;
    this.direction = "DOWN";

    this.health = 100;
    this.tookDamage = false;
    this.lastDamageTime = Date.now();
  }

  changePosition(currPosition, direction) {
    //<------------IMP----------------->
    //as collision detection is in user side so how will i handle movement from server
    //as when i click arrow server calculates next position and stores that states in player DS
    //so initialize new property i.e currPosition
    //when server calculates next postion it is based on currPosition
    //and send new x and y to user
    //user validates collision logic and if not collidable then ubdate target position
    //and send that target postion to server as currPosition
    //if object was collidable then currPosition does not change and again server calculates next positon
    //on the basis of currPosition
    this.currPosition.x = currPosition.x;
    this.currPosition.y = currPosition.y;

    const { x, y } = this.#calculateNextPosition(direction);
    if (this.x == x && this.y == y) return;
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  #calculateNextPosition(direction) {
    switch (direction) {
      case DIRECTION.UP:
        return { x: this.currPosition.x, y: this.currPosition.y - TILE_SIZE };
      case DIRECTION.DOWN:
        return { x: this.currPosition.x, y: this.currPosition.y + TILE_SIZE };
      case DIRECTION.LEFT:
        return { x: this.currPosition.x - TILE_SIZE, y: this.currPosition.y };
      case DIRECTION.RIGHT:
        return { x: this.currPosition.x + TILE_SIZE, y: this.currPosition.y };
    }
  }

  checkDamage(now) {
    for (const fireAndSmoke of fireAndSmokeArray) {
      if (
        this.currPosition.x >= fireAndSmoke.x * TILE_SIZE &&
        this.currPosition.y >= fireAndSmoke.y * TILE_SIZE &&
        this.currPosition.x <
          (fireAndSmoke.x + fireAndSmoke.width) * TILE_SIZE &&
        this.currPosition.y < (fireAndSmoke.y + fireAndSmoke.height) * TILE_SIZE
      ) {
        this.tookDamage = true;
        if (now - this.lastDamageTime >= 1000) {
          this.health -= fireAndSmoke.damage;
          this.lastDamageTime = now;
        }
        break;
      } else {
        this.tookDamage = false;
      }
    }
    this.health = Math.max(this.health, 0);
  }
}

export { Player };
