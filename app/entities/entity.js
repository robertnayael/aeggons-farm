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
    }

    this.dimensions = {
      width: props.width * tileSize,
      height: props.height * tileSize
    }

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

  collidesWith(otherX, otherY, otherWidth, otherHeight) {

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
