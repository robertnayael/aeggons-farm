import AnimatedEntity from './base/AnimatedEntity';

export default class Collectible extends AnimatedEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);
    this.collected = false;
  }

  update(step) {
    return null;
  }

  getSprite() {
    return null;
  }

  checkInteraction(player) {
    if (this.collidesWith(player)) {
      return [
        'ADD_COLLECTIBLE',
      ];
    }
  }

  collect() {

  }

}
