import LinearlyMovingEntity from './entities/LinearlyMovingEntity';

export default class Platform extends LinearlyMovingEntity {

  constructor(props, tileSize) {
    super(props, tileSize);
  }

  update(step) {
    this.moveAlong(step);
  }

  getOffset() {
    return {
      x: this.position.x - this.position.previous.x,
      y: this.position.y - this.position.previous.y
    };
  }

  isDirectlyUnder(otherX, otherY, otherWidth, otherHeight) {

  }

}
