import AnimatedEntity from './base/AnimatedEntity';

export default class Collectible extends AnimatedEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);
    this.collected = false;
    this.collectedAndDisappeared = false;

    this.type = props.type;
    this.spriteVariant = props.variant || 'default';
    this.collectedEffect = props.collectedEffect;
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
        ['collectibles', this.type, this.spriteVariant, 'uncollected'],
        this.firstAnimationFrame
      );
    } else {
      this.frame = this.getSpriteFrame(
        ['collectibles', this.type, this.spriteVariant, 'collected'],
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
    this.startEffect(['collectibles', 'effects', this.collectedEffect]);
    this.collected = true;
  }

}
