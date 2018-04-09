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
    return null;
  }

  /******************************************************************************/

  checkInteraction(player) {
    if (this.collidesWith(player) && !player.isInvulnerable) {
      return [
        'SEND_JUMPING_HIGH',
        'HIT'
      ];
    }
  }

  /******************************************************************************/

}
