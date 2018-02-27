import LinearlyMovingEntity from './base/LinearlyMovingEntity';

export default class Mob extends LinearlyMovingEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);

    this.spriteType = props.spriteType;
    this.hurtsPlayer = props.hurtsPlayer;
    this.isKillable = props.killable;
    this.bodyRemovalDirection = props.bodyRemovalDirection;
    this.bodyRemovalDirection = props.bodyRemovalDirection;
    this.isSquashable = props.squashable;
    this.recoversAfter = props.recoversAfter;

    this.is = {
      squashed: false,        // State after one hit from the player
      dead: false,            // State after another hit
      deadAndRemoved: false   // Killed and moved completely out of the visitibility range
    };

    // TODO: Move these to a config file.
    this.directionAfterDeath = -1;
    this.speedAfterDeath = 20 * tileSize;
  }

  /******************************************************************************/

  update(step) {

    if (this.is.squashed && new Date().getTime() >= this.is.squashed + this.recoversAfter) {
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

  checkInteraction(player) {
    if (this.is.dead || !this.collidesWith(player)) {
      return false;
    }


    if (this.isKillable && this.wasJumpedOnBy(player)) {
      this.stomp();
      return [
        'SEND_JUMPING'
      ];
    }

    if (this.hurtsPlayer && !this.is.squashed && this.wasTouchedBy(player)) {
      return [
        'SEND_JUMPING_LOW',
        'HIT',
        'PUSH_AWAY'
      ];
    }
  }

  /******************************************************************************/

  wasJumpedOnBy(player) {
    if (!player.isFalling || player.bottom < this.top) return false;

    /* Squashing only occurs if the player falls within 1/2 of the mob's width,
       so calculate the "squashable" box and check for colission again: */
    const squashbox = {
      x: this.x + this.width/4,
      y: this.y,
      width: this.width/2,
      height: this.height
    };

    return this.collidesWith.call(squashbox, player);
  }

  /******************************************************************************/

  wasTouchedBy(player) {
    if (player.right > this.left && player.right < this.right && !player.isInvulnerable) {
      return 'TOUCHED_FROM_LEFT'
    }

    if (player.left < this.right && player.left > this.left && !player.isInvulnerable) {
      return 'TOUCHED_FROM_RIGHT';
    }
  }

  /******************************************************************************/

  stomp() {
    if (this.isSquashable) {
      if (this.is.squashed) this.die();
      this.is.squashed = new Date().getTime();
    }
    else {
      this.die();
    }
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
