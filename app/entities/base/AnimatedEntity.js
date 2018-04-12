import Entity from './Entity';

export default class AnimatedEntity extends Entity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);

    this.animation = {
      previousVariant: null,
      frameIterator: null,
      firstFrame: (props.firstSpriteFrame ? props.firstSpriteFrame : 0)
    };

    this.effect = {
      frameIterator: null
    }

  }

  startEffect(spriteType, fixedPosition = false) {
    this.effect.frameIterator = this.sprites.getFrameIteratorNoLoop(spriteType);
    if (fixedPosition) {
      this.effect.fixedPosition = {
        x: this.x,
        y: this.y
      };
    }
  }

  getEffectFrame() {
    if (this.effect.frameIterator) {
      const frame = this.effect.frameIterator.next();

      if (this.effect.fixedPosition) {
        frame.value.fixedPosition = this.effect.fixedPosition;
      }

      if (frame.done) {
        this.effect.frameIterator = null;
        this.effect.fixedPosition = null;
      }

      return frame.value;
    }
  }

  getSpriteFrame(spriteType, firstFrame = this.animation.firstFrame, loop = true) {

    const getFrameIterator = loop
      ? this.sprites.getFrameIterator.bind(this.sprites)
      : this.sprites.getFrameIteratorNoLoop.bind(this.sprites);

    // If the variant (ie. last element in spriteType array) has just changed, get a new frame iterator:
    const animationVariant = spriteType[spriteType.length - 1];
    if (animationVariant !== this.animation.previousVariant) {
      this.animation.frameIterator = getFrameIterator(spriteType, firstFrame);
    }
    this.animation.previousVariant = animationVariant;

    const effect = this.getEffectFrame(),
          animation = this.animation.frameIterator.next().value;

    return effect
      ? [animation, effect]
      : animation;

  }

}
