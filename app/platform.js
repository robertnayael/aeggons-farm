import LinearlyMovingEntity from './entities/LinearlyMovingEntity';

export default class Platform extends LinearlyMovingEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);
  }

  update(step) {
    this.moveAlong(step);
  }

  getOffset() {
    return {
      x: this.position.previous.x !== null ? (this.position.x - this.position.previous.x) : 0,
      y: this.position.previous.y !== null ? (this.position.y - this.position.previous.y) : 0
    };
  }

  isDirectlyUnder(object) {

    const x1 = this.x,
          y1 = this.y,
          width1 = this.width,
          height1 = this.height,

          x2 = object.x,
          y2 = object.y,
          width2 = object.width,
          height2 = object.height;

    return ((y2 + height2 == y1) && (x2 <= x1 + width1) && (x2 + width2 >= x1));
  }

}
