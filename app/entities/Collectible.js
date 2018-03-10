import AnimatedEntity from './base/AnimatedEntity';

export default class Collectible extends AnimatedEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);
    this.collected = false;
    this.spriteVariant = props.variant || 'default';
    this.firstAnimationFrame = props.frame || 0;
  }

  update(step) {
    /* Normally, sprite frames are only requested for entities within
     * the viewing range. This could cause animations to go out of sync
     * because each collectible can start its animation at
     * a different frame.
     * Solution: store the current frame on every update, and getSprite()
     * will return it if requested.
     */
    this.frame = this.getSpriteFrame(
      ['collectibles', this.spriteVariant, 'uncollected'],
      this.firstAnimationFrame
    );
  }

  getSprite() {
    return this.frame;
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
