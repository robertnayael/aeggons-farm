import LinearlyMovingEntity from './base/LinearlyMovingEntity';

export default class Mob extends LinearlyMovingEntity {

  constructor(props, tileSize, scale, sprites) {
    super(props, tileSize, scale, sprites);

    this.spriteType = props.spriteType;
    this.hurtsPlayer = props.hurtsPlayer;
    this.isKillable = props.killable;
    this.isSquashable = props.squashable;
    this.recoversAfter = props.recoversAfter;
    this.mapBounds = props.mapBounds;

    this.is = {
      squashed: false,        // State after one hit from the player
      dead: false,            // State after another hit
      deadAndRemoved: false   // Killed and moved completely out of the visitibility range
    };

    this.bodyRemovalDelay = props.bodyRemovalDelay;
    this.directionAfterDeath = this.bodyRemovalVector(props.bodyRemovalDirection);
    this.speedAfterDeath = props.bodyRemovalSpeed * tileSize;
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

    if (this.is.dead) {
      variant = 'dead';
    }
    else if (this.is.squashed) {
      variant = 'squashed';
    }
    else {
      variant = 'moving_' + ((this.position.x > this.position.previous.x) ? 'right' : 'left');
    }

    return this.getSpriteFrame(['mobs', this.spriteType, variant]);
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
    return this.collidesWith(player);
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
    this.startEffect(['mobs', 'effect_hit'], true);
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
    this.bodyRemovalDelay -= step;
    if (this.bodyRemovalDelay > 0) return;

    const vector = [this.directionAfterDeath.x, this.directionAfterDeath.y]
      .map(v => v * this.speedAfterDeath * step);

    this.moveBy(...vector);

    if (this.bottom < this.mapBounds.top
      || this.top > this.mapBounds.bottom
      || this.right < this.mapBounds.left
      || this.left > this.mapBounds.right
    ) {
      this.is.deadAndRemoved = true;
    }
  }

  /******************************************************************************/

  bodyRemovalVector(direction) {
    switch (direction) {
      case 'down': return { x: 0, y: 1 };
      case 'sideways': return { x: 1, y: 0 };
    }
  }

  /******************************************************************************/

}
