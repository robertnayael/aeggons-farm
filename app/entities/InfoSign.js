import Entity from './base/Entity';

/******************************************************************************/

export default class InfoSign extends Entity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale);

    this.active = false;
    this.activeSince = null;
  }

}
