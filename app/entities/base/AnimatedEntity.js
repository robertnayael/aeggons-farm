import Entity from './Entity';

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

  startEffect(spriteType) {
    this.effectIterator = this.sprites.getFrameIteratorNoLoop(spriteType);
  }

  getEffectFrame() {
    if (this.effectIterator) {
      const frame = this.effectIterator.next();
      if (frame.done) this.effectIterator = null;
      return frame.value;
    }
  }

  getSpriteFrame(spriteType, firstFrame = this.animation.firstFrame) {

    const animationVariant = spriteType[spriteType.length - 1];
    if (animationVariant !== this.animation.previousVariant) {
      this.animation.frameIterator = this.sprites.getFrameIterator(spriteType, firstFrame);
    }
    this.animation.previousVariant = animationVariant;

    const effect = this.getEffectFrame(),
          animation = this.animation.frameIterator.next().value;
    
    return effect
      ? [animation, effect]
      : animation;

  }

}
