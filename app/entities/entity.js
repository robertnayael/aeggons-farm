export default class Entity {

  constructor(props, tileSize, scale) {

    this.position = {

      x: props.x * tileSize,
      y: props.y * tileSize,

      previous: {
        x: null,
        y: null
      },

      overwrite: function(x, y) {
        this.previous.x = this.x;
        this.previous.y = this.y;
        if (x !== null) this.x = x;
        if (y !== null)this.y = y;
      },

      offset: function(x, y) {
        this.previous.x = this.x;
        this.previous.y = this.y;
        if (x !== null) this.x += x;
        if (y !== null)this.y += y;
      }
    };

    this.dimensions = {
      width: props.width * tileSize,
      height: props.height * tileSize
    };

  }

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

}

/******************************************************************************/



/******************************************************************************/



/******************************************************************************/



/******************************************************************************/
/******************************************************************************/

/*class Mob extends LinearlyMovingEntity {}

class Spike extends AnimatedEntity {}

class Collectible extends AnimatedEntity {}*/
