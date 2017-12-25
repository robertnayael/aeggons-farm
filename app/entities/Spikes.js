import AnimatedEntity from './base/AnimatedEntity';

export default class Spikes extends AnimatedEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);
  }

  /******************************************************************************/

  update(step) {
    return null;
  }

  /******************************************************************************/

  getSprite() {
    return this.getSpriteFrame('spikes');
  }

  /******************************************************************************/

}
