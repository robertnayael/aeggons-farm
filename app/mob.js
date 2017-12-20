import LinearlyMovingEntity from './entities/LinearlyMovingEntity';

export default class Mob extends LinearlyMovingEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);

    this.is = {
      squashed: false,        // State after one hit from the player
      dead: false,            // State after another hit
      deadAndRemoved: false   // Killed and moved completely out of the visitibility range
    };

    // TODO: Move these to a config file.
    this.squashRecovery = 1000;
    this.directionAfterDeath = -1;
    this.speedAfterDeath = 20 * tileSize;
  }

  /******************************************************************************/

  update(step) {

    if (new Date().getTime() >= this.is.squashed + this.squashRecovery) {
      this.is.squashed = false;
    }

    // Squashed but not dead yet / dead and out of view - do nothing.
    if ((this.is.squashed && !this.is.dead) || this.is.deadAndRemoved) {
      return;
    }

    // Dead, but still not of view
    if (this.is.dead) {
      this.moveOutOfView(step);
      return;
    }

    this.moveAlong(step);

  }

  /******************************************************************************/

  getSprite() {
    if (this.is.deadAndRemoved) return false;

    let variant;

    if (this.is.squashed) {
      variant = 'squashed';
    }
    else {
      variant = 'moving_' + ((this.position.x > this.position.previous.x) ? 'right' : 'left');
    }

    return this.getSpriteFrame(['mobs', variant]);
  }

  /******************************************************************************/

  squash() {
    if (this.is.squashed) this.die();
    this.is.squashed = new Date().getTime();
  }

  /******************************************************************************/

  die() {
    this.is.dead = true;
  }

  /******************************************************************************/

  moveOutOfView(step) {
    this.moveBy((this.speedAfterDeath * this.directionAfterDeath) * step, null);
    if (this.right < 0) {
      this.is.deadAndRemoved = true;
    }
  }

  /******************************************************************************/

}
