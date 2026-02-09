import { DIRECTION } from "../../common/direction.js";

export class Character {
  _scene;
  _phaserGameObject;
  _direction;
  _isMoving;
  _targetPosition;
  _previousTargetPosition;
  _spriteGridMovementFinishedCallback;

  constructor(config) {
    this._scene = config.scene;
    this._direction = config.direction;
    this._isMoving = false;
    this._targetPosition = { ...config.position };
    this._previousTargetPosition = { ...config.position };
    this._phaserGameObject = this._scene.add
      .sprite(
        config.position.x,
        config.position.y,
        config.assetKey,
        config.assetFrame || 0,
      )
      .setOrigin(0);

    this._spriteGridMovementFinishedCallback =
      config.spriteGridMovementFinishedCallback;
  }

  //boolean
  get isMoving() {
    return this._isMoving;
  }

  //direction
  get direction() {
    return this._direction;
  }


  animateTo(x, y, direction) {
    if (direction == DIRECTION.NONE) {
      return;
    }

    this._previousTargetPosition = { ...this._targetPosition };
    this._targetPosition.x = x;
    this._targetPosition.y = y;

    this._scene.add.tween({
      delay: 0,
      duration: 600,
      y: {
        from: this._phaserGameObject.y,
        start: this._phaserGameObject.y,
        to: this._targetPosition.y,
      },
      x: {
        from: this._phaserGameObject.x,
        start: this._phaserGameObject.x,
        to: this._targetPosition.x,
      },
      targets: this._phaserGameObject,

      onComplete: () => {
        this._direction = DIRECTION.NONE
        this._isMoving = false;
        this._previousTargetPosition = { ...this._targetPosition };
        if (this._spriteGridMovementFinishedCallback) {
          this._spriteGridMovementFinishedCallback();
        }
      },
    });
  }

  destroy() {
    this._phaserGameObject.destroy();
  }
}
