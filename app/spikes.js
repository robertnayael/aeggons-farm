import LinearlyMovingEntity from './entities/LinearlyMovingEntity';

export default class Spikes extends LinearlyMovingEntity {

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
