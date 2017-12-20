import Entity from './entity';

export default class AnimatedEntity extends Entity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale);

    this.animation = {
      previousVariant: null,
      frameIterator: null,
      firstFrame: (props.firstSpriteFrame ? props.firstSpriteFrame : 0)
    };

    this.sprites = sprites;
  }

  getSpriteFrame(spriteType, firstFrame = this.animation.firstFrame) {

    const animationVariant = spriteType[spriteType.length - 1];

    if (animationVariant !== this.animation.previousVariant) {
      this.animation.frameIterator = this.sprites.getFrameIterator(spriteType, firstFrame);
    }

    this.animation.previousVariant = animationVariant;
    return this.animation.frameIterator.next().value;

  }

}
