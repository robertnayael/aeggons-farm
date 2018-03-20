export default class Entity {

  constructor(props, tileSize, scale, sprites) {

    this.position = {

      x: props.x * tileSize,
      y: props.y * tileSize,

      previous: {
        x: null,
        y: null
      }
    };

    this.dimensions = {
      width: props.width * tileSize,
      height: props.height * tileSize
    };

    this.updateEdges();

    this.sprites = sprites;

  }

  /******************************************************************************/

  moveTo(x, y) {
    this.position.previous.x = this.position.x;
    this.position.previous.y = this.position.y;
    if (x !== null) this.position.x = x;
    if (y !== null) this.position.y = y;
    this.updateEdges();
  }

  /******************************************************************************/

  moveBy(x, y) {
    this.position.previous.x = this.position.x;
    this.position.previous.y = this.position.y;
    if (x !== null) this.position.x += x;
    if (y !== null) this.position.y += y;
    this.updateEdges();
  }

  /******************************************************************************/

  updateEdges() {
    this.edge = {
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height,
      left: this.x
    };
  }

  /******************************************************************************/

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get width() {
    return this.dimensions.width;
  }

  get height() {
    return this.dimensions.height;
  }

  get top() {
    return this.edge.top;
  }

  get right() {
    return this.edge.right;
  }

  get bottom() {
    return this.edge.bottom;
  }

  get left() {
    return this.edge.left;
  }

  /******************************************************************************/

  collidesWith(object) {

    const x1 = this.x,
          y1 = this.y,
          width1 = this.width,
          height1 = this.height,

          x2 = object.x,
          y2 = object.y,
          width2 = object.width,
          height2 = object.height;

    return !(((x1 + width1 - 1) < x2) ||
             ((x2 + width2 - 1) < x1) ||
             ((y1 + height1 - 1) < y2) ||
             ((y2 + height2 - 1) < y1));
  }

  /******************************************************************************/

}

/******************************************************************************/
