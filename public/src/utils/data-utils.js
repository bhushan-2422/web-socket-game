import Phaser from '../lib/phaser.js';
import { DATA_ASSET_KEYS } from '../scenes/asset-keys.js';

export class DataUtils {

  static getAnimations(scene) {
   
    const data = scene.cache.json.get(DATA_ASSET_KEYS.ANIMATIONS);
    return data;
  }
}