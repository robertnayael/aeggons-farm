import AnimatedEntity from './base/AnimatedEntity';

export default class Decoration extends AnimatedEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);
    this.type = props.type;
  }

  /******************************************************************************/

  update(step) {
    return null;
  }

  /******************************************************************************/

  getSprite() {
    return this.sprites.getSprite(['decorations', this.type]);
  }

  /******************************************************************************/

}
