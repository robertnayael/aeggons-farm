import AnimatedEntity from './base/AnimatedEntity';

export default class Collectible extends AnimatedEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);
    this.collected = false;
    this.collectedAndDisappeared = false;
    this.spriteVariant = props.variant || 'default';
    this.firstAnimationFrame = props.frame || 0;
  }

  update(step) {
    if (this.collectedAndDisappeared) return;

    /* Normally, sprite frames are only requested for entities within
     * the viewing range. This could cause animations to go out of sync
     * because each collectible can start its animation at
     * a different frame.
     * Solution: store the current frame on every update, and getSprite()
     * will return it if requested.
     */
    if (!this.collected) {
      this.frame = this.getSpriteFrame(
        ['collectibles', this.spriteVariant, 'uncollected'],
        this.firstAnimationFrame
      );
    } else {
      this.frame = this.getSpriteFrame(
        ['collectibles', this.spriteVariant, 'collected'],
        0,
        false
      );
    }

    if (!this.frame) this.collectedAndDisappeared = true;
  }

  getSprite() {
    return this.frame;
  }

  checkInteraction(player) {
    if (!this.collected && this.collidesWith(player)) {
      this.collect();
      return [
        'COLLECTIBLE_COLLECTED',
      ];
    }
  }

  collect() {
    this.startEffect(['collectibles', 'effects', 'collected']);
    this.collected = true;
  }

}
